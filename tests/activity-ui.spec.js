const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");
const { activities } = require("../src/activities");
const { compressText } = require("../src/activityFormat");

const mapFile = path.join(__dirname, "..", "public", "examples", "africa-map.svg");
const photoUrl = "https://fixtures.class-interactives.test/reveal.svg";
const landscape = '<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1600"><rect width="2400" height="1600" fill="#39705a"/><circle cx="1200" cy="800" r="620" fill="#faf4d5"/></svg>';

const exact = { exact: true };
const text = (page, label) => page.getByText(label, exact);
const button = (page, name) => page.getByRole("button", { name, exact: true });
const cssModule = (page, component, part) => page.locator('[class*="' + component + '_' + part + '__"]');

async function enter(page, value) {
  const field = page.getByRole("textbox").last();
  await field.fill(value);
  await button(page, "Submit").click();
}

async function mouseDrag(page, from, to) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 12, from.y + 2, { steps: 4 });
  await page.mouse.move(to.x, to.y, { steps: 18 });
  await page.mouse.up();
}

async function center(locator) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

const canvasImage = (locator) => locator.evaluate((canvas) => canvas.toDataURL());

function activityUrl(base, old, id, content) {
  return (base || "") + (old ? "/archive/" : "/") + "?" + new URLSearchParams({ id, txt: compressText(content) });
}

