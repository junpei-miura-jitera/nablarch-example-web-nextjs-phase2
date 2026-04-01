// @ts-nocheck
import fs from "node:fs";
import path from "node:path";

/**
 * DOM impact analyzer (hypothesis-driven).
 *
 * Steps:
 * 1) "Render" JSP to pseudo-HTML snapshots (template-level approximation).
 * 2) Build an element index from snapshot HTML.
 * 3) Parse JS selectors/events and map impacted pages/elements.
 * 4) Decide "single-use" vs "shared-component" candidates.
 */

const DEFAULT_JSP_DIR = "src/main/webapp/WEB-INF/view";
const DEFAULT_JS_DIR = "src/main/webapp/javascripts";
const DEFAULT_OUTPUT_DIR = "migration/dom-impact";
const JS_SKIP_DIRS = new Set(["lib", "jquery-ui-i18n"]);

function toPascalCase(text: string): string {
  return text
    .replace(/\.[^.]+$/, "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join("");
}

type SelectorType = "id" | "name" | "class" | "unknown";

type JsSelectorBinding = {
  jsFile: string;
  line: number;
  selectorRaw: string;
  selectorType: SelectorType;
  selectorValue: string;
  event: string;
  raw: string;
};

type HtmlElementRef = {
  tag: string;
  line: number;
  id?: string;
  name?: string;
  classes: string[];
  raw: string;
};

type PageIndex = {
  jspFile: string;
  snapshotFile: string;
  elements: HtmlElementRef[];
};

type ImpactItem = {
  binding: JsSelectorBinding;
  impactedPages: Array<{
    jspFile: string;
    snapshotFile: string;
    matchedElements: HtmlElementRef[];
  }>;
  impactScope: "single" | "multiple" | "none";
  recommendation:
    | "single-component"
    | "shared-component"
    | "stateful-hook"
    | "manual-review";
};

type Report = {
  generatedAt: string;
  input: {
    jspDir: string;
    jsDir: string;
  };
  summary: {
    jspFiles: number;
    jsFiles: number;
    bindings: number;
    singleScope: number;
    multipleScope: number;
    noScope: number;
  };
  impacts: ImpactItem[];
};

type HtmlEstimationDoc = {
  generatedAt: string;
  pages: Array<{
    jspFile: string;
    snapshotFile: string;
    elementCount: number;
    ids: string[];
    names: string[];
    classes: string[];
  }>;
};

type JsHtmlMapperDoc = {
  generatedAt: string;
  mapper: Array<{
    selector: string;
    event: string;
    source: string;
    scope: ImpactItem["impactScope"];
    recommendation: ImpactItem["recommendation"];
    targets: Array<{
      jspFile: string;
      snapshotFile: string;
      matchedCount: number;
      matched: Array<{
        tag: string;
        line: number;
        id?: string;
        name?: string;
        classes: string[];
      }>;
    }>;
  }>;
};

function walkFiles(targetDir: string, extension: string, skipDirs = new Set<string>()): string[] {
  if (!fs.existsSync(targetDir)) return [];
  const out: string[] = [];
  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) continue;
      out.push(...walkFiles(full, extension, skipDirs));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(extension)) {
      out.push(full);
    }
  }
  return out;
}

function lineNumberAt(content: string, index: number): number {
  return content.slice(0, index).split("\n").length;
}

function shrink(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, 220);
}

