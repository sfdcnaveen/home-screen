import { readFile } from "node:fs/promises";

const files = ["index.html", "styles.css", "app.js", "vercel.json"];
const checks = [
  ["index.html", "ChatGPT"],
  ["index.html", "Perplexity"],
  ["index.html", "Gemini"],
  ["index.html", "GitHub"],
  ["index.html", "Vercel"],
  ["index.html", "Pinterest"],
  ["index.html", "login.salesforce.com"],
  ["app.js", "homeProfileName"],
  ["app.js", "searchUrl"],
  ["styles.css", "backdrop-filter"],
];

const contents = Object.fromEntries(
  await Promise.all(
    files.map(async (file) => [file, await readFile(file, "utf8")]),
  ),
);

for (const [file, needle] of checks) {
  if (!contents[file].includes(needle)) {
    throw new Error(`${file} is missing expected content: ${needle}`);
  }
}

console.log("Static homepage checks passed.");