const scenarios = {
  1: {
    label: "reveals and resets the phrase",
    content: "OPTIONS:show=first,order=maintain\nThe cat sat on the mat",
    async play({ page }) {
      const word = cssModule(page, "PhraseMemorise", "clickableWord").nth(1);
      await expect(word).not.toHaveText("cat");
      await button(page, "Reveal").click();
      await expect(word).toHaveText("cat");
      await button(page, "Reset").click();
      await expect(word).not.toHaveText("cat");
    },
  },
  2: {
    label: "reveals a tile on a large image",
    content: "OPTIONS:gridsize=5,scale=1.2\n" + photoUrl,
    async play({ page, old }) {
      const tiles = page.locator(".image-box");
      await expect.poll(() => page.getByAltText("Reveal").evaluate((image) => image.naturalWidth)).toBe(2400);
      await expect(tiles).toHaveCount(25);
      const bounds = await tiles.last().boundingBox();
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(1260);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(900);
      if (old) {
        await tiles.last().click();
        await expect(tiles.last()).toHaveClass(/image-box-reveal/);
        return;
      }
      await button(page, "Reveal tile 25").press("Enter");
      await expect(button(page, "Revealed tile 25")).toBeDisabled();
      await page.setViewportSize({ width: 390, height: 680 });
      await expect(button(page, "Revealed tile 25")).toBeDisabled();
      const resized = await tiles.last().boundingBox();
      expect(resized.x + resized.width).toBeLessThanOrEqual(390);
      expect(resized.y + resized.height).toBeLessThanOrEqual(680);
    },
  },
  3: {
    label: "drags a term by its card and accepts the correct definition",
    content: "Term 1\nDefinition 1\n\nTerm 2\nDefinition 2\n\nTerm 3\nDefinition 3",
    async play({ page, old }) {
      const card = page.locator("[data-rfd-draggable-id]").filter({ has: text(page, "Term 1") });
      const definition = page.locator("[data-rfd-droppable-id]").filter({ has: text(page, "Definition 1") });
      await expect(card).toBeVisible();
      await expect(definition).toBeVisible();
      const bounds = await card.boundingBox();
      const from = { x: bounds.x + bounds.width - 12, y: bounds.y + 8 };
      await mouseDrag(page, from, await center(definition));
      await expect(card).toHaveCount(0);
      if (!old) await expect(page.getByRole("status")).toHaveText("1 of 3 matched.");
    },
  },
  4: {
    label: "records a wrong guess and accepts a corrected gap",
    content: "There are *30 books and *50 pens.",
    async play({ page, old }) {
      const gap = old ? page.locator("input[data-word]") : page.getByRole("textbox", { name: "Missing word or number" });
      const answer = await gap.getAttribute("data-word");
      await gap.fill("99");
      await gap.press("Enter");
      await expect(text(page, "✖")).toBeVisible();
      await gap.fill(answer);
      await gap.press("Enter");
      await expect(gap).not.toHaveAttribute("data-word", answer);
    },
  },
  5: {
    label: "cycles a square from question number to answer",
    async play({ page }) {
      await text(page, "Q1").click();
      await text(page, "What is the capital of France?").click();
      await expect(text(page, "Paris")).toBeVisible();
    },
  },
  6: {
    label: "adds a timeline label and redraws the canvas",
    async play({ page }) {
      const canvas = page.locator("canvas");
      await expect(canvas).toBeVisible();
      const before = await canvasImage(canvas);
      await button(page, "Add Item").click();
      await enter(page, "New milestone");
      await expect.poll(() => canvasImage(canvas)).not.toBe(before);
    },
  },
  7: {
    label: "moves a selected horse forward",
    async play({ page }) {
      const horse = text(page, "🐎").first();
      await expect(horse).toBeVisible();
      const before = await horse.evaluate((element) => element.style.left);
      await horse.click();
      await expect.poll(() => horse.evaluate((element) => element.style.left)).not.toBe(before);
    },
  },
  8: {
    label: "scores a correct left/right answer",
    content: "*Apple\n---\nAple",
    async play({ page }) {
      await text(page, "Apple").click();
      await button(page, "Submit").click();
      await expect(page.getByText(/You scored 1/)).toBeVisible();
    },
  },
  9: {
    label: "adds a term and drags it into a category",
    async play({ page, old }) {
      await page.getByRole("button", { name: /^Add Item$/i }).click();
      await enter(page, "Pear");
      const pear = page.locator(".term").filter({ hasText: "Pear" });
      const fruit = page.locator(".categoryBox").filter({ hasText: "Fruit" });
      await expect(pear).toBeVisible();
      if (!old) {
        await pear.getByRole("button", { name: "Pear", exact: true }).dragTo(fruit);
        await expect(fruit.locator(".term")).toContainText("Pear");
        return;
      }
      const destination = await center(fruit);
      await mouseDrag(page, await center(pear), destination);
      await expect.poll(async () => Math.abs((await center(pear)).x - destination.x)).toBeLessThan(6);
      await expect.poll(async () => Math.abs((await center(pear)).y - destination.y)).toBeLessThan(6);
    },
  },
  10: {
    label: "answers a question and submits the quiz",
    async play({ page }) {
      await button(page, "E").click();
      await page.getByRole("button", { name: /^Submit Answers/ }).click();
      await expect(page.locator(".score")).toContainText(/Score/i);
    },
  },
  11: {
    label: "pauses and resumes a countdown",
    async play({ page, old }) {
      const pause = old ? button(page, "⏸️") : button(page, "Pause");
      const resume = old ? button(page, "▶️") : button(page, "Resume");
      await pause.click();
      await expect(resume).toBeVisible();
      await resume.click();
      await expect(pause).toBeVisible();
    },
  },
  12: {
    label: "removes an entry and redraws the wheel",
    async play({ page }) {
      const canvas = page.locator("canvas");
      await expect(canvas).toBeVisible();
      const before = await canvasImage(canvas);
      await text(page, "Violin").click();
      await expect(text(page, "Violin")).toHaveCount(0);
      await expect.poll(() => canvasImage(canvas)).not.toBe(before);
    },
  },
  13: {
    label: "creates a block and moves it",
    async play({ page }) {
      await page.getByRole("button", { name: /^Add item$/i }).click();
      await enter(page, "New block");
      const block = page.locator(".draggableBox").filter({ hasText: "New block" });
      const start = await center(block);
      const move = start.x < 650 ? 45 : -45;
      await mouseDrag(page, start, { x: start.x + move, y: start.y + 18 });
      await expect.poll(async () => (await center(block)).x).not.toBe(start.x);
    },
  },
  14: {
    label: "adds and removes a star from a team",
    async play({ page, old }) {
      const team = page.locator(".ScoreBar").filter({ hasText: "Team 2" });
      await button(team, old ? "+" : "Add star to Team 2").click();
      await expect(team.locator("span")).toHaveText("⭐");
      await button(team, old ? "-" : "Remove star from Team 2").click();
      await expect(team.locator("span")).toBeEmpty();
    },
  },
  15: {
    label: "rotates a puzzle square",
    async play({ page }) {
      const square = page.locator(".square").first();
      await expect(square).toBeVisible();
      const original = await square.locator(".label").allTextContents();
      await square.locator(".rotate-button").click();
      expect(await square.locator(".label").allTextContents()).toEqual([original[3], ...original.slice(0, 3)]);
    },
  },
  16: {
    label: "opens a clue and marks its typed answer",
    async play({ page }) {
      await text(page, "Capital of France").click();
      const input = page.getByRole("textbox");
      await input.fill("Paris");
      await input.press("Enter");
      await expect(text(page, "Paris")).toBeVisible();
    },
  },
  17: {
    label: "solves an anagram by dragging a letter",
    content: "Greeting\nhi",
    async play({ page }) {
      const letters = page.locator(".word .tile");
      await expect(letters).toHaveText(["i", "h"]);
      await letters.nth(1).dragTo(letters.nth(0));
      await expect(page.locator(".pair")).toHaveClass(/completed/);
      await expect(letters).toHaveText(["h", "i"]);
    },
  },
  18: {
    label: "places a word from the bank into its gap",
    content: "*Paris is in France\n*Rome is in Italy",
    async play({ page }) {
      const paris = page.locator(".wordBank .wordTile").filter({ hasText: "Paris" });
      const gap = page.locator(".gap").first();
      await expect(paris).toBeVisible();
      await paris.dragTo(gap);
      await expect(page.locator(".sentence").first()).toContainText("Paris");
    },
  },
  19: {
    label: "loads its map and accepts a correct label",
    async play({ page, old }) {
      const picture = old ? cssModule(page, "ImagePins", "imagePinImage") : page.getByAltText("Locations to label");
      await expect.poll(() => picture.evaluate((image) => image.naturalWidth)).toBe(1200);
      if (old) {
        const pin = cssModule(page, "ImagePins", "pin").first();
        await pin.dblclick();
        await enter(page, "Zambia");
        await expect(cssModule(page, "ImagePins", "pinLabel").filter({ hasText: "Zambia" })).toBeVisible();
        return;
      }
      await expect(picture).toHaveAttribute("src", "/examples/africa-map.svg");
      await expect(page.getByRole("link", { name: "CC BY-SA 3.0" })).toBeVisible();
      await button(page, "Edit pin 1").click();
      await enter(page, "wrong");
      await expect(text(page, "Try another label.")).toBeVisible();
      await button(page, "Edit pin 1").click();
      await enter(page, "Zambia");
      await expect(button(page, "Correct label: Zambia")).toBeVisible();
    },
  },
  20: {
    label: "flips and removes a flashcard",
    content: "A front|The reverse",
    async play({ page }) {
      await expect(text(page, "A front")).toBeVisible();
      await button(page, "Flip").click();
      await expect(text(page, "The reverse")).toBeVisible();
      await button(page, "Remove").click();
      await expect(text(page, "No more cards in the deck.")).toBeVisible();
    },
  },
  21: {
    label: "reveals a letter then accepts a whole-word guess",
    content: "Fruit\n\nApple\nPear",
    async play({ page, old }) {
      const tile = cssModule(page, "WordFind", "wordTile").first();
      await button(tile, old ? "🔍" : "Reveal next letter").click();
      await expect(tile).toContainText("Ap___");
      await button(tile, old ? "✏️" : "Guess word").click();
      await enter(page, "apple");
      await expect(tile).toHaveText("Apple");
    },
  },
  22: {
    label: "submits four related tiles and moves them to the solved area",
    async play({ page }) {
      for (const word of ["cat", "frog", "dog", "lion"]) await text(page, word).click();
      await button(page, "Check").click();
      await expect(cssModule(page, "Connect", "CorrectGroup")).toContainText(/cat|dog/);
      await expect(cssModule(page, "Connect", "GameAreaGrid")).not.toContainText("frog");
    },
  },
  23: {
    label: "finds a word by clicking its endpoints",
    content: "OPTIONS:size=8,show=yes,simple=yes,reveal=yes\nAnimals\nzebra\ntiger",
    async play({ page }) {
      const rows = cssModule(page, "WordSearch", "WordSearchRow");
      await expect(rows).toHaveCount(8);
      const cellSelector = '[class*="WordSearch_WordSearchCell__"]';
      const grid = await rows.evaluateAll((elements, selector) =>
        elements.map((element) => [...element.querySelectorAll(selector)].map((cell) => cell.textContent)), cellSelector);
      const word = "ZEBRA";
      const directions = [-1, 0, 1].flatMap((dy) => [-1, 0, 1].map((dx) => [dy, dx]));
      const matches = grid.flatMap((row, y) => row.flatMap((_, x) =>
        directions.filter(([dy, dx]) => [...word].every((letter, i) =>
          grid[y + i * dy]?.[x + i * dx] === letter)).map(([dy, dx]) => [y, x, y + 4 * dy, x + 4 * dx])));
      expect(matches).toHaveLength(1);
      const [startRow, startCol, endRow, endCol] = matches[0];
      await rows.nth(startRow).locator(cellSelector).nth(startCol).click();
      await rows.nth(endRow).locator(cellSelector).nth(endCol).click();
      await expect(cssModule(page, "WordSearch", "WordList").getByText("ZEBRA", exact)).toHaveClass(/Found|found/);
    },
  },
  24: {
    label: "moves a side tile into the diamond by selection",
    async play({ page }) {
      const side = cssModule(page, "DiamondNine", "sideCollection");
      const diamond = cssModule(page, "DiamondNine", "diamondFormation");
      const health = cssModule(side, "DiamondNine", "tile").filter({ hasText: /^Health/ });
      await health.click();
      await cssModule(diamond, "DiamondNine", "diamondTile").first().click();
      await expect(cssModule(diamond, "DiamondNine", "diamondTile").first()).toContainText("Health");
      await expect(health).toHaveCount(0);
    },
  },
  25: {
    label: "bets on an answer and advances with the updated fund",
    async play({ page }) {
      await text(page, "E").click();
      await button(page, "Submit Final Answer").click();
      await expect(text(page, "What is the next number after 10?")).toBeVisible();
      await expect(text(page, "Current Fund: $640")).toBeVisible();
    },
  },
  26: {
    label: "moves a canvas shape",
    content: "(140,140),(370,140),(370,440)",
    async play({ page }) {
      const canvas = page.locator("canvas").first();
      await expect(canvas).toBeVisible();
      const box = await canvas.boundingBox();
      const unit = box.height / 1000;
      const prior = await canvasImage(canvas);
      const from = { x: box.x + 140 * unit, y: box.y + 140 * unit };
      await mouseDrag(page, from, { x: from.x + 60, y: from.y + 40 });
      await expect.poll(() => canvasImage(canvas)).not.toBe(prior);
    },
  },
  27: {
    label: "reorders and submits a group",
    content: "Alphabetical\n\ncat\nfrog\n\napple\norange",
    async play({ page }) {
      const items = cssModule(page, "Order", "stackItem");
      await expect(items).toHaveCount(2);
      if ((await items.first().textContent()).trim() !== "cat") {
        await items.nth(1).dragTo(items.first(), { targetPosition: { x: 8, y: 2 } });
      }
      await expect(items.first()).toHaveText("cat");
      await button(page, "Submit").click();
      await expect(text(page, "apple")).toBeVisible();
    },
  },
  28: {
    label: "writes an answer and opens its marking points",
    async play({ page }) {
      const answer = page.getByPlaceholder("Type your answer here...");
      await answer.fill("An indexed collection of elements");
      await button(page, "Review").click();
      await expect(page.getByText(/collection of elements/i).last()).toBeVisible();
      await expect(answer).toHaveValue("An indexed collection of elements");
    },
  },
  29: {
    label: "adds a category and starts recording time",
    async play({ page }) {
      await page.getByPlaceholder("New category").fill("Pair work");
      await button(page, "Add Category").click();
      await expect(text(page, "Pair work")).toBeVisible();
      await button(page, "START").click();
      await text(page, "Pair work").click();
      await expect(button(page, "PAUSE")).toBeVisible();
      const category = cssModule(page, "TimeRecorder", "category").filter({ has: text(page, "Pair work") });
      await expect(cssModule(category, "TimeRecorder", "categoryTime")).not.toHaveText("0:00");
    },
  },
  30: {
    label: "accepts a correct keyboard guess",
    content: "Fruit\n\napple\nplum",
    async play({ page }) {
      await expect(text(page, "Score: 0")).toBeVisible();
      for (const letter of "apple") await page.keyboard.press(letter);
      await expect(text(page, "Score: 1")).toBeVisible();
    },
  },
  31: {
    label: "draws a raffle ball and reports a result",
    content: "OPTIONS:drop_all=yes,group_size=1\nAvery",
    async play({ page }) {
      await button(page, "SELECT").click();
      await expect(text(page, "Results")).toBeVisible();
      await expect(page.getByText(/1\.\s*Avery/)).toBeVisible({ timeout: 12000 });
    },
  },
  32: {
    label: "completes a transcript gap and advances to the next clip",
    content: "https://www.youtube.com/watch?v=sqlbmwu4pJ8\n0\n1\nThe *first clip.\n\nhttps://www.youtube.com/watch?v=Vb9NWBcu5Ew\n0\n1\nThe *second clip.",
    async play({ page }) {
      await button(page, "Repeat Audio").click();
      const gap = page.locator("input[data-word]");
      await gap.fill("first");
      await button(page, "Next Question").click();
      await expect(gap).toHaveAttribute("data-word", "second");
    },
  },
  33: {
    label: "adds a card to a Kanban column",
    async play({ page }) {
      const primary = cssModule(page, "KanbanBoard", "kanbanColumn").filter({ has: text(page, "PRIMARY") });
      await button(primary, "Add").click();
      await enter(page, "Plan a lesson");
      await expect(text(primary, "Plan a lesson")).toBeVisible();
    },
  },
  34: {
    label: "adds an item to the diagram",
    async play({ page }) {
      await button(page, "Add").first().click();
      await enter(page, "A new definition");
      await expect(text(page, "A new definition")).toBeVisible();
    },
  },
  35: {
    label: "adds, edits and deletes a label and branch",
    async play({ page, old }) {
      await button(page, "Add Branch").click();
      await enter(page, "Planning");
      const branch = old ? text(page, "Planning") : button(page, "Edit branch Planning");
      const addLabel = old ? text(page, "+") : button(page, "Add label to Planning");
      await expect(branch).toBeVisible();
      if (!old) {
        const canvas = await page.locator("canvas").boundingBox();
        const control = await addLabel.boundingBox();
        expect(control.y).toBeGreaterThanOrEqual(canvas.y);
        expect(control.y + control.height).toBeLessThanOrEqual(canvas.y + canvas.height);
        const addBranch = await button(page, "Add Branch").boundingBox();
        const spacing = await button(page, "Space ↑").boundingBox();
        expect(spacing.x - (addBranch.x + addBranch.width)).toBeGreaterThan(0);
      }
      await addLabel.click();
      await enter(page, "Materials");
      const label = old ? text(page, "Materials") : button(page, "Edit label Materials");
      await label.click(old ? { button: "right" } : {});
      await enter(page, "Resources");
      const renamed = old ? text(page, "Resources") : button(page, "Edit label Resources");
      await renamed.click(old ? { button: "right" } : {});
      await button(page, "Delete").click();
      await expect(renamed).toHaveCount(0);
      await branch.click(old ? { button: "right" } : {});
      await button(page, "Delete").click();
      await expect(branch).toHaveCount(0);
    },
  },
  36: {
    label: "reveals a clue answer and records a correct hex",
    async play({ page }) {
      const hex = cssModule(page, "GoldRun", "hexUnanswered").first();
      await hex.click();
      await button(page, "REVEAL").click();
      await expect(cssModule(page, "GoldRun", "answerText")).not.toBeEmpty();
      await button(page, "I WAS CORRECT").click();
      await expect(cssModule(page, "GoldRun", "hexCorrect")).toHaveCount(1);
    },
  },
};

