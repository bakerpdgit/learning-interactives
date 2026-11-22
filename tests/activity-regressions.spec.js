const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");
const { activities } = require("../src/activities");
const { compressText, readActivityFile } = require("../src/activityFormat");

const button = (page, name) => page.getByRole("button", { name, exact: true });
const area = (page) => page.locator(".activityPlayer");
const canvasImage = (page) => page.locator(".activityPlayer canvas").first().evaluate((canvas) => canvas.toDataURL());
const pictureUrl = "https://fixtures.class-interactives.test/unavailable.png";

async function open(page, id, text) {
  await page.goto((process.env.ACTIVITY_UI_URL || "") + "/?" + new URLSearchParams({ id, txt: compressText(text) }));
  await expect(area(page)).toBeVisible();
}

async function enter(page, value) {
  await page.getByRole("dialog").getByRole("textbox").fill(value);
  await button(page, "Submit").click();
}

async function fitsPlayer(page) {
  await expect.poll(() => area(page).evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(2);
}

test.beforeEach(async ({ page, baseURL }) => {
  const base = process.env.ACTIVITY_UI_URL || baseURL;
  await page.route("**/*", (route) => {
    const { origin } = new URL(route.request().url());
    return origin === base || origin === "null" ? route.continue() : route.abort();
  });
});

test.describe("phone input and layouts", () => {
  test.use({ viewport: { width: 390, height: 760 }, hasTouch: true, isMobile: true });

  test("Word Match accepts phone text, Backspace, and a correct guess", async ({ page }) => {
    await open(page, "30", "Fruit\n\napple\nplum\nelderberry");
    const tiles = page.locator('[class*="WordMatch_wordsContainer__"]');
    await expect.poll(() => tiles.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(2);
    const guess = page.getByRole("textbox", { name: "Your guess" });
    await guess.tap();
    await expect(guess).toBeFocused();
    await guess.fill("appx");
    await guess.press("Backspace");
    await expect(guess).toHaveValue("app");
    await guess.press("l");
    await guess.press("e");
    await expect(page.getByText("Score: 1", { exact: true })).toBeVisible();
    await expect(guess).toHaveValue("");
  });

  test("Anagram handles repeated-only answers and accepts tap placement", async ({ page }) => {
    await open(page, "17", "A repeated answer\nAA\n\nA greeting\nhi\n\nA longer answer\nABCDEFGHIJKLMNOPQRSTUVWXYZ");
    await expect(page.locator(".pair").filter({ hasText: "A repeated answer" })).toContainText("Solved");
    const greeting = page.locator(".pair").filter({ hasText: "A greeting" });
    await button(greeting, "h, position 2").tap();
    await button(greeting, "i, position 1").tap();
    await expect(greeting).toContainText("Solved");
    await fitsPlayer(page);
  });

  test("Diamond Nine exposes tiles and edit controls without horizontal scrolling", async ({ page }) => {
    await open(page, "24", "OPTIONS:editing=yes\nPriorities\nHealth and social care\nEducation\nTransport");
    await fitsPlayer(page);
    await button(page, "Health and social care").press("Enter");
    await button(page, "Place at rank 1, place 1").press("Enter");
    const diamond = page.locator('[class*="DiamondNine_diamondFormation__"]');
    await expect(button(diamond, "Health and social care")).toBeVisible();
    await button(diamond, "Edit Health and social care").press("Enter");
    await enter(page, "Health");
    await expect(button(diamond, "Health")).toBeVisible();
  });

  test("Gold Run records an incorrect answer and closes a clue at expiry", async ({ page }) => {
    await page.clock.install();
    await open(page, "36", activities.find(({ id }) => id === "36").example.replace(/^TIME:\d+/, "TIME:10"));
    const available = page.locator('[class*="GoldRun_hexUnanswered__"]');
    await available.first().tap();
    const clue = page.getByRole("dialog", { name: "Gold Run clue" });
    await button(clue, "REVEAL").tap();
    await button(clue, "I WAS INCORRECT").tap();
    await expect(page.locator('[class*="GoldRun_hexIncorrect__"]')).toHaveCount(1);
    await available.first().tap();
    await expect(clue).toBeVisible();
    await page.clock.runFor(10_500);
    await expect(clue).toHaveCount(0);
    await expect(page.getByText(/Time's up!/)).toBeVisible();
  });
});

test("Word Complete displays literal text and advances duplicate gaps independently", async ({ page }) => {
  await open(page, "4", "Use <b> tags & compare 1 < 2.\nAnswer *35 and *35.");
  await expect(area(page)).toContainText("Use <b> tags & compare 1 < 2.");
  await expect(area(page).locator("b")).toHaveCount(0);
  const gap = page.getByRole("textbox", { name: "Missing word or number" });
  await gap.fill("0");
  await gap.press("Enter");
  await expect(gap).toHaveAttribute("aria-invalid", "true");
  for (const remaining of [1, 0]) {
    await gap.fill("35");
    await gap.press("Enter");
    await expect(page.getByText("Gaps remaining: " + remaining, { exact: false })).toBeVisible();
  }
  await expect(gap).toHaveCount(0);
  await expect(page.getByText("Streak: 2 · Gaps remaining: 0")).toBeVisible();
});

test("Categorise keeps assigned and duplicate terms separate through resize", async ({ page }) => {
  await open(page, "9", "Fruit\nAnimals\n\nApple\nApple\nLynx");
  await button(page, "Apple").first().press("Enter");
  await button(page, "Fruit").press("Enter");
  await button(page, "Lynx").press("Enter");
  await button(page, "Animals").press("Enter");
  await page.setViewportSize({ width: 390, height: 760 });
  const box = (name) => page.locator(".categoryBox").filter({ has: button(page, name) });
  await expect(button(box("Fruit"), "Apple")).toHaveCount(1);
  await expect(button(box("Word bank"), "Apple")).toHaveCount(1);
  await expect(button(box("Animals"), "Lynx")).toBeVisible();
});

test("Word Banks supports keyboard placement and putting a filled tile into the other gap", async ({ page }) => {
  await open(page, "18", "*Paris and *Rome");
  await button(page, "Paris").press("Enter");
  await button(page, "Place in gap 3").press("Enter");
  await button(page, "Paris, gap 3").press("Enter");
  await button(page, "Place in gap 1").press("Enter");
  await button(page, "Rome").press("Enter");
  await button(page, "Place in gap 3").press("Enter");
  await expect(page.locator(".sentence.completed")).toContainText(/Paris.*Rome/);
});

test("WordSearch uses arrow navigation and accepts backwards endpoints", async ({ page }) => {
  await open(page, "23", "OPTIONS:size=5,show=yes,simple=yes\nAnimals\nzebra");
  const grid = page.getByRole("group", { name: "Word search grid" });
  const cells = grid.locator("[data-cell]");
  await expect(cells).toHaveCount(25);
  const letters = await cells.allTextContents();
  const word = "ZEBRA";
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  const match = letters.flatMap((_, index) => {
    const row = Math.floor(index / 5), column = index % 5;
    return directions.filter(([dy, dx]) => [...word].every((letter, offset) => {
      const c = column + dx * offset, r = row + dy * offset;
      return c >= 0 && c < 5 && r >= 0 && r < 5 && letters[r * 5 + c] === letter;
    })).map(([dy, dx]) => [row, column, row + dy * 4, column + dx * 4]);
  })[0];
  expect(match).toBeDefined();
  const [firstRow, firstCol, lastRow, lastCol] = match;
  const first = grid.locator('[data-cell="' + firstRow + "-" + firstCol + '"]');
  const last = grid.locator('[data-cell="' + lastRow + "-" + lastCol + '"]');
  await last.press("Enter");
  await expect(last).toBeFocused();
  for (let row = lastRow; row > firstRow; row--) await page.keyboard.press("ArrowUp");
  for (let col = lastCol; col < firstCol; col++) await page.keyboard.press("ArrowRight");
  for (let col = lastCol; col > firstCol; col--) await page.keyboard.press("ArrowLeft");
  await expect(first).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("listitem").filter({ hasText: /^ZEBRA$/ })).toHaveClass(/FoundWord/);
});

test("Geometry and Ordered Line expose keyboard controls for on-canvas objects", async ({ page }) => {
  await open(page, "26", "(140,140),(370,140),(370,440)");
  const before = await canvasImage(page);
  await button(page, "Move right").press("Enter");
  await expect.poll(() => canvasImage(page)).not.toBe(before);
  await button(page, "Duplicate shape").press("Enter");
  const shape = page.getByRole("combobox", { name: "Shape", exact: true });
  await expect(shape.locator("option")).toHaveCount(2);
  await shape.selectOption("1");
  await page.getByRole("combobox", { name: "Move", exact: true }).selectOption("0");
  await button(page, "Add vertex after selected").press("Enter");
  await expect(page.getByRole("combobox", { name: "Move", exact: true }).locator("option")).toHaveCount(5);
  await button(page, "Remove selected vertex").press("Enter");
  await expect(page.getByRole("combobox", { name: "Move", exact: true }).locator("option")).toHaveCount(4);

  await open(page, "6", "Start-End\nMilestone");
  await expect(page.getByLabel("Timeline label")).toHaveValue("0");
  const timeline = await canvasImage(page);
  await button(page, "Move right").press("Enter");
  await expect.poll(() => canvasImage(page)).not.toBe(timeline);
  await button(page, "Label colour").press("Enter");
  await expect(page.getByText("Choose Background Color", { exact: true })).toBeVisible();
});

test("Ordered Line swaps ranks in the Builder and checks both axes in play", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0.5; });
  await page.goto((process.env.ACTIVITY_UI_URL || "") + "/?id=6");
  await page.getByLabel("X-axis label", { exact: true }).fill("Date");
  await page.getByLabel("Y-axis label", { exact: true }).fill("Significance");
  await button(page, "Remove item 3").click();
  await page.getByRole("checkbox", { name: "Mark X-axis ranks" }).check();
  await page.getByRole("checkbox", { name: "Mark Y-axis ranks" }).check();
  await page.getByLabel("X-axis rank for item 2").selectOption("1");
  await expect(page.getByLabel("X-axis rank for item 1")).toHaveValue("2");
  await button(page, "Add item").click();
  await expect(page.getByLabel("Y-axis rank for item 3")).toHaveValue("3");
  await button(page, "Remove item 3").click();
  await button(page, "Run activity").click();
  const canvas = page.getByRole("img", { name: "Date by Significance" });
  await expect(canvas).toBeVisible();
  await canvas.scrollIntoViewIfNeeded();
  const bounds = await canvas.boundingBox();
  const y = bounds.y + (bounds.height - 61) / 2 + 1;
  const selector = page.getByLabel("Timeline label");
  await expect(selector.locator("option")).toHaveCount(2);
  await page.mouse.click(bounds.x + bounds.width * 2 / 3, y);
  await expect(selector).toHaveValue("1");
  await button(page, "Check ranks").press("Enter");
  await expect(page.getByRole("status")).toContainText("Separate labels at the same position");
  for (const [from, x, height] of [[2 / 3, .2, .2], [1 / 3, .8, .7]]) {
    await page.mouse.move(bounds.x + bounds.width * from, y);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width * x, bounds.y + bounds.height * height, { steps: 8 });
    await page.mouse.up();
  }
  await button(page, "Check ranks").press("Enter");
  await expect(page.getByRole("status")).toHaveText(
    "X-axis (Date) — 2 of 2 ranks correct. Y-axis (Significance) — 2 of 2 ranks correct.",
  );
});

