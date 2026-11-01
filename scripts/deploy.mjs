/* Build and deploy the site to Cloudflare Pages. Node standard library only. */
import { spawnSync } from "node:child_process";

const PRODUCTION_URL = "https://philippine-unavailable-film-register.pages.dev";
const PROJECT_NAME = "philippine-unavailable-film-register";
const env = { ...process.env, SITE_URL: process.env.SITE_URL || PRODUCTION_URL };

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", env, ...options });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(process.execPath, ["scripts/validate.mjs"]);
run(process.execPath, ["scripts/build.mjs"]);
run(
  "npx",
  ["--yes", "wrangler@latest", "pages", "deploy", "dist", "--project-name", PROJECT_NAME, "--branch", "main"],
  { shell: process.platform === "win32" }
);