test("every registered activity has a playable scenario", () => {
  expect(Object.keys(scenarios)).toEqual(activities.map(({ id }) => id));
});

for (const old of [false, true]) {
  test.describe(old ? "Archived players" : "Updated players", () => {
    for (const activity of activities) {
      const { id, name, example } = activity;
      const scenario = scenarios[id];
      // The pinned archive contains activity IDs 1–36.
      if (!scenario || (old && Number(id) > 36)) continue;
      test(id + " " + name + " " + scenario.label, async ({ page, baseURL }) => {
        const base = process.env.ACTIVITY_UI_URL || baseURL;
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.setViewportSize({ width: 1260, height: 900 });
        await page.route("**/*", (route) => {
          const url = new URL(route.request().url());
          if (url.origin === base || url.origin === "null") return route.continue();
          if (url.href === photoUrl) return route.fulfill({ contentType: "image/svg+xml", body: landscape });
          if (url.hostname === "upload.wikimedia.org" && url.pathname.includes("Africa_map.svg")) {
            return route.fulfill({ contentType: "image/svg+xml", body: fs.readFileSync(mapFile) });
          }
          return route.abort();
        });
        await page.goto(activityUrl(base, old, id, scenario.content || example));
        await scenario.play({ page, old });
        expect(errors).toEqual([]);
      });
    }
  });
}

