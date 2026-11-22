
import fs from "fs";
import path from "path";
import { activities } from "./activities";
import { builders, checkBuilder, parseBuilder } from "./builders";
import { clipPlaybackUrl } from "./audioClips";
import {
  activityFilename, activityUrl, compressText, hostedActivityLinks, makeActivityFile,
  makeDirectLink, readActivityFile, readActivityRequest, SHARE_LIMIT,
} from "./activityFormat";

test.each(activities.map(({ id, name, example }) => [id, name, example]))(
  "%s %s opens its original example in Builder without changing it",
  (id, name, example) => {
    const schema = builders[id];
    expect(schema).toBeDefined();
    const parsed = parseBuilder(schema, example);
    expect(parsed).not.toBeNull();
    expect(schema.write(parsed.value)).toBe(example);
    expect(checkBuilder(schema, parsed.value)).toEqual([]);

    const payload = compressText(example);
    const legacyLink = activityUrl({id, txt: payload}, "https://www.classinteractives.co.uk/");
    const url = new URL(legacyLink);
    expect(readActivityRequest(url.search)).toEqual({id, mode: "public", text: example.trim()});
    const fileLink = activityUrl({id, txt: compressText("localrun")}, legacyLink);
    const file = "Activity Link:\n" + fileLink + "\n\nActivityData:" + payload;
    expect(readActivityFile(file)).toEqual({id, text: example, media: null});
  },
);

test("unmapped options and ambiguous layout stay in Free Entry", () => {
  expect(parseBuilder(builders["1"], "OPTIONS:show=all,custom=yes\nKeep this phrase")).toBeNull();
  expect(parseBuilder(builders["3"], "Prompt\nAnswer\n\nUnpaired prompt")).toBeNull();
  const source = "An equation\n$$A+B=C$$\nAnd a second line";
  const parsed = parseBuilder(builders["3"], source);
  expect(builders["3"].write(parsed.value)).toBe(source);
});

test.each([
  ["6", 'ORDERED-LINE:{"x":"Date","y":"Significance","xRanks":[2,1],"yRanks":[1,2]}\nEarly-Late\nSame\nSame'],
  ["9", 'CATEGORISE:{"add":false,"answers":[1,null,2]}\nFruit\nVegetables\n\nPear\nUnknown\nPea'],
  ["10", "OPTIONS:selectall=1\n\nChoose both\n*A\n*B\nC\n\nChoose either\n*D\n*E"],
  ["32", "[local]\n0\nend\nA *word"],
])("activity %s reopens new marking or clip settings in the Builder", (id, text) => {
  const schema = builders[id];
  const parsed = parseBuilder(schema, text);
  expect(parsed).not.toBeNull();
  expect(checkBuilder(schema, parsed.value)).toEqual([]);
  expect(schema.write(parsed.value)).toBe(text);
});

test("Audio Complete uses the specific YouTube video in a watch link with a playlist", () => {
  expect(clipPlaybackUrl("https://www.youtube.com/watch?v=sqlbmwu4pJ8&list=PL_TEST"))
    .toBe("https://www.youtube.com/watch?v=sqlbmwu4pJ8");
  expect(clipPlaybackUrl("https://www.youtube.com/playlist?list=PL_TEST"))
    .toBe("https://www.youtube.com/playlist?list=PL_TEST");
});

test("reads the tracked legacy file and accepts the original direct-link payload", () => {
  const file = fs.readFileSync(path.join(__dirname, "examples", "ExampleInteractiveFile.txt"), "utf8");
  const activity = readActivityFile(file);
  expect(activity.id).toBe("19");
  expect(activity.text).toContain("[local]");
  expect(activity.media).toMatch(/^data:image\//);

  const url = activityUrl({id: "1", txt: compressText("A phrase with Café and £")}, "https://www.classinteractives.co.uk");
  expect(readActivityRequest(new URL(url).search)).toEqual({id: "1", mode: "public", text: "A phrase with Café and £"});
  expect(readActivityFile(url)).toMatchObject({id: "1", text: "A phrase with Café and £"});
});

test("reopens new text, image, and audio downloads and rejects malformed files", async () => {
  const base = "https://www.classinteractives.co.uk/";
  const text = {id: "1", text: "A phrase", media: null};
  const image = {id: "2", text: "OPTIONS:gridsize=3\n[local]", media: "data:image/png;base64,AAAA"};
  const audio = {id: "32", text: "[local]\n0\n2\nA *word", media: new Blob([new Uint8Array([1,2,3])], {type: "audio/webm;codecs=opus"})};
  for (const example of [text, image, audio]) {
    const file = await makeActivityFile(example, base);
    const read = readActivityFile(file);
    expect(read).toEqual(example);
    if (read.media instanceof Blob) {
      expect(read.media.size).toBe(3);
      expect(read.media.type).toBe("audio/webm;codecs=opus");
    }
  }
  expect(() => readActivityFile("Not an activity")).toThrow();
});

test("keeps nested URLs and paths encoded and applies the encoded sharing threshold", () => {
  const base = "https://www.classinteractives.co.uk/";
  const paths = hostedActivityLinks("owner", "repo", "lesson/updated", "class activities/Math #4%.txt", base);
  expect(paths.map(({url}) => readActivityRequest(new URL(url).search).remote)).toEqual([
    "https://raw.githubusercontent.com/owner/repo/refs/heads/lesson/updated/class%20activities/Math%20%234%25.txt",
    "https://cdn.jsdelivr.net/gh/owner/repo@lesson%2Fupdated/class%20activities/Math%20%234%25.txt",
  ]);
  const candidate = new URL(makeDirectLink("1", "hello", null, base));
  const length = candidate.href.length;
  const makeBase = (extra) => base + "a".repeat(SHARE_LIMIT - length + extra);
  expect(makeDirectLink("1", "hello", null, makeBase(0))).toHaveLength(SHARE_LIMIT);
  expect(makeDirectLink("1", "hello", null, makeBase(1))).toBeNull();
  expect(makeDirectLink("1", "hello", "data:image/png;base64,AAAA", base)).toBeNull();
  expect(activityFilename("lesson 4.TXT")).toBe("lesson 4.txt");
  expect(activityFilename("a/b?")).toBe("a-b-.txt");
  expect(activityFilename("   ")).toBe("");
});
