/**
 * 部分変換のための関連性分析スクリプト。
 *
 * このスクリプトは「JSPのどの操作要素が、どのJavaScriptイベントに結び付いているか」を
 * 機械的に棚卸しし、React移行時の下準備データをJSONで出力する。
 *
 * 変換フロー（全体像）
 * 1) 入力ディレクトリを決定
 *    - 既定では JSP: `src/main/webapp/WEB-INF/view`
 *    - 既定では JS : `src/main/webapp/javascripts`
 *    - 必要ならCLI引数で差し替え可能
 *
 * 2) ファイル収集
 *    - JSP配下から `.jsp` を再帰収集
 *    - JS配下から `.js` を再帰収集
 *    - ライブラリ本体（`lib`, `jquery-ui-i18n`）は解析対象外
 *
 * 3) JS側のイベントバインド抽出
 *    - jQuery形式: `$('#id').click(...)`, `$('#id').on('click', ...)`
 *    - name属性形式: `$("[name='...']").change(...)` など
 *    - DOM API形式: `querySelector(...).addEventListener(...)`
 *    - 取得したイベントを「どのファイルの何行か」付きで保持
 *
 * 4) JSP側の操作要素抽出
 *    - `<n:submit>`, `<n:a>`, `<button>`, `<a>`, `<input type='submit|button'>`
 *    - `id/name/href/uri/value` を取り出し、行番号付きで保持
 *    - React移行で起点になりにくいタグは除外
 *
 * 5) JSPロジック抽出（状態把握の補助）
 *    - 表示条件・反復・画面状態切替を示すタグを抽出
 *      - `c:if`, `c:forEach`, `n:forInputPage`, `n:forConfirmationPage`
 *    - scriptlet (`<% ... %>`) も抽出し、要注意領域として可視化
 *
 * 6) マッピング
 *    - JSPボタンの `id` / `name` と JSの selector を突合
 *    - 「どのボタンに、どのイベント実装が紐づくか」を `byId` / `byName` で出力
 *
 * 7) レポート出力
 *    - `migration/partial-migration-report.json` に保存
 *    - 件数サマリ（JSP数、JS数、ボタン数、ロジック数、マッピング数）も出力
 *
 * このスクリプトの役割
 * - React完成コードを自動生成することではなく、
 *   変換対象の関連性を壊さずに洗い出す「前処理」に特化している。
 * - まず関連付けを固め、次段で安全に半自動変換するための土台を作る。
 */

import fs from "node:fs";
import path from "node:path";

type ButtonElement = {
  tag: string;
  line: number;
  id?: string;
  name?: string;
  href?: string;
  uri?: string;
  value?: string;
  raw: string;
};

type JsBinding = {
  file: string;
  line: number;
  selectorType: "id" | "name";
  selectorValue: string;
  event: string;
  kind: "jquery" | "dom";
  raw: string;
};

type JspLogicOccurrence = {
  kind:
    | "c:if"
    | "c:forEach"
    | "n:forInputPage"
    | "n:forConfirmationPage"
    | "scriptlet";
  line: number;
  raw: string;
};

type JspAnalysis = {
  file: string;
  buttons: ButtonElement[];
  logic: JspLogicOccurrence[];
  mapping: {
    byId: Array<{
      id: string;
      buttonLine: number;
      handlers: JsBinding[];
    }>;
    byName: Array<{
      name: string;
      buttonLine: number;
      handlers: JsBinding[];
    }>;
  };
};

type AnalysisReport = {
  generatedAt: string;
  input: {
    jspDir: string;
    jsDir: string;
  };
  summary: {
    jspFiles: number;
    jsFiles: number;
    totalButtons: number;
    totalJsBindings: number;
    totalLogicBlocks: number;
    mappedById: number;
    mappedByName: number;
  };
  jsBindings: JsBinding[];
  pages: JspAnalysis[];
};

const DEFAULT_JSP_DIR = "src/main/webapp/WEB-INF/view";
const DEFAULT_JS_DIR = "src/main/webapp/javascripts";
const DEFAULT_OUTPUT = "migration/partial-migration-report.json";
const JS_SKIP_DIRS = new Set(["lib", "jquery-ui-i18n"]);

