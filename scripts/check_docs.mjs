#!/usr/bin/env node

import { readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const agentsPath = join(root, "AGENTS.md");
const claudePath = join(root, "CLAUDE.md");

function read(p) {
  try { return readFileSync(p, "utf8"); } catch (e) { if (e.code === "ENOENT") return null; throw e; }
}

function mtime(p) {
  try { return statSync(p).mtimeMs; } catch { return 0; }
}

const agents = read(agentsPath);
const claude = read(claudePath);

if (agents === claude) {
  console.log("✓ AGENTS.md and CLAUDE.md are in sync.");
  process.exit(0);
}

if (agents === null) {
  writeFileSync(agentsPath, claude, "utf8");
  console.log("→ AGENTS.md created from CLAUDE.md.");
} else if (claude === null) {
  writeFileSync(claudePath, agents, "utf8");
  console.log("→ CLAUDE.md created from AGENTS.md.");
} else {
  const src = mtime(claudePath) >= mtime(agentsPath) ? "CLAUDE.md" : "AGENTS.md";
  const srcPath = src === "CLAUDE.md" ? claudePath : agentsPath;
  const dstPath = src === "CLAUDE.md" ? agentsPath : claudePath;
  const dst = src === "CLAUDE.md" ? "AGENTS.md" : "CLAUDE.md";
  const srcContent = src === "CLAUDE.md" ? claude : agents;
  writeFileSync(dstPath, srcContent, "utf8");
  console.log(`→ Synced ${dst} ← ${src} (newer).`);
}
