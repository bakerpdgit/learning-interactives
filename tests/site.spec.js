const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");
const { activities } = require("../src/activities");
const { compressText, localActivitySearch, readActivityFile } = require("../src/activityFormat");

const activityFile = path.join(__dirname, "..", "src", "examples", "ExampleInteractiveFile.txt");
const exampleImage = Buffer.from(readActivityFile(fs.readFileSync(activityFile, "utf8")).media.split(",")[1], "base64");
const devSite = "http://127.0.0.1:4174";
const exampleActivity = "OPTIONS:show=all,order=maintain\nCafé + tea";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", (route) => {
    const { hostname } = new URL(route.request().url());
    if (hostname === "127.0.0.1") return route.continue();
    if (hostname === "upload.wikimedia.org") return route.fulfill({ contentType: "image/png", body: exampleImage });
    return route.abort();
  });
});

async function runExample(page, id) {
  await page.goto("/?id=" + id);
  await runActivity(page);
}

async function runActivity(page) {
  await page.getByRole("button", { name: "Run activity" }).click();
  await expect(page.getByRole("button", { name: "Share", exact: true })).toBeVisible();
  await expect(page.getByText("Loading activity…", { exact: true })).toHaveCount(0);
}

function directUrl(id, text) {
  return "/?" + new URLSearchParams({ id, txt: compressText(text) });
}

for (const { id, name, example } of activities) {
  test(id + " " + name + " runs from Builder and an existing direct link", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 850 });
    await page.goto("/?id=" + id);
    const builder = page.getByRole("tab", { name: "Builder" });
    await expect(builder).toHaveAttribute("aria-selected", "true");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.getByRole("tab", { name: "Free Entry" }).click();
    await expect(page.getByRole("textbox", { name: "Activity text" })).toHaveValue(example);
    await builder.click();
    await runActivity(page);

    const heading = page.getByRole("heading", { level: 1, name, exact: true }).first();
    const player = page.getByRole("region", { name: name + " play area", exact: true });
    const content = player.locator(":scope > :visible").first();
    await expect(heading).toBeVisible();
    await expect(content).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

    await page.goto(directUrl(id, example));
    await expect(heading).toBeVisible();
    await expect(content).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await expect(page.getByText("This activity couldn’t be displayed.")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test("catalog previews load and links fit a phone", async ({ page }) => {
  await page.goto("/");
  const previews = page.locator(".activityGrid a img");
  await expect(previews).toHaveCount(activities.length);
  const previewIds = await previews.evaluateAll((images) => Promise.all(images.map(async (image) => {
    image.loading = "eager";
    await image.decode();
    const id = new URL(image.closest("a").href).searchParams.get("id");
    return image.naturalWidth === 720 && image.naturalHeight === 360 &&
      new URL(image.src).pathname === "/previews/" + id + ".jpg" ? id : null;
  })));
  expect(previewIds).toEqual(activities.map(({ id }) => id));
  await page.setViewportSize({ width: 390, height: 850 });
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(page.getByRole("link", { name: "Use old site…" })).toBeVisible();
});

test("Word Complete fits its passage and score in a compact play area", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await runExample(page, "4");
  const player = page.getByRole("region", { name: "Word Complete play area" });
  const gap = player.getByRole("textbox", { name: "Missing word or number" });
  await expect(gap).toBeVisible();
  expect((await player.boundingBox()).height).toBeLessThan(320);
  await gap.fill("incorrect");
  await gap.press("Enter");
  await expect(player.getByText("✖", { exact: true })).toBeVisible();
});

test("the Random Wheel stays inside its phone layout when the wheel redraws", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 850 });
  await runExample(page, "12");
  const player = page.getByRole("region", { name: "Random Wheel play area" });
  const canvas = player.locator("canvas");
  await expect(canvas).toBeVisible();
  const before = await canvas.boundingBox();
  expect(before.height).toBeLessThan(390);
  const option = player.getByText("Violin", { exact: true });
  await option.click();
  await expect(option).toHaveCount(0);
  expect((await canvas.boundingBox()).height).toBe(before.height);
});

