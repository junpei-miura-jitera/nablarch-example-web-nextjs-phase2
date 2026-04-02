#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

/**
 * JSP-first candidate generator.
 *
 * Input:
 *  - JSP directory (default: src/main/webapp/WEB-INF/view)
 *  - JS directory  (default: src/main/webapp/javascripts)
 *
 * Output:
 *  - Per-page TSX candidate files
 *  - JS binding index JSON
 *  - Conversion report JSON
 */
const DEFAULT_JSP_DIR = "src/main/webapp/WEB-INF/view";
const DEFAULT_JS_DIR = "src/main/webapp/javascripts";
const DEFAULT_OUTPUT_DIR = "migration/jsp-first-candidates";
const JS_SKIP_DIRS = new Set(["lib", "jquery-ui-i18n"]);

function toPascalCase(text) {
  return text
    .replace(/\.[^.]+$/, "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join("");
}

function walkFiles(targetDir, extension, skipDirs = new Set()) {
  const results = [];
  if (!fs.existsSync(targetDir)) return results;

  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) continue;
      results.push(...walkFiles(fullPath, extension, skipDirs));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(extension)) {
      results.push(fullPath);
    }
  }
  return results;
}

function lineNumberAt(content, index) {
  return content.slice(0, index).split("\n").length;
}