test("Match Drag & Drop accepts a tablet touch drag from the card padding", async ({ browser, baseURL }) => {
  const base = process.env.ACTIVITY_UI_URL || baseURL;
  const context = await browser.newContext({
    viewport: { width: 820, height: 1050 }, hasTouch: true, isMobile: true,
  });
  try {
    await context.route("**/*", (route) => new URL(route.request().url()).origin === base ?
      route.continue() : route.abort());
    const page = await context.newPage();
    await page.goto(activityUrl(base, false, "3", scenarios[3].content));
    const card = page.locator("[data-rfd-draggable-id]").filter({ has: text(page, "Term 1") });
    const target = page.locator("[data-rfd-droppable-id]").filter({ has: text(page, "Definition 1") });
    await expect(card).toBeVisible();
    const bounds = await card.boundingBox();
    const start = { x: bounds.x + bounds.width - 12, y: bounds.y + 8 };
    const end = await center(target);
    const cdp = await context.newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [start] });
    // The drag sensor uses a long press to distinguish movement from page scrolling.
    await page.waitForTimeout(220);
    for (let step = 1; step <= 15; step++) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: start.x + (end.x - start.x) * step / 15, y: start.y + (end.y - start.y) * step / 15 }],
      });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(page.getByRole("status")).toHaveText("1 of 3 matched.");
  } finally {
    await context.close();
  }
});

