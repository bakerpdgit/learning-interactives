const fs = require("node:fs");
const path = require("node:path");
const { once } = require("node:events");
const express = require("express");
const { chromium } = require("@playwright/test");
const { decompressFromEncodedURIComponent } = require("lz-string");

const root = path.join(__dirname, "..");
const output = path.join(root, "public", "previews");
const savedExample = path.join(root, "src", "examples", "ExampleInteractiveFile.txt");
const capture = { width: 720, height: 360 };
const tallBoards = new Set(["6", "7", "12", "15", "24", "26", "31", "35", "36"]);

function exampleImage() {
  const savedData = fs.readFileSync(savedExample, "utf8").split(/\r?\n/)
    .find((line) => line.startsWith("ActivityData:"));
  const image = decompressFromEncodedURIComponent(savedData.split("|~|")[1]);
  return Buffer.from(image.split(",")[1], "base64");
}

async function openPlayer(page, link, id) {
  await page.goto(link, { waitUntil: "domcontentloaded" });
  if (id === "35") {
    await page.getByRole("tab", { name: "Free Entry" }).click();
    await page.getByRole("textbox", { name: "Activity text" })
      .fill("A better lesson\nPlanning\nResources\nTiming\nPractice");
  }
  await page.getByRole("button", { name: "Run activity" }).click();
}

async function preparePlayer(page, id) {
  if (id === "1") {
    const words = page.locator('[class*="clickableWord"]');
    await words.nth(0).click();
    await words.nth(2).click();
    await words.nth(5).click();
  }
  if (id === "2") {
    await page.getByAltText("Reveal").evaluate((image) => image.decode());
    for (const index of [6, 7, 8, 11, 12, 13, 16, 17, 18]) {
      await page.locator(".image-box").nth(index).click();
    }
  }
  if (id === "5") {
    await page.getByText("Q1", { exact: true }).click();
    await page.getByText("Q2", { exact: true }).click();
  }
  if (id === "7") {
    const horses = page.locator('[class*="horseRaceContainer"]')
      .getByText("🐎", { exact: true });
    for (const index of [0, 1, 0, 3, 1, 2, 0, 3, 0, 1, 0, 4]) {
      await horses.nth(index).click();
    }
  }
  if (id === "19") {
    await page.getByAltText("Locations to label").evaluate((image) => image.decode());
  }
}

async function main() {
  const build = path.join(root, "build");
  if (!fs.existsSync(path.join(build, "index.html"))) {
    throw new Error("Run npm run build before capturing previews.");
  }

  const app = express();
  app.use(express.static(build));
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const baseURL = "http://127.0.0.1:" + server.address().port;
  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 800, height: 800 },
      reducedMotion: "reduce",
    });
    const image = exampleImage();
    await context.route("**/*", (route) => {
      const { origin, hostname } = new URL(route.request().url());
      if (origin === baseURL || origin === "null") return route.continue();
      if (hostname === "upload.wikimedia.org") {
        return route.fulfill({ contentType: "image/png", body: image });
      }
      return route.abort();
    });
    const catalog = await context.newPage();
    await catalog.goto("/");
    const links = await catalog.locator(".activityGrid a").evaluateAll((items) =>
      items.map((item) => ({ href: item.href, name: item.textContent.trim() })),
    );
    await catalog.close();
    if (!links.length) throw new Error("The activity catalog is empty.");

    const selected = new Set(process.argv.slice(2));
    const knownIds = new Set(links.map(({ href }) => new URL(href).searchParams.get("id")));
    for (const id of selected) {
      if (!knownIds.has(id)) throw new Error("Unknown activity ID: " + id);
    }
    fs.mkdirSync(output, { recursive: true });
    for (const { href, name } of links) {
      const id = new URL(href).searchParams.get("id");
      if (selected.size && !selected.has(id)) continue;
      const page = await context.newPage();
      await page.setViewportSize({ width: 800, height: tallBoards.has(id) ? 570 : 800 });
      await openPlayer(page, href, id);
      const player = page.locator(".activityPlayer");
      await player.waitFor({ state: "visible" });
      await page.addStyleTag({
        content: ".activityPlayer { min-height: 360px; align-content: center; }",
      });
      await preparePlayer(page, id);
      await player.evaluate(async (element, height) => {
        await document.fonts.ready;
        if (document.activeElement instanceof HTMLInputElement) document.activeElement.blur();
        const top = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, Math.max(0, top + height - window.innerHeight + 2));
      }, capture.height);

      const bounds = await player.boundingBox();
      const clip = {
        x: Math.round(bounds.x + (bounds.width - capture.width) / 2),
        y: Math.round(bounds.y),
        ...capture,
      };
      await page.screenshot({
        path: path.join(output, id + ".jpg"),
        quality: 85,
        clip,
        animations: "disabled",
        caret: "hide",
      });
      console.log(id + " " + name);
      await page.close();
    }
  } finally {
    await browser?.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