test("Categorise checks only keyed terms and can disable adding items", async ({ page }) => {
  await page.goto((process.env.ACTIVITY_UI_URL || "") + "/?id=9");
  await page.getByRole("checkbox", { name: "Allow students to add items" }).uncheck();
  const first = page.getByRole("group", { name: "Term 1", exact: true });
  await first.getByRole("button", { name: /^Correct category/ }).click();
  await page.getByRole("option", { name: "Fruit", exact: true }).click();
  await button(page, "Run activity").click();
  await expect(button(page, "Add item")).toHaveCount(0);
  await button(page, "Check categories").press("Enter");
  await expect(page.getByRole("status")).toHaveText("0 of 1 marked items in the correct category.");
  await page.getByRole("button", { name: "Apple Unplaced", exact: true }).press("Enter");
  await button(page, "Fruit").press("Enter");
  await button(page, "Check categories").press("Enter");
  await expect(page.getByRole("status")).toHaveText("1 of 1 marked items in the correct category.");
});

test("Multi-Choice defaults a newly keyed second answer to multiple select", async ({ page }) => {
  await page.goto((process.env.ACTIVITY_UI_URL || "") + "/?id=10");
  const question = page.getByRole("group", { name: "Question 1", exact: true });
  await question.getByRole("group", { name: "Answer 2", exact: true })
    .getByRole("checkbox", { name: "Correct answer" }).check();
  await expect(question.getByRole("button", { name: /^How to mark this question/ })).toHaveText("Multiple select (all correct answers)");
  await button(page, "Run activity").click();
  const played = page.getByRole("region", { name: "Question 1", exact: true });
  await button(played, "C").press("Enter");
  await button(played, "E").press("Enter");
  await expect(button(played, "C")).toHaveAttribute("aria-pressed", "true");
  await expect(button(played, "E")).toHaveAttribute("aria-pressed", "true");
  await button(played, "Check answers").press("Enter");
  await expect(played.getByRole("status")).toHaveText("Correct.");
});