function walkFiles(targetDir: string, extension: string, skipDirs = new Set<string>()): string[] {
  if (!fs.existsSync(targetDir)) return [];

  const out: string[] = [];
  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) continue;
      out.push(...walkFiles(fullPath, extension, skipDirs));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(extension)) {
      out.push(fullPath);
    }
  }
  return out;
}

function lineNumberAt(content: string, index: number): number {
  return content.slice(0, index).split("\n").length;
}

function getAttr(tagText: string, attr: string): string | undefined {
  const match = tagText.match(new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`));
  return match?.[1];
}

function shrinkOneLine(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, 220);
}

function extractButtonsFromJsp(content: string): ButtonElement[] {
  const tagPattern = /<(n:submit|n:a|button|a|input)\b[\s\S]*?>/gi;
  const results: ButtonElement[] = [];

  for (const match of content.matchAll(tagPattern)) {
    const tag = match[1];
    const raw = match[0];
    const index = match.index ?? 0;
    const typeAttr = getAttr(raw, "type");

    if (tag === "input" && typeAttr !== "submit" && typeAttr !== "button") {
      continue;
    }

    const id = getAttr(raw, "id");
    const name = getAttr(raw, "name");
    const href = getAttr(raw, "href");
    const uri = getAttr(raw, "uri");
    const value = getAttr(raw, "value");

    if (!id && !name && !href && !uri) {
      continue;
    }

    results.push({
      tag,
      line: lineNumberAt(content, index),
      id,
      name,
      href,
      uri,
      value,
      raw: shrinkOneLine(raw),
    });
  }
  return results;
}

function extractLogicFromJsp(content: string): JspLogicOccurrence[] {
  const patterns: Array<{ kind: JspLogicOccurrence["kind"]; pattern: RegExp }> = [
    { kind: "c:if", pattern: /<c:if\b[\s\S]*?>/gi },
    { kind: "c:forEach", pattern: /<c:forEach\b[\s\S]*?>/gi },
    { kind: "n:forInputPage", pattern: /<n:forInputPage\b[\s\S]*?>/gi },
    {
      kind: "n:forConfirmationPage",
      pattern: /<n:forConfirmationPage\b[\s\S]*?>/gi,
    },
    { kind: "scriptlet", pattern: /<%(?!@)[\s\S]*?%>/gi },
  ];

  const logic: JspLogicOccurrence[] = [];

  for (const item of patterns) {
    for (const match of content.matchAll(item.pattern)) {
      logic.push({
        kind: item.kind,
        line: lineNumberAt(content, match.index ?? 0),
        raw: shrinkOneLine(match[0]),
      });
    }
  }

  logic.sort((a, b) => a.line - b.line);
  return logic;
}

function extractJsBindings(file: string, content: string): JsBinding[] {
  const bindings: JsBinding[] = [];

  const patterns: Array<{
    pattern: RegExp;
    kind: JsBinding["kind"];
    selectorType: JsBinding["selectorType"];
    selectorGroup: number;
    eventGroup: number;
  }> = [
    {
      pattern: /\$\(\s*['"]#([^"']+)['"]\s*\)\.(click|change|submit)\s*\(/g,
      kind: "jquery",
      selectorType: "id",
      selectorGroup: 1,
      eventGroup: 2,
    },
    {
      pattern: /\$\(\s*['"]#([^"']+)['"]\s*\)\.on\(\s*['"]([^"']+)['"]/g,
      kind: "jquery",
      selectorType: "id",
      selectorGroup: 1,
      eventGroup: 2,
    },
    {
      pattern:
        /\$\(\s*["'][^\n"']*\[\s*name\s*=\s*['"]([^"']+)['"]\s*\][^"']*["']\s*\)\.(click|change|submit)\s*\(/g,
      kind: "jquery",
      selectorType: "name",
      selectorGroup: 1,
      eventGroup: 2,
    },
    {
      pattern:
        /document\.querySelector\(\s*['"]#([^"']+)['"]\s*\)\.addEventListener\(\s*['"]([^"']+)['"]/g,
      kind: "dom",
      selectorType: "id",
      selectorGroup: 1,
      eventGroup: 2,
    },
    {
      pattern:
        /document\.getElementById\(\s*['"]([^"']+)['"]\s*\)\.addEventListener\(\s*['"]([^"']+)['"]/g,
      kind: "dom",
      selectorType: "id",
      selectorGroup: 1,
      eventGroup: 2,
    },
  ];

  for (const item of patterns) {
    for (const match of content.matchAll(item.pattern)) {
      bindings.push({
        file,
        line: lineNumberAt(content, match.index ?? 0),
        selectorType: item.selectorType,
        selectorValue: match[item.selectorGroup],
        event: match[item.eventGroup],
        kind: item.kind,
        raw: shrinkOneLine(match[0]),
      });
    }
  }

  return bindings;
}

function mapButtonsToBindings(
  buttons: ButtonElement[],
  bindings: JsBinding[]
): JspAnalysis["mapping"] {
  const byId: JspAnalysis["mapping"]["byId"] = [];
  const byName: JspAnalysis["mapping"]["byName"] = [];

  for (const button of buttons) {
    if (button.id) {
      const matched = bindings.filter(
        (b) => b.selectorType === "id" && b.selectorValue === button.id
      );
      if (matched.length > 0) {
        byId.push({
          id: button.id,
          buttonLine: button.line,
          handlers: matched,
        });
      }
    }

    if (button.name) {
      const matched = bindings.filter(
        (b) => b.selectorType === "name" && b.selectorValue === button.name
      );
      if (matched.length > 0) {
        byName.push({
          name: button.name,
          buttonLine: button.line,
          handlers: matched,
        });
      }
    }
  }

  return { byId, byName };
}

function run(): void {
  const cwd = process.cwd();
  const jspDir = path.resolve(cwd, process.argv[2] ?? DEFAULT_JSP_DIR);
  const jsDir = path.resolve(cwd, process.argv[3] ?? DEFAULT_JS_DIR);
  const outPath = path.resolve(cwd, process.argv[4] ?? DEFAULT_OUTPUT);

  const jspFiles = walkFiles(jspDir, ".jsp");
  const jsFiles = walkFiles(jsDir, ".js", JS_SKIP_DIRS);

  const allBindings: JsBinding[] = [];
  for (const file of jsFiles) {
    const content = fs.readFileSync(file, "utf8");
    allBindings.push(...extractJsBindings(path.relative(cwd, file), content));
  }

  const pages: JspAnalysis[] = [];
  for (const file of jspFiles) {
    const content = fs.readFileSync(file, "utf8");
    const buttons = extractButtonsFromJsp(content);
    const logic = extractLogicFromJsp(content);
    const mapping = mapButtonsToBindings(buttons, allBindings);

    pages.push({
      file: path.relative(cwd, file),
      buttons,
      logic,
      mapping,
    });
  }

  const report: AnalysisReport = {
    generatedAt: new Date().toISOString(),
    input: {
      jspDir: path.relative(cwd, jspDir),
      jsDir: path.relative(cwd, jsDir),
    },
    summary: {
      jspFiles: jspFiles.length,
      jsFiles: jsFiles.length,
      totalButtons: pages.reduce((sum, p) => sum + p.buttons.length, 0),
      totalJsBindings: allBindings.length,
      totalLogicBlocks: pages.reduce((sum, p) => sum + p.logic.length, 0),
      mappedById: pages.reduce((sum, p) => sum + p.mapping.byId.length, 0),
      mappedByName: pages.reduce((sum, p) => sum + p.mapping.byName.length, 0),
    },
    jsBindings: allBindings,
    pages,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`JSP files: ${report.summary.jspFiles}`);
  console.log(`JS files: ${report.summary.jsFiles}`);
  console.log(`Buttons: ${report.summary.totalButtons}`);
  console.log(`Bindings: ${report.summary.totalJsBindings}`);
  console.log(`Logic blocks: ${report.summary.totalLogicBlocks}`);
  console.log(`Mapped by id: ${report.summary.mappedById}`);
  console.log(`Mapped by name: ${report.summary.mappedByName}`);
  console.log(`Report: ${path.relative(cwd, outPath)}`);
}

run();