function getAttr(tagText: string, attr: string): string | undefined {
  const m = tagText.match(new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`));
  return m?.[1];
}

function sanitizeToPseudoHtml(jsp: string): string {
  let out = jsp;

  // Remove JSP directives/scriptlets/comments.
  out = out.replace(/<%@[\s\S]*?%>/g, "");
  out = out.replace(/<%--[\s\S]*?--%>/g, "");
  out = out.replace(/<%(?!@)[\s\S]*?%>/g, "");

  // Replace EL with placeholders.
  out = out.replace(/\$\{[\s\S]*?\}/g, "__EL__");

  // Approximate Nablarch tags to basic HTML.
  out = out.replace(/<n:form\b/g, "<form");
  out = out.replace(/<\/n:form>/g, "</form>");
  out = out.replace(/<n:a\b/g, "<a");
  out = out.replace(/<\/n:a>/g, "</a>");
  out = out.replace(/<n:submit\b/g, "<button");
  out = out.replace(/<\/n:submit>/g, "</button>");
  out = out.replace(/<n:text\b/g, "<input type=\"text\"");
  out = out.replace(/<\/n:text>/g, "");
  out = out.replace(/<n:textarea\b/g, "<textarea");
  out = out.replace(/<\/n:textarea>/g, "</textarea>");
  out = out.replace(/<n:select\b/g, "<select");
  out = out.replace(/<\/n:select>/g, "</select>");
  out = out.replace(/<n:plainHidden\b/g, "<input type=\"hidden\"");
  out = out.replace(/<\/n:plainHidden>/g, "");
  out = out.replace(/<n:include\b[\s\S]*?\/>/g, "");
  out = out.replace(/<n:error\b[\s\S]*?\/>/g, "");
  out = out.replace(/<n:errors\b[\s\S]*?\/>/g, "");

  // Remove control tags but keep inner content.
  out = out.replace(/<\/?n:forInputPage\b[^>]*>/g, "");
  out = out.replace(/<\/?n:forConfirmationPage\b[^>]*>/g, "");
  out = out.replace(/<\/?c:if\b[^>]*>/g, "");
  out = out.replace(/<\/?c:forEach\b[^>]*>/g, "");

  return out;
}

function extractElementsFromHtml(html: string): HtmlElementRef[] {
  const pattern = /<(button|a|input|select|textarea|form)\b[\s\S]*?>/gi;
  const elements: HtmlElementRef[] = [];
  for (const match of html.matchAll(pattern)) {
    const raw = match[0];
    const id = getAttr(raw, "id");
    const name = getAttr(raw, "name");
    const classAttr = getAttr(raw, "class") ?? "";
    const classes = classAttr
      .split(/\s+/)
      .map((x) => x.trim())
      .filter(Boolean);

    elements.push({
      tag: match[1],
      line: lineNumberAt(html, match.index ?? 0),
      id,
      name,
      classes,
      raw: shrink(raw),
    });
  }
  return elements;
}

function detectSelectorType(selector: string): { type: SelectorType; value: string } {
  const s = selector.trim();
  if (s.startsWith("#")) return { type: "id", value: s.slice(1) };
  if (s.startsWith(".")) return { type: "class", value: s.slice(1) };
  const nameMatch = s.match(/\[\s*name\s*=\s*['"]([^"']+)['"]\s*\]/);
  if (nameMatch) return { type: "name", value: nameMatch[1] };
  return { type: "unknown", value: s };
}

function parseJsBindings(js: string, jsFileRel: string): JsSelectorBinding[] {
  const out: JsSelectorBinding[] = [];

  const jqueryDirect = /\$\(\s*['"]([^"']+)['"]\s*\)\.(click|change|submit)\s*\(/g;
  const jqueryOn = /\$\(\s*['"]([^"']+)['"]\s*\)\.on\(\s*['"]([^"']+)['"]/g;
  const domQuery = /document\.querySelector(All)?\(\s*['"]([^"']+)['"]\s*\)\.addEventListener\(\s*['"]([^"']+)['"]/g;
  const domById = /document\.getElementById\(\s*['"]([^"']+)['"]\s*\)\.addEventListener\(\s*['"]([^"']+)['"]/g;

  for (const m of js.matchAll(jqueryDirect)) {
    const selectors = m[1].split(",").map((x) => x.trim());
    for (const selector of selectors) {
      const parsed = detectSelectorType(selector);
      out.push({
        jsFile: jsFileRel,
        line: lineNumberAt(js, m.index ?? 0),
        selectorRaw: selector,
        selectorType: parsed.type,
        selectorValue: parsed.value,
        event: m[2],
        raw: shrink(m[0]),
      });
    }
  }

  for (const m of js.matchAll(jqueryOn)) {
    const selectors = m[1].split(",").map((x) => x.trim());
    for (const selector of selectors) {
      const parsed = detectSelectorType(selector);
      out.push({
        jsFile: jsFileRel,
        line: lineNumberAt(js, m.index ?? 0),
        selectorRaw: selector,
        selectorType: parsed.type,
        selectorValue: parsed.value,
        event: m[2],
        raw: shrink(m[0]),
      });
    }
  }

  for (const m of js.matchAll(domQuery)) {
    const selector = m[2];
    const parsed = detectSelectorType(selector);
    out.push({
      jsFile: jsFileRel,
      line: lineNumberAt(js, m.index ?? 0),
      selectorRaw: selector,
      selectorType: parsed.type,
      selectorValue: parsed.value,
      event: m[3],
      raw: shrink(m[0]),
    });
  }

  for (const m of js.matchAll(domById)) {
    out.push({
      jsFile: jsFileRel,
      line: lineNumberAt(js, m.index ?? 0),
      selectorRaw: `#${m[1]}`,
      selectorType: "id",
      selectorValue: m[1],
      event: m[2],
      raw: shrink(m[0]),
    });
  }

  return out;
}

