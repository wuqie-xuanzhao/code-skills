#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

let errors = 0;
let warnings = 0;

function error(msg) {
  errors++;
  console.error(`  ✗ ${msg}`);
}

function warn(msg) {
  warnings++;
  console.warn(`  ⚠ ${msg}`);
}

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

function parseFrontmatter(content) {
  if (!content.startsWith("---")) return null;
  const end = content.indexOf("---", 3);
  if (end === -1) return null;
  const raw = content.slice(3, end).trim();
  const lines = raw.split("\n");
  const fields = {};
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\w[\w-]*):\s*(.*)/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (val === "|" || val === ">") {
      // YAML multiline: collect indented lines
      const parts = [];
      for (let j = i + 1; j < lines.length && /^\s+\S/.test(lines[j]); j++) {
        parts.push(lines[j].trim());
      }
      val = parts.join(" ");
    }
    if (val) fields[key] = val;
  }
  return fields;
}

function getHeadings(content) {
  return content
    .split("\n")
    .filter((l) => /^#{1,4}\s/.test(l))
    .map((l) => l.replace(/^#+\s+/, "").trim());
}

// --- Discover skill directories ---
const ignoredRootDirs = new Set(["scripts", "node_modules", "docs"]);

const skillDirs = readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith(".") && !ignoredRootDirs.has(d.name))
  .map((d) => d.name);

console.log(`\nLinting skills in: ${root}\n`);

for (const dir of skillDirs) {
  const skillDir = join(root, dir);
  console.log(`📦 ${dir}/`);

  // --- SKILL.md ---
  const skillPath = join(skillDir, "SKILL.md");
  if (!existsSync(skillPath)) {
    error(`${dir}/SKILL.md not found — every skill directory must have one`);
    continue;
  }

  const skillContent = readFileSync(skillPath, "utf8");
  const fm = parseFrontmatter(skillContent);

  if (!fm) {
    error("SKILL.md: invalid or missing frontmatter (must start with ---)");
  } else {
    if (!fm.name) error("SKILL.md: missing required field `name`");
    else ok(`name: ${fm.name}`);

    if (!fm.description) error("SKILL.md: missing required field `description`");
    else ok(`description present (${fm.description.length} chars)`);
  }

  // --- SKILL-ZH.md ---
  const zhPath = join(skillDir, "SKILL-ZH.md");
  if (existsSync(zhPath)) {
    const zhContent = readFileSync(zhPath, "utf8");
    const zhFm = parseFrontmatter(zhContent);

    if (!zhFm) {
      error("SKILL-ZH.md: invalid frontmatter (must start/end with ---)");
    } else {
      ok("SKILL-ZH.md: frontmatter valid");
      if (zhFm.name !== fm?.name + "-zh") {
        warn(`SKILL-ZH.md: name "${zhFm.name}" doesn't follow "{en-name}-zh" convention`);
      }
    }

    // Check section heading alignment (en vs zh)
    const enHeadings = getHeadings(skillContent);
    const zhHeadings = getHeadings(zhContent);

    if (enHeadings.length > 0 && zhHeadings.length > 0) {
      const ratio = zhHeadings.length / enHeadings.length;
      if (ratio < 0.5 || ratio > 2.0) {
        warn(`SKILL-ZH.md has ${zhHeadings.length} headings vs SKILL.md's ${enHeadings.length} — possible structural drift`);
      } else {
        ok(`heading count: EN ${enHeadings.length}, ZH ${zhHeadings.length} (aligned)`);
      }
    }
  } else {
    warn("No SKILL-ZH.md — fine if not needed for human reading");
  }

  // --- references/ ---
  const refsDir = join(skillDir, "references");
  if (!existsSync(refsDir)) {
    warn("No references/ directory");
    continue;
  }

  const refFiles = readdirSync(refsDir);
  ok(`references/: ${refFiles.length} file(s) (${refFiles.join(", ")})`);

  // Check for stray generated files
  for (const f of refFiles) {
    if (/^gemini-|^claude-|^chatgpt-/.test(f)) {
      error(`references/${f}: stray AI-generated file — should not be in the repo`);
    }
  }

  // Check template files exist
  if (!refFiles.includes("template.md")) {
    warn("references/template.md not found");
  }

  console.log();
}

// --- Summary ---
console.log("─".repeat(40));
console.log(`Done. ${errors} error(s), ${warnings} warning(s).`);
if (errors > 0) process.exit(1);