test("Multi-Choice requires an exact set and preserves implicit alternatives", async ({ page }) => {
  await open(page, "10", "OPTIONS:selectall=1\n\nChoose both\n*A\n*B\nC\n\nChoose one\n*D\n*E");
  await button(page, "A").click();
  await button(page, "B").click();
  await button(page, "C").click();
  await button(page, "D").click();
  await button(page, "Submit Answers").click();
  await expect(page.getByText("Score: 1/2", { exact: true })).toBeVisible();
});

test("new Audio Complete clips start at zero and default to the clip end", async ({ page }) => {
  await page.goto((process.env.ACTIVITY_UI_URL || "") + "/?id=32");
  await button(page, "Add clip").click();
  const clip = page.getByRole("group", { name: "Clip 3", exact: true });
  await expect(clip.getByLabel("Start time (seconds)")).toHaveValue("0");
  await expect(clip.getByLabel("End time (seconds)")).toHaveAttribute("placeholder", "End of clip");
  await clip.getByRole("textbox", { name: "Video URL", exact: true }).fill("https://www.youtube.com/watch?v=sqlbmwu4pJ8");
  await clip.getByLabel("Sentence", { exact: true }).fill("Another *word");
  await page.getByRole("tab", { name: "Free Entry" }).click();
  await expect(page.getByLabel("Activity text")).toHaveValue(/\n0\nend\nAnother \*word$/);
});