function matchElements(elements: HtmlElementRef[], binding: JsSelectorBinding): HtmlElementRef[] {
  if (binding.selectorType === "id") {
    return elements.filter((el) => el.id === binding.selectorValue);
  }
  if (binding.selectorType === "name") {
    return elements.filter((el) => el.name === binding.selectorValue);
  }
  if (binding.selectorType === "class") {
    return elements.filter((el) => el.classes.includes(binding.selectorValue));
  }
  return [];
}

function decideRecommendation(
  scope: ImpactItem["impactScope"],
  binding: JsSelectorBinding
): ImpactItem["recommendation"] {
  if (scope === "none") return "manual-review";
  if (scope === "single") return "single-component";
  if (binding.selectorType === "class") return "shared-component";
  return "stateful-hook";
}

function buildHtmlEstimationDoc(pageIndexes: PageIndex[]): HtmlEstimationDoc {
  return {
    generatedAt: new Date().toISOString(),
    pages: pageIndexes.map((page) => {
      const idSet = new Set<string>();
      const nameSet = new Set<string>();
      const classSet = new Set<string>();
      for (const el of page.elements) {
        if (el.id) idSet.add(el.id);
        if (el.name) nameSet.add(el.name);
        for (const cls of el.classes) classSet.add(cls);
      }
      return {
        jspFile: page.jspFile,
        snapshotFile: page.snapshotFile,
        elementCount: page.elements.length,
        ids: [...idSet].sort(),
        names: [...nameSet].sort(),
        classes: [...classSet].sort(),
      };
    }),
  };
}

function buildJsHtmlMapperDoc(impacts: ImpactItem[]): JsHtmlMapperDoc {
  return {
    generatedAt: new Date().toISOString(),
    mapper: impacts.map((impact) => ({
      selector: impact.binding.selectorRaw,
      event: impact.binding.event,
      source: `${impact.binding.jsFile}:${impact.binding.line}`,
      scope: impact.impactScope,
      recommendation: impact.recommendation,
      targets: impact.impactedPages.map((page) => ({
        jspFile: page.jspFile,
        snapshotFile: page.snapshotFile,
        matchedCount: page.matchedElements.length,
        matched: page.matchedElements.map((m) => ({
          tag: m.tag,
          line: m.line,
          id: m.id,
          name: m.name,
          classes: m.classes,
        })),
      })),
    })),
  };
}

