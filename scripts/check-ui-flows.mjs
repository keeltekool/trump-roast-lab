// Click-through of the roast flow (CLAUDE.md §2): dossier → Generate → tweet card. One real Claude call at 1440.
// Usage: node scripts/check-ui-flows.mjs <baseUrl>
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";

const { chromium } = createRequire("C:/Users/Kasutaja/.claude/scripts/")("playwright");

const BASE = (process.argv[2] || process.env.BASE || "http://localhost:3000").replace(/\/$/, "");

let failed = 0;
async function step(name, fn) {
  try { await fn(); console.log(`PASS ${name}`); }
  catch (e) { failed++; console.log(`FAIL ${name}: ${e.message.split("\n")[0]}`); }
}

const browser = await chromium.launch();
for (const width of [375, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: width === 375 ? 812 : 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await step(`${width}: dossier form renders`, async () => {
    await page.goto(BASE);
    await page.getByPlaceholder("e.g. Mart Roosma").waitFor();
  });
  if (width === 1440) {
    await step("1440: Generate Roast → tweet card with Claude's roast", async () => {
      await page.getByPlaceholder("e.g. Mart Roosma").fill("Kalle Kuusk");
      await page.getByPlaceholder(/Works in finance/).fill(
        "Runs a bike repair shop in Tartu, always 20 minutes late, claims he invented cold brew, plays padel badly and blames the racket"
      );
      await page.getByPlaceholder(/fell off the boat/).fill("The sauna door incident at Otepää, the Nokia ringtone karaoke");
      const response = page.waitForResponse((r) => r.url().endsWith("/api/generate"), { timeout: 300000 });
      await page.getByRole("button", { name: "Generate Roast" }).click();
      const res = await response;
      const body = await res.json();
      if (!res.ok()) throw new Error(`${res.status()} ${body.error}`);
      await page.getByText("@realDonaldTrump").waitFor();
      console.log(`  roast:\n${body.text.replace(/^/gm, "  | ")}`);
    });
  }

  await page.screenshot({ path: join(tmpdir(), `roast-flows-${width}.png`) });
  if (errors.length) { failed++; console.log(`FAIL ${width}: page errors: ${errors.join(" | ")}`); }
  await page.close();
}
await browser.close();
console.log(failed ? `${failed} failed` : "all passed");
process.exit(failed ? 1 : 0);