function getAttr(tagText, attr) {
  const m = tagText.match(new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`));
  return m?.[1];
}

function shrink(raw) {
  return raw.replace(/\s+/g, " ").trim().slice(0, 220);
}

function extractJspElements(jspContent) {
  const pattern = /<(n:submit|n:a|button|a|input)\b[\s\S]*?>/gi;
  const elements = [];
  for (const match of jspContent.matchAll(pattern)) {
    const raw = match[0];
    const tag = match[1];
    const typeAttr = getAttr(raw, "type");
    if (tag === "input" && typeAttr !== "button" && typeAttr !== "submit") {
      continue;
    }
    const id = getAttr(raw, "id");
    const name = getAttr(raw, "name");
    const href = getAttr(raw, "href");
    const uri = getAttr(raw, "uri");
    const value = getAttr(raw, "value");
    if (!id && !name && !href && !uri) continue;
    elements.push({
      tag,
      line: lineNumberAt(jspContent, match.index ?? 0),
      id,
      name,
      href,
      uri,
      value,
      raw: shrink(raw),
    });
  }
  return elements;
}

function extractJspLogic(jspContent) {
  const patterns = [
    { kind: "c:if", pattern: /<c:if\b[\s\S]*?>/gi },
    { kind: "c:forEach", pattern: /<c:forEach\b[\s\S]*?>/gi },
    { kind: "n:forInputPage", pattern: /<n:forInputPage\b[\s\S]*?>/gi },
    { kind: "n:forConfirmationPage", pattern: /<n:forConfirmationPage\b[\s\S]*?>/gi },
    { kind: "scriptlet", pattern: /<%(?!@)[\s\S]*?%>/gi },
  ];
  const logic = [];
  for (const item of patterns) {
    for (const match of jspContent.matchAll(item.pattern)) {
      logic.push({
        kind: item.kind,
        line: lineNumberAt(jspContent, match.index ?? 0),
        raw: shrink(match[0]),
      });
    }
  }
  logic.sort((a, b) => a.line - b.line);
  return logic;
}

function parseIdList(raw) {
  return raw
    .split(",")
    .map((s) => s.trim().replace(/^#/, ""))
    .filter(Boolean);
}

function extractJsBindings(filePath, jsContent, cwd) {
  const rel = path.relative(cwd, filePath);
  const bindings = [];

  const patterns = [
    {
      // $("#a,#b").click(...)
      pattern: /\$\(\s*['"]#([^"']+)['"]\s*\)\.(click|change|submit)\s*\(/g,
      kind: "jquery",
    },
    {
      // $("#a").on("click", ...)
      pattern: /\$\(\s*['"]#([^"']+)['"]\s*\)\.on\(\s*['"]([^"']+)['"]/g,
      kind: "jquery",
    },
    {
      // document.querySelector("#a").addEventListener("click", ...)
      pattern:
        /document\.querySelector\(\s*['"]#([^"']+)['"]\s*\)\.addEventListener\(\s*['"]([^"']+)['"]/g,
      kind: "dom",
    },
    {
      // document.getElementById("a").addEventListener("click", ...)
      pattern:
        /document\.getElementById\(\s*['"]([^"']+)['"]\s*\)\.addEventListener\(\s*['"]([^"']+)['"]/g,
      kind: "dom",
    },
  ];

  for (const item of patterns) {
    for (const match of jsContent.matchAll(item.pattern)) {
      const idList = parseIdList(match[1]);
      const event = match[2];
      for (const id of idList) {
        bindings.push({
          file: rel,
          line: lineNumberAt(jsContent, match.index ?? 0),
          selectorType: "id",
          selectorValue: id,
          event,
          kind: item.kind,
          raw: shrink(match[0]),
        });
      }
    }
  }
  return bindings;
}

function createTsxForPage(componentName, page) {
  const handlers = [];
  for (const item of page.mapping.byId) {
    for (const h of item.handlers) {
      handlers.push(
        `    { id: "${item.id}", event: "${h.event}", source: "${h.file}:${h.line}" },`
      );
    }
  }

  const elements = page.elements.map((el) => {
    const label = el.value || el.id || el.name || el.tag;
    return `        <li><code>${label}</code> (line ${el.line})</li>`;
  });

  const logicNotes = page.logic
    .slice(0, 12)
    .map((l) => `// - ${l.kind} at line ${l.line}: ${l.raw}`);

  return `import { useEffect } from "react";

// JSP-first candidate generated from:
// ${page.file}
export function ${componentName}() {
  const mappedHandlers = [
${handlers.length ? handlers.join("\n") : "    // No direct id-based handlers matched."}
  ];

  useEffect(() => {
    // TODO: Re-attach behaviors with React handlers (onClick/onChange).
    // mappedHandlers can guide where legacy handlers existed.
  }, []);

  return (
    <section>
      <h2>${componentName}</h2>
      <p>Source JSP: <code>${page.file}</code></p>
      <h3>Convertible Action Elements</h3>
      <ul>
${elements.length ? elements.join("\n") : "        <li>No actionable elements detected.</li>"}
      </ul>
    </section>
  );
}

// Logic markers from JSP (state/flow review):
${logicNotes.length ? logicNotes.join("\n") : "// - none"}
`;
}

function run() {
  const cwd = process.cwd();
  const jspDir = path.resolve(cwd, process.argv[2] ?? DEFAULT_JSP_DIR);
  const jsDir = path.resolve(cwd, process.argv[3] ?? DEFAULT_JS_DIR);
  const outputDir = path.resolve(cwd, process.argv[4] ?? DEFAULT_OUTPUT_DIR);

  if (!fs.existsSync(jspDir)) {
    console.error(`JSP directory not found: ${jspDir}`);
    process.exit(1);
  }
  if (!fs.existsSync(jsDir)) {
    console.error(`JS directory not found: ${jsDir}`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const jspFiles = walkFiles(jspDir, ".jsp");
  const jsFiles = walkFiles(jsDir, ".js", JS_SKIP_DIRS);

  const allBindings = [];
  for (const jsFile of jsFiles) {
    const jsContent = fs.readFileSync(jsFile, "utf8");
    allBindings.push(...extractJsBindings(jsFile, jsContent, cwd));
  }

  const summary = [];
  for (const jspFile of jspFiles) {
    const jspContent = fs.readFileSync(jspFile, "utf8");
    const rel = path.relative(cwd, jspFile);
    const elements = extractJspElements(jspContent);
    const logic = extractJspLogic(jspContent);

    const byId = [];
    for (const element of elements) {
      if (!element.id) continue;
      const handlers = allBindings.filter((b) => b.selectorValue === element.id);
      if (handlers.length > 0) {
        byId.push({ id: element.id, elementLine: element.line, handlers });
      }
    }

    const page = {
      file: rel,
      elements,
      logic,
      mapping: { byId },
    };

    const componentName = `${toPascalCase(rel)}CandidatePage`;
    const outFile = path.join(outputDir, `${componentName}.tsx`);
    fs.writeFileSync(outFile, createTsxForPage(componentName, page), "utf8");

    summary.push({
      file: rel,
      output: path.relative(cwd, outFile),
      elements: elements.length,
      logic: logic.length,
      mappedById: byId.length,
    });
  }

  const bindingsPath = path.join(outputDir, "jsp-first-bindings.json");
  fs.writeFileSync(bindingsPath, JSON.stringify(allBindings, null, 2), "utf8");

  const reportPath = path.join(outputDir, "conversion-report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        mode: "jsp-first",
        jspDir: path.relative(cwd, jspDir),
        jsDir: path.relative(cwd, jsDir),
        files: summary.length,
        summary,
      },
      null,
      2
    ),
    "utf8"
  );

  console.log("Mode: jsp-first");
  console.log(`JSP files converted: ${summary.length}`);
  console.log(`JS bindings indexed: ${allBindings.length}`);
  console.log(`Output directory: ${path.relative(cwd, outputDir)}`);
  console.log(`Bindings: ${path.relative(cwd, bindingsPath)}`);
  console.log(`Report: ${path.relative(cwd, reportPath)}`);
}

run();