test("Fishbone offers its edit and delete controls on a touch phone", async ({ browser, baseURL }) => {
  const base = process.env.ACTIVITY_UI_URL || baseURL;
  const context = await browser.newContext({
    viewport: { width: 390, height: 720 }, hasTouch: true, isMobile: true,
  });
  try {
    await context.route("**/*", (route) => new URL(route.request().url()).origin === base ?
      route.continue() : route.abort());
    const page = await context.newPage();
    await page.goto(activityUrl(base, false, "35", "Lesson planning\nResources"));
    await button(page, "Add label to Resources").tap();
    await enter(page, "Worksheets");
    const label = button(page, "Edit label Worksheets");
    await label.tap();
    await button(page, "Delete").tap();
    await expect(label).toHaveCount(0);
    const branch = button(page, "Edit branch Resources");
    await branch.tap();
    await button(page, "Delete").tap();
    await expect(branch).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  } finally {
    await context.close();
  }
});

test("Image Reveal explains a failed custom image link", async ({ page, baseURL }) => {
  const base = process.env.ACTIVITY_UI_URL || baseURL;
  await page.route(photoUrl, (route) => route.fulfill({ status: 404 }));
  await page.goto(activityUrl(base, false, "2", photoUrl));
  await expect(page.getByRole("alert")).toContainText("The image couldn’t be loaded.");
  await expect(page.locator(".image-box")).toHaveCount(0);
});