test("compact builders keep remove and correct controls next to the fields", async ({ page }) => {
  await page.goto("/?id=3");
  const pair = page.getByRole("group", { name: "Pair 1", exact: true });
  const term = await pair.getByRole("textbox", { name: "Term" }).boundingBox();
  const definition = await pair.getByRole("textbox", { name: "Definition" }).boundingBox();
  expect(definition.x).toBeGreaterThan(term.x);
  expect((await pair.boundingBox()).height).toBeLessThan(135);
  await page.getByRole("button", { name: "Add pair" }).click();
  const remove = page.getByRole("button", { name: "Remove pair 5" });
  await remove.hover();
  await expect(page.getByRole("tooltip")).toHaveText("Remove");
  await remove.click();
  await expect(page.getByRole("group", { name: "Pair 5" })).toHaveCount(0);

  await page.goto("/?id=10");
  await page.setViewportSize({ width: 390, height: 850 });
  const answer = page.getByRole("group", { name: "Question 1", exact: true })
    .getByRole("group", { name: "Answer 1", exact: true });
  const field = answer.getByRole("textbox", { name: "Answer" });
  const correct = answer.getByRole("checkbox", { name: "Correct answer" });
  expect((await correct.boundingBox()).x).toBeGreaterThan((await field.boundingBox()).x);
  await correct.check();
  await expect(correct).toBeChecked();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("the math keyboard is visible and a definite integral survives authoring and playback", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 850 });
  await page.goto("/?id=10");
  const question = page.getByRole("group", { name: "Question 1", exact: true });
  await question.getByRole("group", { name: "Answer 1", exact: true })
    .getByRole("button", { name: "Equation editor for Answer" }).click();
  const dialog = page.getByRole("dialog", { name: "Insert equation" });
  const keyboard = dialog.getByRole("button", { name: "Math keyboard" });
  await expect(keyboard).toBeVisible();
  await keyboard.click();
  await expect(keyboard).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".ML__keyboard")).toBeVisible();
  await page.locator(".MLK__layer.is-visible [data-keycap-value='1']").click();
  expect(await dialog.locator("math-field").evaluate((field) => field.getValue())).toBe("1");
  await keyboard.click();
  await expect(keyboard).toHaveAttribute("aria-pressed", "false");

  const raw = await dialog.locator("math-field").evaluate((field) => {
    field.setValue("\\int_{2}^{5}\\frac{3x^{2}}{7}\\differentialD x");
    return field.getValue();
  });
  expect(raw).toContain("\\differentialD");
  await dialog.getByRole("button", { name: "Insert equation" }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByRole("tab", { name: "Free Entry" }).click();
  const text = page.getByRole("textbox", { name: "Activity text" });
  await expect(text).toHaveValue(/\$\$\\int.*\\mathrm\{d\}.*\$\$/);
  await expect(text).not.toHaveValue(/\\differentialD/);
  await page.getByRole("button", { name: "Run activity" }).click();
  await expect(page.locator(".questionBox .katex")).toBeVisible();
});

test("match terms using the select and match controls", async ({ page }) => {
  await runExample(page, "3");
  await page.getByRole("button", { name: "Select Term 1", exact: true }).click();
  await page.getByRole("button", { name: "Match with Definition 1", exact: true }).click();
  await expect(page.getByText("1 of 4 matched.")).toBeVisible();
});

test("save a named file then load it and the original image fixture", async ({ page }) => {
  await runExample(page, "1");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByRole("textbox", { name: "Filename" }).fill("Class activity");
  const pendingDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download", exact: true }).click();
  const download = await pendingDownload;
  expect(download.suggestedFilename()).toBe("Class activity.txt");
  const load = async (file, name) => {
    await page.goto("/?id=999");
    await page.getByLabel("Choose an activity file").setInputFiles(file);
    await page.getByRole("button", { name: "Load file", exact: true }).click();
    await expect(page.getByText(name + " is ready.")).toBeVisible();
    await page.getByRole("button", { name: "Run", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name, exact: true })).toBeVisible();
  };
  await load(await download.path(), "Phrase Memorise");
  await load(activityFile, "Image Pins");
  await expect.poll(() => page.getByAltText("Locations to label").evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
});

