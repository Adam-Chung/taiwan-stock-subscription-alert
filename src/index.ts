import { run } from "./app.js";
import { taipeiDate } from "./lib/date.js";

const dryRun = process.argv.includes("--dry-run") || process.env.DRY_RUN === "true";

run(taipeiDate(), dryRun)
  .then((message) => {
    console.log(message);
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.stack : error);
    process.exitCode = 1;
  });
