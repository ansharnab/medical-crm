#!/usr/bin/env node
/**
 * Verify Figma credentials and post setup comment on target file.
 * Usage: node scripts/figma-setup.mjs
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const path = resolve(root, ".env.figma.local");
  if (!existsSync(path)) {
    console.error("Missing .env.figma.local — create it with FIGMA_ACCESS_TOKEN, FIGMA_FILE_KEY");
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

async function figmaGet(token, path) {
  const res = await fetch(`https://api.figma.com/v1${path}`, {
    headers: { "X-Figma-Token": token },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.err || body.message || res.statusText);
  return body;
}

async function figmaPost(token, path, payload) {
  const res = await fetch(`https://api.figma.com/v1${path}`, {
    method: "POST",
    headers: {
      "X-Figma-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.err || body.message || res.statusText);
  return body;
}

async function main() {
  const env = loadEnv();
  const { FIGMA_ACCESS_TOKEN: token, FIGMA_FILE_KEY: fileKey, FIGMA_FILE_URL: fileUrl, FIGMA_TEAM_ID: teamId } = env;

  console.log("Verifying Figma token…");
  const me = await figmaGet(token, "/me");
  console.log(`  ✓ ${me.handle} (${me.email})`);

  console.log("Reading target file…");
  const file = await figmaGet(token, `/files/${fileKey}?depth=1`);
  console.log(`  ✓ File: "${file.name}" — ${file.document.children.length} page(s)`);

  if (teamId) {
    try {
      const projects = await figmaGet(token, `/teams/${teamId}/projects`);
      console.log(`  ✓ Team projects: ${projects.projects?.length ?? 0}`);
    } catch {
      console.log("  (Team projects: no access or invalid team ID — file access still OK)");
    }
  }

  const message = [
    "Doctor CRM wireframe builder ready.",
    "",
    "Run the plugin once to generate all 78 frames:",
    "1. Open this file in Figma desktop",
    "2. Plugins → Development → Import plugin from manifest",
    "3. Select: docs/design/figma-plugin/manifest.json",
    "4. Run: Doctor CRM Wireframe Builder",
    "",
    "Blueprint: docs/design/figma-wireframe-full-crm.md",
    "HTML prototype: docs/design/wireframe-demo.html",
  ].join("\n");

  try {
    await figmaPost(token, `/files/${fileKey}/comments`, {
      message,
      client_meta: { x: 100, y: 100 },
    });
    console.log("  ✓ Setup comment posted on file");
  } catch (e) {
    console.log("  (Comment skipped:", e.message + ")");
  }

  console.log("\n--- Next step (one-time, ~30 sec) ---");
  console.log("Open:", fileUrl || `https://www.figma.com/design/${fileKey}`);
  console.log("Import plugin:", resolve(root, "docs/design/figma-plugin/manifest.json"));
  console.log("Run plugin → all pages, frames & prototype links are created automatically.");
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