test("share direct links and open a repository activity through either host", async ({ page }) => {
  await page.route("https://api.github.com/**", (route) => {
    const { pathname } = new URL(route.request().url());
    const data = pathname.endsWith("/repos") ? [{ name: "classroom", id: 1 }] :
      pathname.endsWith("/branches") ? [{ name: "main", commit: { sha: "fixture" } }] :
      { tree: [{ type: "blob", path: "lessons/Demo #1.txt" }] };
    return route.fulfill({ json: data });
  });
  for (const host of ["raw.githubusercontent.com", "cdn.jsdelivr.net"]) {
    await page.route("https://" + host + "/**", (route) => route.fulfill({
      contentType: "text/plain",
      body: fs.readFileSync(activityFile),
      headers: { "Access-Control-Allow-Origin": "*" },
    }));
  }
  await runExample(page, "1");
  await page.getByRole("button", { name: "Share", exact: true }).click();
  const direct = await page.getByRole("textbox", { name: "Activity link" }).inputValue();
  await page.getByText("Share a file hosted on GitHub").click();
  await page.getByRole("textbox", { name: "GitHub username" }).fill("teacher");
  await page.getByRole("button", { name: "Find repositories" }).click();
  await page.getByRole("button", { name: "classroom", exact: true }).click();
  await page.getByRole("button", { name: "main", exact: true }).click();
  await page.getByRole("button", { name: "lessons/Demo #1.txt", exact: true }).click();

  const sources = await Promise.all(["GitHub Raw", "jsDelivr"].map((name) =>
    page.getByRole("textbox", { name, exact: true }).inputValue()));
  await page.goto(direct);
  await expect(page.getByRole("heading", { name: "Phrase Memorise" })).toBeVisible();
  for (const source of sources) {
    expect(new URL(source).searchParams.get("txt")).toMatch(/Demo%20%231\.txt$/);
    await page.goto(source);
    await expect(page.getByRole("heading", { name: "Image Pins" })).toBeVisible();
    await expect(page).toHaveURL(source);
  }
});

for (const [label, base] of [["production", ""], ["development", devSite]]) {
  test("old site link opens the pinned site on " + label + " and preserves the activity URL", async ({ page }) => {
    await page.goto(base + "/");
    await page.getByRole("link", { name: "Use old site…" }).click();
    await expect(page).toHaveURL(/\/archive\/$/);
    await expect(page.getByRole("link", { name: "Use updated site" })).toBeVisible();

    const url = base + directUrl("1", exampleActivity) + "&lesson=%2B#top";
    await page.goto(url);
    await page.getByRole("link", { name: "Use old site…" }).click();
    await expect(page).toHaveURL(/\/archive\/\?/);
    await expect(page.getByRole("link", { name: "Use updated site" })).toBeVisible();
    await expect(page.getByText("Café", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Use updated site" }).click();
    await expect(page).toHaveURL(new RegExp(url.replace(/[.*+?^$(){}|[\]\\]/g, "\\$&") + "$"));
    await expect(page.getByRole("link", { name: "Use old site…" })).toBeVisible();
  });
}

test("old site receives a tab-local activity", async ({ page }) => {
  await page.goto("/?id=1");
  await page.getByRole("tab", { name: "Free Entry" }).click();
  await page.getByRole("textbox", { name: "Activity text" }).fill(exampleActivity);
  await page.getByRole("button", { name: "Run activity" }).click();
  await page.getByRole("link", { name: "Use old site…" }).click();
  await expect(page).toHaveURL(new RegExp("/archive/\\?" + localActivitySearch("1") + "$"));
  await expect(page.getByText("Café", { exact: true })).toBeVisible();
});

test("timer shows its completion message with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(directUrl("11", "Bell:1"));
  await expect(page.getByText("Time’s up", { exact: true })).toBeVisible();
  await expect(page.locator("div[class*='Celebration_']:visible")).toHaveCount(0);
});

test("a hosted file restores and plays embedded audio", async ({ page }) => {
  const sampleRate = 8000;
  const wave = Buffer.alloc(44 + sampleRate * 2);
  wave.write("RIFF", 0);
  wave.writeUInt32LE(wave.length - 8, 4);
  wave.write("WAVEfmt ", 8);
  wave.writeUInt32LE(16, 16);
  wave.writeUInt16LE(1, 20);
  wave.writeUInt16LE(1, 22);
  wave.writeUInt32LE(sampleRate, 24);
  wave.writeUInt32LE(sampleRate * 2, 28);
  wave.writeUInt16LE(2, 32);
  wave.writeUInt16LE(16, 34);
  wave.write("data", 36);
  wave.writeUInt32LE(sampleRate * 2, 40);
  const url = "https://classroom.example/recording.txt";
  await page.route(url, (route) => route.fulfill({
    contentType: "text/plain",
    headers: { "Access-Control-Allow-Origin": "*" },
    body: "Activity Link:\nhttps://www.classinteractives.co.uk/?id=32\n\n" +
      "ActivityData:" + compressText("[local]\n0\n0.8\nA *word") + "|¦|data:audio/wav;base64," + wave.toString("base64"),
  }));
  await page.goto("/?" + new URLSearchParams({ txt: url }));
  const audio = page.locator("audio");
  await expect.poll(() => audio.evaluate((clip) => clip.readyState)).toBeGreaterThanOrEqual(2);
  await page.getByRole("button", { name: "Repeat Audio" }).click();
  await expect.poll(() => audio.evaluate((clip) => clip.currentTime)).toBeGreaterThan(0);
});

test("timer plays the teacher cue once when sound is enabled", async ({ page }) => {
  await page.addInitScript(() => {
    window.timerNoteCount = 0;
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (...args) {
      window.timerNoteCount++;
      return start.apply(this, args);
    };
  });
  await page.goto(directUrl("11", "Bell:2"));
  const enable = page.getByRole("button", { name: "Enable sound" });
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  if (await enable.isVisible()) await enable.click();
  await expect(page.getByText("Time’s up", { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.timerNoteCount)).toBe(4);
});


test("an old activity with an unrecognized option can still be edited and run in Free Entry", async ({ page }) => {
  const text = "OPTIONS:gridsize=4,legacy_tag=keep\nhttps://upload.wikimedia.org/classroom-demo.jpg";
  await page.goto("/?id=999");
  await page.getByLabel("Choose an activity file").setInputFiles({
    name: "Legacy image reveal.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Activity Link:\nhttps://www.classinteractives.co.uk/?id=2\n\nActivityData:" + compressText(text)),
  });
  await page.getByRole("button", { name: "Load file" }).click();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  const free = page.getByRole("tab", { name: "Free Entry" });
  await expect(free).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Builder" }).click();
  await expect(free).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("textbox", { name: "Activity text" })).toHaveValue(text);
  await runActivity(page);
  await expect(page.getByAltText("Reveal")).toBeAttached();
});

