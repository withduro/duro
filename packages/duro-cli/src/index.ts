#!/usr/bin/env node

import { startDevServer } from "duro-dev/server";

async function main() {
  await startDevServer();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
