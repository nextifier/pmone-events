#!/usr/bin/env node
// One-off cleanup: remove dead data blocks from content.js / locale files.
// String/template-literal aware bracket matcher (no eval, no AST deps).
// Usage: node strip-deadcode.mjs <file> <content|locale>
import { readFileSync, writeFileSync } from "node:fs";

const [, , file, mode] = process.argv;
if (!file || !mode) {
  console.error("usage: strip-deadcode.mjs <file> <content|locale>");
  process.exit(2);
}

function skipTemplate(text, i) {
  // text[i] === '`'
  i++;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === "\\") { i += 2; continue; }
    if (c === "`") return i + 1;
    if (c === "$" && text[i + 1] === "{") {
      i += 2;
      let depth = 1;
      while (i < n && depth > 0) {
        const d = text[i];
        if (d === "'" || d === '"') { i = skipString(text, i, d); continue; }
        if (d === "`") { i = skipTemplate(text, i); continue; }
        if (d === "{") depth++;
        else if (d === "}") depth--;
        i++;
      }
      continue;
    }
    i++;
  }
  return i;
}

function skipString(text, i, q) {
  i++;
  const n = text.length;
  while (i < n) {
    if (text[i] === "\\") { i += 2; continue; }
    if (text[i] === q) return i + 1;
    i++;
  }
  return i;
}

// Returns index of the bracket matching the opener at openIdx (string-aware).
function matchBracket(text, openIdx) {
  const open = text[openIdx];
  const close = open === "[" ? "]" : "}";
  let depth = 0;
  let i = openIdx;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === "'" || c === '"') { i = skipString(text, i, c); continue; }
    if (c === "`") { i = skipTemplate(text, i); continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) return i; }
    i++;
  }
  return -1;
}

// Remove property `key` (array or object value) found within [from, to).
// Returns { text, removed } where removed is the deleted snippet (or null).
function removeProp(text, key, from = 0, to = text.length) {
  const re = new RegExp(`(^|\\n)([ \\t]*)(?:"${key}"|'${key}'|${key})\\s*:\\s*`, "g");
  re.lastIndex = from;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index < from || m.index >= to) { if (m.index >= to) break; else continue; }
    // position of the value's opening bracket
    let openIdx = m.index + m[0].length;
    const open = text[openIdx];
    if (open !== "[" && open !== "{") return { text, removed: null }; // not a block value -> skip
    const closeIdx = matchBracket(text, openIdx);
    if (closeIdx === -1) return { text, removed: null };
    let end = closeIdx + 1;
    if (text[end] === ",") end++;
    // line start (after the captured leading newline)
    const lineStart = m.index + m[1].length;
    // consume trailing newline so we don't leave a blank line
    let removeEnd = end;
    if (text[removeEnd] === "\n") removeEnd++;
    const removed = text.slice(lineStart, end);
    return { text: text.slice(0, lineStart) + text.slice(removeEnd), removed };
  }
  return { text, removed: null };
}

// Find the object opening-brace index for property `key` within [from, to).
function findObjectOpen(text, key, from = 0, to = text.length) {
  const re = new RegExp(`(^|\\n)[ \\t]*(?:"${key}"|'${key}'|${key})\\s*:\\s*\\{`, "g");
  re.lastIndex = from;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index >= to) break;
    if (m.index < from) continue;
    return m.index + m[0].length - 1; // index of '{'
  }
  return -1;
}

let text = readFileSync(file, "utf8");
const log = [];

function strip(key, scopeKey) {
  let from = 0, to = text.length;
  if (scopeKey) {
    const open = findObjectOpen(text, scopeKey);
    if (open === -1) return;
    const close = matchBracket(text, open);
    if (close === -1) return;
    from = open; to = close;
  }
  const r = removeProp(text, key, from, to);
  if (r.removed) {
    text = r.text;
    const lines = r.removed.split("\n").length;
    log.push(`  - removed ${scopeKey ? scopeKey + "." : ""}${key} (${lines} lines)`);
  }
}

if (mode === "content") {
  strip("bannerHero", null);          // dead hero-banner array
  strip("list", "mainPrograms");      // dead hardcoded program list
} else if (mode === "locale") {
  strip("items", "mainPrograms");     // dead program-item i18n keys
  strip("list", "mainPrograms");      // some apps may use .list in locale
} else {
  console.error("unknown mode:", mode);
  process.exit(2);
}

if (log.length) {
  writeFileSync(file, text);
  console.log(file);
  console.log(log.join("\n"));
} else {
  console.log(`${file}\n  (no changes)`);
}