test("Quiz Board edits become the same text format used by the player", async ({ page }) => {
  await page.goto("/?id=5");
  await page.getByRole("textbox", { name: "Columns" }).fill("2");
  const card = page.getByRole("group", { name: "Question 1", exact: true });
  await card.getByRole("textbox", { name: "Question", exact: true }).fill("What is 3 plus 6?");
  await card.getByRole("textbox", { name: "Answer", exact: true }).fill("Nine");
  await page.getByRole("tab", { name: "Free Entry" }).click();
  await expect(page.getByRole("textbox", { name: "Activity text" }))
    .toHaveValue(/^OPTIONS:columns=2\nWhat is 3 plus 6\?@Nine\n/);
  await page.getByRole("tab", { name: "Builder" }).click();
  await runActivity(page);
  await page.getByText("Q1", { exact: true }).click();
  await expect(page.getByText("What is 3 plus 6?", { exact: true })).toBeVisible();
  await page.getByText("What is 3 plus 6?", { exact: true }).click();
  await expect(page.getByText("Nine", { exact: true })).toBeVisible();
});

test("Gold Run accepts colons inside answers as its player does", async ({ page }) => {
  await page.goto("/?id=36");
  const clue = page.getByRole("group", { name: "Clue 1", exact: true });
  await clue.getByRole("textbox", { name: "Clue" }).fill("When does school start?");
  await clue.getByRole("textbox", { name: "Answer" }).fill("At 09:30");
  await page.getByRole("tab", { name: "Free Entry" }).click();
  await expect(page.getByRole("textbox", { name: "Activity text" }))
    .toHaveValue(/^TIME:60\nWhen does school start\?:At 09:30\n/);
  await page.getByRole("tab", { name: "Builder" }).click();
  await runActivity(page);
  await expect(page.getByRole("heading", { level: 1, name: "Gold Run", exact: true })).toBeVisible();
  await expect(page.getByText("This activity couldn’t be displayed.")).toHaveCount(0);
});