function buildMapperMarkdown(mapperDoc: JsHtmlMapperDoc): string {
  const lines: string[] = [];
  lines.push("# JS to HTML Mapper");
  lines.push("");
  lines.push(`Generated at: ${mapperDoc.generatedAt}`);
  lines.push("");

  for (const item of mapperDoc.mapper) {
    lines.push(`## ${item.selector} (${item.event})`);
    lines.push(`- source: \`${item.source}\``);
    lines.push(`- scope: \`${item.scope}\``);
    lines.push(`- recommendation: \`${item.recommendation}\``);
    if (item.targets.length === 0) {
      lines.push("- targets: none");
      lines.push("");
      continue;
    }
    lines.push("- targets:");
    for (const target of item.targets) {
      lines.push(`  - \`${target.jspFile}\` (${target.matchedCount} matches)`);
      lines.push(`    - snapshot: \`${target.snapshotFile}\``);
      for (const matched of target.matched.slice(0, 5)) {
        const identity = matched.id ?? matched.name ?? "(no id/name)";
        lines.push(`    - \`${matched.tag}\` line ${matched.line} id/name: ${identity}`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}

function parseCliArgs(argv: string[]): {
  jspDir?: string;
  jsDir?: string;
  outDir?: string;
} {
  const rest = argv.slice(2);
  const positional: string[] = [];
  let outDir: string | undefined;

  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (token === "--out" || token === "--output-dir") {
      outDir = rest[i + 1];
      i += 1;
      continue;
    }
    if (token.startsWith("--out=")) {
      outDir = token.slice("--out=".length);
      continue;
    }
    if (token.startsWith("--output-dir=")) {
      outDir = token.slice("--output-dir=".length);
      continue;
    }
    positional.push(token);
  }

  return {
    jspDir: positional[0],
    jsDir: positional[1],
    outDir: outDir ?? positional[2],
  };
}

function run(): void {
  const cwd = process.cwd();
  const args = parseCliArgs(process.argv);
  const jspDir = path.resolve(cwd, args.jspDir ?? DEFAULT_JSP_DIR);
  const jsDir = path.resolve(cwd, args.jsDir ?? DEFAULT_JS_DIR);
  const outDir = path.resolve(cwd, args.outDir ?? DEFAULT_OUTPUT_DIR);

  const jspFiles = walkFiles(jspDir, ".jsp");
  const jsFiles = walkFiles(jsDir, ".js", JS_SKIP_DIRS);
  fs.mkdirSync(outDir, { recursive: true });
  const snapshotsDir = path.join(outDir, "snapshots");
  fs.mkdirSync(snapshotsDir, { recursive: true });

  const pageIndexes: PageIndex[] = [];
  for (const jspFile of jspFiles) {
    const rel = path.relative(cwd, jspFile);
    const jsp = fs.readFileSync(jspFile, "utf8");
    const pseudo = sanitizeToPseudoHtml(jsp);
    const snapshotName = `${toPascalCase(rel)}.html`;
    const snapshotFile = path.join(snapshotsDir, snapshotName);
    fs.writeFileSync(snapshotFile, pseudo, "utf8");
    pageIndexes.push({
      jspFile: rel,
      snapshotFile: path.relative(cwd, snapshotFile),
      elements: extractElementsFromHtml(pseudo),
    });
  }

  const bindings: JsSelectorBinding[] = [];
  for (const jsFile of jsFiles) {
    const rel = path.relative(cwd, jsFile);
    const js = fs.readFileSync(jsFile, "utf8");
    bindings.push(...parseJsBindings(js, rel));
  }

  const impacts: ImpactItem[] = bindings.map((binding) => {
    const impactedPages = pageIndexes
      .map((page) => {
        const matchedElements = matchElements(page.elements, binding);
        return {
          jspFile: page.jspFile,
          snapshotFile: page.snapshotFile,
          matchedElements,
        };
      })
      .filter((x) => x.matchedElements.length > 0);

    let impactScope: ImpactItem["impactScope"] = "none";
    if (impactedPages.length === 1) impactScope = "single";
    else if (impactedPages.length > 1) impactScope = "multiple";

    return {
      binding,
      impactedPages,
      impactScope,
      recommendation: decideRecommendation(impactScope, binding),
    };
  });

  const report: Report = {
    generatedAt: new Date().toISOString(),
    input: {
      jspDir: path.relative(cwd, jspDir),
      jsDir: path.relative(cwd, jsDir),
    },
    summary: {
      jspFiles: jspFiles.length,
      jsFiles: jsFiles.length,
      bindings: impacts.length,
      singleScope: impacts.filter((i) => i.impactScope === "single").length,
      multipleScope: impacts.filter((i) => i.impactScope === "multiple").length,
      noScope: impacts.filter((i) => i.impactScope === "none").length,
    },
    impacts,
  };

  const reportPath = path.join(outDir, "dom-impact-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

  const htmlEstimationDoc = buildHtmlEstimationDoc(pageIndexes);
  const htmlEstimationPath = path.join(outDir, "estimated-html-index.json");
  fs.writeFileSync(htmlEstimationPath, JSON.stringify(htmlEstimationDoc, null, 2), "utf8");

  const jsHtmlMapperDoc = buildJsHtmlMapperDoc(impacts);
  const jsHtmlMapperPath = path.join(outDir, "js-html-mapper.json");
  fs.writeFileSync(jsHtmlMapperPath, JSON.stringify(jsHtmlMapperDoc, null, 2), "utf8");

  const mapperMarkdownPath = path.join(outDir, "js-html-mapper.md");
  fs.writeFileSync(mapperMarkdownPath, buildMapperMarkdown(jsHtmlMapperDoc), "utf8");

  console.log(`JSP files: ${report.summary.jspFiles}`);
  console.log(`JS files: ${report.summary.jsFiles}`);
  console.log(`Bindings: ${report.summary.bindings}`);
  console.log(`Single scope: ${report.summary.singleScope}`);
  console.log(`Multiple scope: ${report.summary.multipleScope}`);
  console.log(`No scope: ${report.summary.noScope}`);
  console.log(`Report: ${path.relative(cwd, reportPath)}`);
  console.log(`Snapshots: ${path.relative(cwd, snapshotsDir)}`);
  console.log(`Estimated HTML index: ${path.relative(cwd, htmlEstimationPath)}`);
  console.log(`JS-HTML mapper: ${path.relative(cwd, jsHtmlMapperPath)}`);
  console.log(`Mapper markdown: ${path.relative(cwd, mapperMarkdownPath)}`);
}

run();
