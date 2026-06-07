#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { join, dirname, extname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// --- Helpers ---
function error(msg) { console.error(`  ✗ ${msg}`); }
function warn(msg)  { console.warn(`  ⚠ ${msg}`); }
function ok(msg)    { console.log(`  ✓ ${msg}`); }

const EXT_LANG = {
  ".js": "javascript", ".mjs": "javascript", ".cjs": "javascript",
  ".ts": "typescript", ".tsx": "typescript",
  ".py": "python",
  ".rs": "rust",
  ".java": "java",
  ".go": "go",
  ".sql": "sql",
};

function langOf(filePath) {
  return EXT_LANG[extname(filePath)] ?? null;
}

// --- CLI ---
const args = process.argv.slice(2);
let diffRef = null;
let githubActions = false;
const filePaths = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--diff" && args[i + 1]) {
    diffRef = args[++i];
  } else if (args[i] === "--github-actions") {
    githubActions = true;
  } else {
    filePaths.push(args[i]);
  }
}

if (diffRef) {
  try {
    const out = execSync(`git diff --name-only ${diffRef}`, {
      encoding: "utf8",
      cwd: root,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const diffFiles = out.split("\n").map(l => l.trim()).filter(Boolean);
    filePaths.push(...diffFiles);
  } catch (e) {
    error(`git diff failed: ${e.message}`);
    process.exit(1);
  }
}

if (filePaths.length === 0) {
  console.error("Usage: check_constraints.mjs [--diff <ref>] [--github-actions] <file...>");
  console.error("  --diff <ref>          Check files changed vs git ref");
  console.error("  --github-actions      Output GitHub Actions annotation format");
  console.error("  <file...>             File paths to check");
  process.exit(1);
}

// --- Load constraints ---
const constraintsPath = join(root, "code-review", "references", "constraints.json");
let rules;
try {
  rules = JSON.parse(readFileSync(constraintsPath, "utf8")).rules;
} catch (e) {
  error(`Failed to load constraints.json: ${e.message}`);
  process.exit(1);
}

// --- Scan ---
const counts = { critical: 0, major: 0, minor: 0 };
let filesWithFindings = 0;

for (const filePath of filePaths) {
  const lang = langOf(filePath);
  if (!lang) {
    warn(`Skipping ${filePath}: unrecognized extension`);
    continue;
  }

  const absPath = isAbsolute(filePath) ? resolve(filePath) : join(root, filePath);
  let content;
  try {
    content = readFileSync(absPath, "utf8");
  } catch (e) {
    if (e.code === "EISDIR") continue;
    warn(`Skipping ${filePath}: ${e.message}`);
    continue;
  }

  // Binary file heuristic: null byte in first 8KB
  if (content.slice(0, 8192).includes("\0")) {
    warn(`Skipping ${filePath}: binary file`);
    continue;
  }

  const lines = content.split("\n");
  let fileHasFindings = false;

  for (const rule of rules) {
    const matchedPatterns = rule.patterns.filter(p =>
      p.languages.includes("*") || p.languages.includes(lang)
    );
    if (matchedPatterns.length === 0) continue;

    for (const pat of matchedPatterns) {
      const re = new RegExp(pat.regex, pat.flags || "");
      for (let i = 0; i < lines.length; i++) {
        if (re.test(lines[i])) {
          if (!fileHasFindings) { fileHasFindings = true; filesWithFindings++; }
          counts[rule.severity] = (counts[rule.severity] || 0) + 1;

          if (githubActions) {
            const level = (rule.severity === "critical" || rule.severity === "major")
              ? "error" : "warning";
            console.log(`::${level} file=${filePath},line=${i + 1},title=${rule.id}::${rule.message}`);
          } else {
            const icon = rule.severity === "minor" ? "⚠" : "✗";
            console.log(`  ${icon} [${rule.severity.toUpperCase()}] ${rule.id}: ${rule.message}  (${filePath}:${i + 1})`);
          }
        }
      }
    }
  }
}

// --- Summary ---
const total = counts.critical + counts.major + counts.minor;
console.log("─".repeat(50));
console.log(`Found ${counts.critical} critical, ${counts.major} major, ${counts.minor} minor findings in ${filesWithFindings} files.`);

if (counts.critical > 0 || counts.major > 0) {
  process.exit(1);
}
