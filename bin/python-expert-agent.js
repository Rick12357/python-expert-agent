#!/usr/bin/env node

import { parseArgs } from "util";
import { init } from "../src/init.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf-8")
);

let values;
let positionals;

try {
  const parsed = parseArgs({
    args: process.argv,
    options: {
      help: {
        type: "boolean",
        short: "h",
        default: false,
      },
      version: {
        type: "boolean",
        short: "v",
        default: false,
      },
      global: {
        type: "boolean",
        short: "g",
        default: false,
      },
      force: {
        type: "boolean",
        short: "f",
        default: false,
      },
    },
    strict: true,
    allowPositionals: true,
  });
  values = parsed.values;
  positionals = parsed.positionals;
} catch (error) {
  if (error.code === "ERR_PARSE_ARGS_UNKNOWN_OPTION") {
    console.error(`Error: ${error.message}`);
    console.error("Run 'python-expert-agent --help' for usage information");
    process.exit(1);
  }
  throw error;
}

const args = positionals.slice(2);
const command = args[0];

if (values.version) {
  console.log(`python-expert-agent v${packageJson.version}`);
  process.exit(0);
}

if (values.help || command === "help" || !command) {
  console.log(`
python-expert-agent v${packageJson.version} - Python Expert Agent pack for OpenCode

Usage:
  python-expert-agent <command> [options]

Commands:
  init [path]    Install Python Expert Agent to a project
                 Copies .opencode/ and AGENTS.md to target directory

Options:
  -h, --help     Show this help message
  -v, --version  Show version
  -g, --global   Install to ~/.config/opencode (global config)
  -f, --force    Overwrite existing files without prompting

Examples:
  python-expert-agent init                    # Install in current directory
  python-expert-agent init ~/projects/my-app  # Install in specific project
  python-expert-agent init -g                 # Install globally
  python-expert-agent init -f                 # Force overwrite existing

What gets installed:
  .opencode/     Agent configuration (skills, subagents, context)
  AGENTS.md      Project configuration for OpenCode

For more information: https://github.com/amrahman90/python-expert-agent
`);
  process.exit(0);
}

if (command === "init") {
  const targetPath = args[1];
  await init(targetPath, values.global, values.force);
} else {
  console.error(`Error: Unknown command '${command}'`);
  console.error("Run 'python-expert-agent --help' for usage information");
  process.exit(1);
}