test("Audio Complete reports a blocked external clip and provides recovery", async ({ page }) => {
  await page.clock.install();
  await open(page, "32", "https://www.youtube.com/watch?v=sqlbmwu4pJ8\n0\n1\nThe *first clip.");
  await expect(button(page, "Repeat Audio")).toBeVisible();
  await page.clock.runFor(8_100);
  await expect(page.getByText(/Audio isn’t playing/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Open the clip" })).toHaveAttribute("href", /youtube\.com/);
  await button(page, "Repeat Audio").click();
  await page.clock.runFor(8_100);
  await expect(page.getByText(/Audio isn’t playing/)).toBeVisible();
});

test("Audio Complete starts and replays the requested video from a playlist link", async ({ page }) => {
  await page.route("https://www.youtube.com/iframe_api", (route) => route.fulfill({
    contentType: "application/javascript",
    body: `
      window.YT = {
        PlayerState: { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 },
        Player: function (element, options) {
          window.clip = { options, starts: 0, seeks: [], time: options.playerVars.start };
          const frame = document.createElement("iframe");
          frame.style.width = "100%";
          frame.style.height = "100%";
          element.replaceWith(frame);
          this.playVideo = () => {
            window.clip.starts++;
            options.events.onStateChange({ data: 1 });
          };
          this.seekTo = (time) => { window.clip.seeks.push(time); window.clip.time = time; };
          this.pauseVideo = () => options.events.onStateChange({ data: 2 });
          this.getCurrentTime = () => window.clip.time;
          this.getDuration = () => 62;
          this.getVideoLoadedFraction = () => 1;
          this.destroy = () => frame.remove();
          setTimeout(() => options.events.onReady({ target: this }), 0);
        },
      };
      window.onYouTubeIframeAPIReady();
    `,
  }));
  await open(page, "32", "https://www.youtube.com/watch?v=sqlbmwu4pJ8&list=PL_TEST\n22.5\n30.5\nThe *first clip.");
  await expect(page.getByRole("status")).toHaveText("Playing audio.");
  const viewport = await area(page).locator("iframe").boundingBox();
  expect(viewport.width).toBeGreaterThanOrEqual(200);
  expect(viewport.height).toBeGreaterThanOrEqual(200);
  const {options, seeks} = await page.evaluate(() => window.clip);
  expect(options.videoId).toBe("sqlbmwu4pJ8");
  expect(options.playerVars).toMatchObject({ start: 22, end: 31 });
  expect(seeks).toContain(22.5);
  await page.evaluate(() => { window.clip.time = 31; });
  await expect(page.getByRole("status")).toHaveText("Audio finished.");
  await button(page, "Repeat Audio").press("Enter");
  await expect(page.getByRole("status")).toHaveText("Playing audio.");
  await expect.poll(() => page.evaluate(() => window.clip.seeks.at(-1))).toBe(22.5);
});

test("Building Blocks snaps nearby edges and matches an adjacent block's height", async ({ page }) => {
  await open(page, "13", "First block\nSecond block");
  const [first, second] = await page.locator(".draggableBox").all();
  await first.evaluate((block) => Object.assign(block.style, { left: "70px", top: "80px", width: "100px", height: "80px" }));
  await second.evaluate((block) => Object.assign(block.style, { left: "225px", top: "140px", width: "100px", height: "60px" }));
  const before = await second.boundingBox();
  await page.mouse.move(before.x + 50, before.y + 30);
  await page.mouse.down();
  await page.mouse.move(before.x + 2, before.y - 23, { steps: 10 });
  await page.mouse.up();
  const moved = await second.boundingBox();
  const target = await first.boundingBox();
  expect(moved.x).toBeCloseTo(target.x + target.width);
  expect(moved.y).toBeCloseTo(target.y);
  const grip = await second.locator(".resize-bottom").boundingBox();
  await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
  await page.mouse.down();
  await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2 + 14, { steps: 8 });
  await page.mouse.up();
  expect((await second.boundingBox()).height).toBe(target.height);
});

test("Anagram drops just past a row's last tile onto that end", async ({ page }) => {
  await open(page, "17", "Clue\nABCDEFGH");
  const tiles = page.locator(".anagramContainer .tile");
  const before = await tiles.allTextContents();
  const pair = page.locator(".anagramContainer .pair");
  const bounds = await pair.boundingBox();
  const last = await tiles.last().boundingBox();
  await tiles.first().dragTo(pair, {
    targetPosition: { x: last.x + last.width + 20 - bounds.x, y: last.y + last.height / 2 - bounds.y },
  });
  await expect(tiles.last()).toHaveText(before[0]);
});

test("Raffle Balls suppresses rapid duplicate starts and resets the drawing", async ({ page }) => {
  await open(page, "31", "OPTIONS:drop_all=yes,group_size=1\nAvery");
  const start = button(page, "SELECT");
  await expect(start).toBeEnabled();
  await start.evaluate((element) => { element.click(); element.click(); element.click(); });
  await expect(start).toBeDisabled();
  await expect(page.getByText(/1\.\s*Avery/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/2\.\s*Avery/)).toHaveCount(0);
  await button(page, "RESET").click();
  await expect(start).toBeEnabled();
  await expect(page.getByText("Results", { exact: true })).toHaveCount(0);
});

test("Deck of Cards keeps separate keyboard access to its link and reverse", async ({ page }) => {
  await open(page, "20", "A front|The reverse@https://example.com/card");
  const link = page.getByRole("link", { name: "Open card link" });
  await link.focus();
  await expect(link).toBeFocused();
  await expect(link).toHaveAttribute("href", "https://example.com/card");
  await button(page, "Flip").press("Enter");
  await expect(page.getByText("The reverse", { exact: true })).toBeVisible();
});

test("Connect and Word Find can be played using named keyboard controls", async ({ page }) => {
  await open(page, "22", "cat\nfrog\ndog\nlion\n\nchair\ntable\ndesk\n\nrun\njump\ncrawl");
  for (const letter of ["cat", "frog", "dog", "lion"]) await button(page, letter).press("Enter");
  await button(page, "Check").press("Enter");
  await expect(page.locator('[class*="Connect_CorrectGroup__"]')).toContainText("cat");

  await open(page, "21", "Fruit\n\nApple");
  await button(page, "Reveal next letter").press("Enter");
  await expect(page.getByText(/Ap___/)).toBeVisible();
  await button(page, "Guess word").press("Enter");
  await enter(page, "Orange");
  await expect(page.getByText("Try another word.")).toBeVisible();
  await button(page, "Guess word").press("Enter");
  await enter(page, "Apple");
  await expect(page.getByText("Apple", { exact: true })).toBeVisible();
});

test("Time Recorder exports recorded time and quotes category names in CSV", async ({ page }) => {
  await page.clock.install();
  await open(page, "29", "OPTIONS:time=60\nPair work, planning");
  await button(page, "START").press("Enter");
  const category = button(page, "Pair work, planning");
  await category.press("Enter");
  await expect(category).toHaveAttribute("aria-pressed", "true");
  await page.clock.runFor(2_100);
  await button(page, "END").press("Enter");
  const downloadPromise = page.waitForEvent("download");
  await button(page, "Export").press("Enter");
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("category_times.csv");
  const csv = fs.readFileSync(await download.path(), "utf8");
  expect(csv).toContain('"Pair work, planning",2');
});

test("Multi-Choice keeps answers when navigating and continues after a timer pause", async ({ page }) => {
  await page.clock.install();
  await open(page, "10", "OPTIONS:scroll=no,time=12\n\nFirst?\n*A\nB\n\nSecond?\n*C\nD");
  await button(page, "Pause timer").click();
  await button(page, "A").click();
  const submit = page.getByRole("button", { name: /^Submit Answers/ });
  const paused = await submit.textContent();
  await page.clock.runFor(3_000);
  await expect(submit).toHaveText(paused);
  await page.locator(".navigationButtons button").nth(2).click();
  await expect(page.getByText("Second?", { exact: true })).toBeVisible();
  await button(page, "C").click();
  await button(page, "Resume timer").click();
  await page.clock.runFor(2_000);
  await expect(submit).not.toHaveText(paused);
  await submit.click();
  await expect(page.getByText("Score: 2/2", { exact: true })).toBeVisible();
});

test("Random Wheel announces the item at the pointer after spinning", async ({ page }) => {
  await open(page, "12", "OPTIONS:time=0.15\nOnly choice");
  await button(page, "Spin Wheel").click();
  await expect(page.getByRole("status").filter({ hasText: /^Selected:/ })).toHaveText("Selected: Only choice");
});

test("Building Blocks keeps a moved block in place after a viewport change", async ({ page }) => {
  await open(page, "13", "A block");
  const block = page.locator(".draggableBox");
  const before = await block.boundingBox();
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.mouse.down();
  await page.mouse.move(before.x + before.width / 2 - 40, before.y + before.height / 2 - 30, { steps: 12 });
  await page.mouse.up();
  const position = await block.evaluate((element) => [element.style.left, element.style.top]);
  expect(Math.abs((await block.boundingBox()).x - (before.x - 40))).toBeLessThan(1.5);
  await page.setViewportSize({ width: 800, height: 800 });
  await expect.poll(() => block.evaluate((element) => [element.style.left, element.style.top]))
    .toEqual(position);
});

test("Image Pins replaces unavailable media, places a tray label and drags a new pin", async ({ page }) => {
  const file = path.join(__dirname, "..", "src", "examples", "ExampleInteractiveFile.txt");
  const media = readActivityFile(fs.readFileSync(file, "utf8")).media;
  await open(page, "19", "OPTIONS:show=yes,disable_adding=no\nUnplaced label\n" + pictureUrl);
  await expect(page.getByRole("alert")).toContainText("Choose a replacement");
  await page.getByLabel("Choose replacement image").setInputFiles({
    name: "replacement.png", mimeType: "image/png", buffer: Buffer.from(media.split(",")[1], "base64"),
  });
  const picture = page.getByAltText("Locations to label");
  await expect.poll(() => picture.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
  await button(page, "Unplaced label").click();
  await picture.click({ position: { x: 35, y: 60 } });
  await expect(button(page, "Unplaced label")).toHaveCount(0);
  await picture.click({ position: { x: 130, y: 90 } });
  const pin = button(page, "Edit pin 2");
  const base = await pin.boundingBox();
  await page.mouse.move(base.x + base.width / 2, base.y + base.height / 2);
  await page.mouse.down();
  await page.mouse.move(base.x + base.width / 2 + 40, base.y + base.height / 2 + 25, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => (await pin.boundingBox()).x).toBeGreaterThan(base.x + 25);
});

test("Kanban and Freyar support moving items by keyboard and deleting them", async ({ page }) => {
  await open(page, "33", "OPTIONS:add=yes\nFIRST\nSECOND");
  await button(page, "Add").first().click();
  await enter(page, "Plan");
  await page.getByLabel("Move Plan").selectOption({ label: "SECOND" });
  const column = page.locator('[class*="KanbanBoard_kanbanColumn__"]').filter({ hasText: "SECOND" });
  await expect(column.getByText("Plan", { exact: true })).toBeVisible();
  await button(column, "Delete Plan").press("Enter");
  await expect(column.getByText("Plan", { exact: true })).toHaveCount(0);

  await open(page, "34", "One concept");
  await button(page, "Add").first().click();
  await enter(page, "A definition");
  await page.getByLabel("Move A definition").selectOption({ label: "Examples" });
  const box = page.locator('[class*="FreyarDiagram_box__"]').filter({
    has: page.getByRole("heading", { name: "EXAMPLES", exact: true }),
  });
  await expect(box.getByText("A definition", { exact: true })).toBeVisible();
  await button(box, "Delete A definition").press("Enter");
  await expect(box.getByText("A definition", { exact: true })).toHaveCount(0);
});

test("individual words, quiz tiles and left/right choices work from the keyboard", async ({ page }) => {
  await open(page, "1", "OPTIONS:show=first,order=maintain\nA cat is here");
  const word = button(page, "Toggle word 2");
  await expect(word).not.toHaveText("cat");
  await word.press("Enter");
  await expect(word).toHaveText("cat");

  await open(page, "5", "Question one?@One");
  for (const state of ["hidden", "question visible", "answer visible"]) {
    await button(page, "Question 1, " + state).press("Enter");
  }
  await expect(button(page, "Question 1, blue team")).toBeVisible();

  await open(page, "8", "*Apple\n---\nAple");
  const apple = button(page, "Apple");
  await apple.press("Enter");
  await expect(apple).toHaveAttribute("aria-pressed", "true");
  await button(page, "Submit").press("Enter");
  await expect(page.getByText("You scored 1")).toBeVisible();
});

test("Grid Solve gives retry feedback and Order can move a tile with named controls", async ({ page }) => {
  await open(page, "16", "Capital of France\nParis\n\nLargest Planet\nJupiter");
  const clue = button(page, "Capital of France");
  await clue.press("Enter");
  const field = page.getByRole("textbox", { name: "Answer" });
  await field.fill("Rome");
  await field.press("Enter");
  await expect(page.getByText("Try again.", { exact: true })).toBeVisible();
  await clue.press("Enter");
  await field.fill("Paris");
  await field.press("Enter");
  await expect(page.getByText("Paris", { exact: true })).toBeVisible();

  await open(page, "27", "Alphabetical\n\ncat\nfrog\n\napple\norange");
  const moveUp = button(page, "Move cat up");
  if (await moveUp.isDisabled()) await button(page, "Move cat down").press("Enter");
  await moveUp.press("Enter");
  await button(page, "Submit").press("Enter");
  await expect(page.getByText("apple", { exact: true })).toBeVisible();
});

for (const viewport of [{width: 390, height: 760}, {width: 820, height: 900}, {width: 1280, height: 900}]) {
  test(`viewport-sized boards and pin image fit at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const id of ["5", "16", "19", "33", "35"]) {
      await open(page, id, activities.find((entry) => entry.id === id).example);
      const bounds = await area(page).boundingBox();
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height);
      expect(bounds.y + bounds.height).toBeGreaterThan(viewport.height - 90);
      await fitsPlayer(page);
      if (id === "5" || id === "16") {
        const tile = id === "5" ? area(page).locator(".question").last() :
          area(page).locator('[class*="GridSolve_Card__"]').last();
        const last = await tile.boundingBox();
        expect(last.y + last.height).toBeGreaterThan(viewport.height - 80);
      }
      if (id === "19") {
        const image = page.getByRole("img", { name: "Locations to label" });
        await expect.poll(() => image.evaluate((node) => node.complete && node.naturalWidth > 0)).toBe(true);
        await expect(page.getByText(/Africa map by/)).toBeInViewport();
        await expect(image).toBeInViewport({ ratio: 1 });
      }
    }
  });
}

test("Tarsia adjusts edge fonts independently of the squares and can exceed the viewport", async ({ page }) => {
  await page.setViewportSize({width: 1280, height: 850});
  await open(page, "15", activities.find((entry) => entry.id === "15").example);
  const square = page.locator(".tarsiaGameArea .square").first();
  const label = square.locator(".label").first();
  const rotation = square.getByRole("button", { name: "Rotate square" });
  const font = (locator) => locator.evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
  const before = await square.boundingBox();
  const labelFont = await font(label);
  const rotateFont = await font(rotation);
  await button(page, "Increase font size").press("Enter");
  expect(await font(label)).toBeGreaterThan(labelFont);
  expect(await font(rotation)).toBe(rotateFont);
  expect((await square.boundingBox()).width).toBe(before.width);
  for (let i = 0; i < 4; i++) await button(page, "Increase square size").press("Enter");
  expect((await square.boundingBox()).width).toBeGreaterThan(before.width);
  expect(await area(page).evaluate((node) => node.getBoundingClientRect().bottom)).toBeGreaterThan(850);
  await button(page, "Fit squares to screen").press("Enter");
  expect((await square.boundingBox()).width).toBeCloseTo(before.width);
});

test("math keeps the KaTeX layout and makes room between text lines for tall expressions", async ({ page }) => {
  const math = String.raw`Above\n$$x_1^2+\displaystyle\int_0^1 x+\sum_{n=0}^9 n+\begin{pmatrix}1&2\\3&4\end{pmatrix}$$\nBelow`;
  await open(page, "5", "OPTIONS:columns=1\n" + math);
  await button(page, "Question 1, hidden").click();
  const equation = page.locator(".katex-html");
  await expect(equation).toBeVisible();
  await expect(equation.locator(".vlist-t").first()).toHaveCSS("display", "inline-table");
  const positions = await equation.evaluate((html) => {
    const wrapper = html.closest(".katex").parentElement;
    const before = wrapper.previousElementSibling.firstChild;
    const after = wrapper.nextElementSibling.firstChild;
    const range = document.createRange();
    range.setStart(before, 0);
    range.setEnd(before, 5);
    const above = range.getBoundingClientRect().bottom;
    range.setStart(after, 1);
    range.setEnd(after, 6);
    const below = range.getBoundingClientRect().top;
    const struts = [...html.querySelectorAll(".base > .strut")].map((node) => node.getBoundingClientRect());
    return {above, below, top: Math.min(...struts.map((rect) => rect.top)), bottom: Math.max(...struts.map((rect) => rect.bottom))};
  });
  expect(positions.top).toBeGreaterThanOrEqual(positions.above - 1);
  expect(positions.bottom).toBeLessThanOrEqual(positions.below + 1);
});

test("a dense portrait Image Reveal grid fits and the final tile works on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.route(pictureUrl, (route) => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="2400"><rect width="100%" height="100%" fill="teal"/></svg>',
  }));
  await open(page, "2", "OPTIONS:gridsize=12,scale=2\n" + pictureUrl);
  const last = button(page, "Reveal tile 144");
  await expect(last).toBeInViewport();
  await fitsPlayer(page);
  await last.click();
  await expect(button(page, "Revealed tile 144")).toBeDisabled();
});

test("race, score and equation grid controls fit on a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 760 });
  await open(page, "7", "Ella\nJonathan\nMia\nAhmed\nCaitlin");
  const horse = button(page, "Move Ella");
  await horse.press("Enter");
  await expect(horse).toHaveAttribute("style", /left:\s*8%/);
  await fitsPlayer(page);

  await open(page, "14", "Team with a very long name:5\nTeam 2");
  await button(page, "Add star to Team 2").press("Enter");
  await expect(page.locator(".ScoreBar").filter({ hasText: "Team 2" })).toContainText("⭐");
  await fitsPlayer(page);

  const pairs = ["Longest river:Nile", "Capital of France:Paris", "Largest planet:Jupiter",
    "$$9^2$$:81", "First President of USA:George Washington", "Element symbol for gold:Au",
    "Author of 1984:George Orwell", "$$x(x+2)$$:$$x^2+2x$$", "Currency of Japan:Yen",
    "Speed of light:299,792,458 m/s", "Human chromosomes:46", "Smallest prime:2"];
  await open(page, "15", pairs.join("\n"));
  await expect(page.locator(".square .katex").first()).toBeVisible();
  await button(page, "Rotate square").first().press("Enter");
  await fitsPlayer(page);
});

test("Fishbone can pan to the head and keep the toolbar reachable at larger type", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 760 });
  await open(page, "35", "A crowded diagram\nPlanning\nResources\nAlternatives for the next lesson\nDelivery\nAssessment\nReview");
  const scroll = page.getByRole("region", { name: "Fishbone diagram canvas" });
  const toolbar = button(page, "Font ↑");
  await toolbar.press("Enter");
  await toolbar.press("Enter");
  await scroll.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
  await expect(scroll.getByText("A crowded diagram", { exact: true })).toBeInViewport();
  await expect(toolbar).toBeInViewport();
  await expect.poll(() => scroll.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
});

test("Prize Pot accepts separately dragged bags and settles a split bet", async ({ page }) => {
  await page.clock.install();
  await open(page, "25", "First?\n*Correct\nIncorrect\n\nSecond?\n*Yes\nNo");
  const reserve = page.locator('[class*="PrizePot_prizeFund__"]');
  const bags = reserve.getByText("💰", { exact: true });
  await expect(bags).toHaveCount(4);
  for (const answer of ["Correct", "Incorrect"]) {
    await bags.first().dragTo(page.getByText(answer, { exact: true }));
  }
  await expect(bags).toHaveCount(2);
  await button(page, "Submit Final Answer").click();
  await expect(page.getByRole("status")).toHaveText("Partly correct. Won $128 · Lost $32 · New balance $224");
  await expect(button(page, "Submit Final Answer")).toBeDisabled();
  await expect(page.getByText("First?", { exact: true })).toBeVisible();
  await page.clock.runFor(2_100);
  await expect(page.getByText("Second?", { exact: true })).toBeVisible();
  await expect(page.getByText("Current Fund: $224", { exact: true })).toBeVisible();
});

test("Self-Review saves an answer and marking choice, then clears progress", async ({ page }) => {
  await open(page, "28", "Geography\n\nName a capital\n1\nParis\n\nName a river\n1\nNile");
  const answer = page.getByPlaceholder("Type your answer here...");
  await answer.fill("I chose Paris.");
  await button(page, "Review").click();
  await page.getByText("Paris", { exact: true }).click();
  await expect(page.getByText("[1 marks scored]", { exact: true })).toBeVisible();
  const jump = page.getByLabel("Jump to");
  await jump.selectOption("1");
  await jump.selectOption("0");
  await expect(answer).toHaveValue("I chose Paris.");
  await button(page, "Clear All Progress").click();
  await button(page, "Clear progress").click();
  await expect(answer).toHaveValue("");
});
