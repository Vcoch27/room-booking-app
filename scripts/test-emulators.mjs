import { spawn } from "node:child_process";
const child = spawn(
  process.execPath,
  [
    "node_modules/firebase-tools/lib/bin/firebase.js",
    "emulators:exec",
    "--project",
    "demo-studyspace",
    "--only",
    "auth,firestore,functions",
    "vitest run tests/emulator.test.ts",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      FUNCTIONS_DISCOVERY_TIMEOUT:
        process.env.FUNCTIONS_DISCOVERY_TIMEOUT || "60",
    },
  },
);
child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
