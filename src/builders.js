
import { LOCAL_MARKER } from "./activityFormat";
import { FULL_CLIP } from "./audioClips";
import { categoriseHeader, multiSelectQuestions, orderedLineHeader, readCategorise, readOrderedLine, validRanks, writeMarkingHeader } from "./activityMarking";

const unsupported = Symbol("unsupported text");
const line = "\n";
const block = "\n\n";
let nextRowId = 0;
const row = (value) => ({ rowId: ++nextRowId, value });

export const isImageSource = (value) => value === LOCAL_MARKER || /^[a-z][a-z0-9+.-]*:/i.test(value);

function field(label, type = "text", options = {}) {
  return {
    kind: "field", label, type, ...options,
    read: (text) => text,
    write: (value) => value,
    blank: () => options.initial ?? "",
    validate(value) {
      if (!value.trim()) return options.optional ? [] : ["Enter " + label.toLowerCase() + "."];
      if (type === "number" && value !== options.special && (!/^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value) ||
        (options.integer && !/^-?\d+$/.test(value)) ||
        Number(value) < (options.min ?? -Infinity) || Number(value) > (options.max ?? Infinity))) {
        const range = options.max != null ? " between " + options.min + " and " + options.max :
          options.min != null ? " of at least " + options.min : "";
        return [label + " needs a " + (options.integer ? "whole number" : "number") + range + "."];
      }
      if (type === "image" && !isImageSource(value)) return ["Enter an image URL or upload an image."];
      if (type === "audioSource" && value.trim() !== LOCAL_MARKER && !/^https?:\/\//i.test(value.trim())) {
        return ["Enter a video URL or select the local recording."];
      }
      return [];
    },
  };
}

const math = (label, options) => field(label, "math", options);
const number = (label, min, options) => field(label, "number", { min, ...options });
const count = (label, min = 1, options) => number(label, min, { integer: true, ...options });

function parts(fields, split, join, check) {
  return {
    kind: "parts", fields,
    read(text) {
      const pieces = split(text);
      if (pieces.length !== fields.length) throw unsupported;
      return fields.map((field, index) => field.read(pieces[index]));
    },
    write: (values) => join(values.map((value, index) => fields[index].write(value))),
    blank: () => fields.map((field) => field.blank()),
    validate: (values) => [
      ...fields.flatMap((field, index) => field.validate(values[index])),
      ...(check ? check(values) : []),
    ],
  };
}

function tuple(separator, ...fields) {
  return parts(fields, (text) => text.split(separator), (pieces) => pieces.join(separator));
}

function head(separator, first, body, {optionalBody = false, optionalHead = false, prefix = ""} = {}) {
  return parts([first, body], (text) => {
    if (!text.startsWith(prefix)) throw unsupported;
    const index = text.indexOf(separator, prefix.length);
    if (index >= 0) return [text.slice(prefix.length, index), text.slice(index + separator.length)];
    if (optionalHead) return ["", text];
    if (optionalBody) return [text.slice(prefix.length), ""];
    throw unsupported;
  }, ([a, b]) => {
    if (optionalHead && !a) return b;
    if (optionalBody && !b) return prefix + a;
    return prefix + a + separator + b;
  });
}

function rows(label, item, {separator = line, min = 1, max = Infinity, allowTrailing = false} = {}) {
  return {
    kind: "rows", label, item, max,
    read: (text) => text ? text.split(separator).map((value) => row(item.read(value))) : [],
    write: (values) => values.map(({value}) => item.write(value)).join(separator),
    blank: () => [],
    add: () => row(item.blank()),
    validate: (values) => [
      ...(values.length < min || values.length > max ? [
        "Provide " + (min === max ? "exactly " + min :
          max < Infinity ? "between " + min + " and " + max : "at least " + min) +
          " " + label.toLowerCase() + (min === 1 && max === Infinity ? "." : " entries."),
      ] : []),
      ...values.flatMap(({value}, index) => allowTrailing && !value.trim() && index === values.length - 1 ? [] :
      item.validate(value).map((error) => label + " " + (index + 1) + " — " + error)),
    ],
  };
}

function marked(input, label) {
  return {
    kind: "marked", input, label,
    read: (text) => ({ enabled: text.startsWith("*"), text: input.read(text.replace(/^\*/, "")) }),
    write: (value) => (value.enabled ? "*" : "") + input.write(value.text),
    blank: () => ({ enabled: false, text: input.blank() }),
    validate: (value) => input.validate(value.text),
  };
}

const select = (key, label, values, initial) => ({ key, label, values, initial });
const toggle = (key, label, initial = "no") => ({ key, label, initial, toggle: true });

function options(settings, body, separator = line, requireHeader = false) {
  return {
    kind: "options", settings, body,
    read(text) {
      if (!text.startsWith("OPTIONS:")) {
        if (requireHeader) throw unsupported;
        return { settings: {}, body: body.read(text) };
      }
      const index = text.indexOf(separator);
      if (index < 0) throw unsupported;
      const values = {};
      for (const setting of text.slice(8, index).split(",")) {
        const [key, value, extra] = setting.split("=");
        const spec = settings.find((setting) => setting.key === key);
        if (!spec || !value || extra != null || (spec.values && !(value in spec.values)) ||
          (spec.toggle && value !== "yes" && value !== "no")) throw unsupported;
        values[key] = value;
      }
      return { settings: values, body: body.read(text.slice(index + separator.length)) };
    },
    write({settings, body: value}) {
      const entries = Object.entries(settings).filter(([, value]) => value !== "");
      const prefix = entries.length ? "OPTIONS:" + entries.map(([key, value]) => key + "=" + value).join(",") + separator : "";
      return prefix + body.write(value);
    },
    blank: () => ({ settings: {}, body: body.blank() }),
    validate: (value) => [
      ...settings.flatMap((spec) => spec.input ? spec.input.validate(value.settings[spec.key] || spec.initial || "") : []),
      ...body.validate(value.body),
    ],
  };
}

function numericOption(key, label, initial, min, opts = {}) {
  return {
    key, label, initial,
    input: (opts.decimal ? number : count)(label, min, { optional: true, ...opts }),
  };
}

const words = (label = "Word", settings) => rows(label, field(label), settings);
const promptPairs = (prompt, answer) => rows("Pair", head(line, prompt, answer), { separator: block });
const optionalNumberList = (label, countLabel, separator = ":", min = 1) =>
  rows(label, head(separator, field(label), count(countLabel, min, { optional: true }), { optionalBody: true }));

const question = (exact, requireAnswer, fieldType = math) => parts([
  fieldType("Question"),
  rows("Answer", marked(fieldType("Answer"), "Correct answer"), exact ? { min: exact, max: exact } : { min: 2 }),
], (text) => {
  const index = text.indexOf(line);
  return index === -1 ? [text, ""] : [text.slice(0, index), text.slice(index + 1)];
}, ([question, answers]) => question + line + answers,
requireAnswer ? ([, answers]) => answers.filter(({ value }) => value.enabled).length === 1 ? [] : ["Mark one correct answer."] : undefined);

const endpoints = tuple("-", field("Start label"), field("End label"));
const axisLabels = tuple(line,
  field("X-axis label", "text", { optional: true }),
  field("Y-axis label", "text", { optional: true }),
);
const orderedItems = words("Item");
const orderedLine = {
  kind: "orderedLine", endpoints, axisLabels, items: orderedItems,
  read(text) {
    const [settings, body] = readOrderedLine(text);
    const [ends, ...items] = body.split(line);
    const labels = [settings.x ?? "", settings.y ?? ""];
    const ranks = [settings.xRanks ?? [], settings.yRanks ?? []];
    if (ranks.some((axis) => axis.length && !validRanks(axis, items.length)) || (ranks[1].length && !labels[1])) throw unsupported;
    return { ends: endpoints.read(ends), labels, items: orderedItems.read(items.join(line)), ranks };
  },
  write({ends, labels: [x, y], items, ranks: [xRanks, yRanks]}) {
    const settings = {};
    if (x) settings.x = x;
    if (y) settings.y = y;
    if (xRanks.length) settings.xRanks = xRanks;
    if (y && yRanks.length) settings.yRanks = yRanks;
    return writeMarkingHeader(orderedLineHeader, settings, endpoints.write(ends) + line + orderedItems.write(items));
  },
  validate: ({ends, labels, items}) => [...endpoints.validate(ends), ...axisLabels.validate(labels), ...orderedItems.validate(items)],
};

const categoryNames = words("Category");
const termField = math("Term");
const categoryTerms = rows("Term", {
  ...termField,
  read: (text) => ({ text, answer: "" }),
  write: (value) => value.text,
  blank: () => ({ text: "", answer: "" }),
  validate: ({ text }) => termField.validate(text),
});
const categorise = {
  kind: "categorise", categories: categoryNames, terms: categoryTerms,
  read(text) {
    const [settings, body] = readCategorise(text);
    const index = body.indexOf(block);
    if (index === -1) throw unsupported;
    const categories = categoryNames.read(body.slice(0, index));
    const terms = categoryTerms.read(body.slice(index + block.length));
    if (settings.answers && (settings.answers.length !== terms.length ||
      settings.answers.some((answer) => answer !== null && (answer < 1 || answer > categories.length)))) throw unsupported;
    return {
      categories,
      terms: terms.map((term, i) => ({...term, value: {...term.value, answer: String(settings.answers?.[i] ?? "")}})),
      add: settings.add !== false,
    };
  },
  write({categories, terms, add}) {
    const settings = {};
    if (!add) settings.add = false;
    if (terms.some(({value}) => value.answer)) settings.answers = terms.map(({value}) => Number(value.answer) || null);
    return writeMarkingHeader(categoriseHeader, settings, categoryNames.write(categories) + block + categoryTerms.write(terms));
  },
  validate: ({categories, terms}) => [...categoryNames.validate(categories), ...categoryTerms.validate(terms)],
};

const choiceQuestion = question();
const multiChoice = (settings) => {
  const schema = options([...settings, { key: "selectall" }], rows("Question", {
    ...choiceQuestion,
    kind: "choiceQuestion",
    blank: () => [...choiceQuestion.blank(), false],
    read: (text) => [...choiceQuestion.read(text), false],
    write: ([prompt, answers]) => choiceQuestion.write([prompt, answers]),
  }, { separator: block }), block);
  return {
    ...schema,
    settings,
    read(text) {
      const {settings: values, body} = schema.read(text);
      const {selectall, ...visible} = values;
      const all = multiSelectQuestions(selectall);
      return {settings: visible, body: body.map((entry, index) => ({
        ...entry, value: [entry.value[0], entry.value[1], all.has(index + 1)],
      }))};
    },
    write({settings: values, body}) {
      const selectall = body.flatMap(({value}, index) => value[2] ? [index + 1] : []).join(";");
      return schema.write({settings: {...values, selectall}, body});
    },
  };
};

const image = field("Image", "image");
const imagePin = parts([
  field("Pin label"),
  number("Horizontal position (%)", 0, { max: 100, optional: true }),
  number("Vertical position (%)", 0, { max: 100, optional: true }),
], (text) => {
  const match = /^(.*)\((\d+(?:\.\d+)?),(\d+(?:\.\d+)?)\)$/.exec(text);
  return match ? match.slice(1) : [text, "", ""];
}, ([label, x, y]) => label + (x || y ? "(" + x + "," + y + ")" : ""),
([, x, y]) => Boolean(x) === Boolean(y) ? [] : ["Enter both coordinates for a hidden pin."]);

const imagePins = parts([rows("Pin", imagePin, { min: 0 }), image],
  (text) => {
    const index = text.lastIndexOf(line);
    return index < 0 ? ["", text] : [text.slice(0, index), text.slice(index + 1)];
  }, ([pins, url]) => pins ? pins + line + url : url);

const card = parts([field("Front"), field("Back", "text", {optional: true}), field("Link", "text", {optional: true})],
  (text) => {
    const [faces, url = ""] = text.split("@");
    const [front, back = ""] = faces.split("|");
    return [front, back, url];
  }, ([front, back, url]) => front + (back ? "|" + back : "") + (url ? "@" + url : ""));

const shapeType = {
  ...field("Shape type", "choice", { values: { polygon: "Polygon or line", circle: "Circle" }, initial: "polygon" }),
};
const vertex = tuple(",", number("X", 0, { max: 1000 }), number("Y", 0, { max: 1000 }));
const shape = parts([shapeType, rows("Point", vertex, { separator: ";", min: 2 })],
  (text) => {
    const isCircle = text.startsWith("[");
    const points = text.match(isCircle ? /\[([^\]]+)\]/g : /\(([^)]+)\)/g);
    if (!points) throw unsupported;
    return [isCircle ? "circle" : "polygon", points.map((point) => point.slice(1, -1)).join(";")];
  }, ([type, points]) => points ? points.split(";").map((point) =>
    type === "circle" ? "[" + point + "]" : "(" + point + ")").join(",") : "",
  ([type, points]) => type === "circle" && points.length !== 2 ? ["A circle needs exactly two points."] : []);

const reviewQuestion = parts([
  math("Question", { multiline: true }),
  count("Marks available", 0),
  rows("Markscheme point", math("Markscheme point")),
], (text) => {
  const lines = text.split(line);
  const index = lines.findIndex((value) => /^\d+$/.test(value.trim()));
  if (index < 0) throw unsupported;
  return [lines.slice(0, index).join(line), lines[index], lines.slice(index + 1).join(line)];
}, (pieces) => pieces.join(line));

const audioClipParts = parts([
  field("Audio source", "audioSource"),
  number("Start time (seconds)", 0, {initial: "0"}),
  number("End time (seconds)", 0, {initial: FULL_CLIP, special: FULL_CLIP}),
  field("Sentence", "gaps"),
], (text) => text.split(line), (pieces) => pieces.join(line),
([, start, end, sentence]) => [
  ...(start && end && Number(end) <= Number(start) ? ["End time must be after the start time."] : []),
  ...(/\*\S+/.test(sentence) ? [] : ["Mark at least one gap word."]),
]);
const audioClip = {...audioClipParts, kind: "audioClip"};

export const builders = {
  "1": options([
    select("show", "Show each word", {first: "First letter", all: "Whole word", none: "Hidden"}, "first"),
    select("order", "Phrase order", {maintain: "As entered", random: "Random"}, "maintain"),
  ], words("Phrase")),
  "2": options([numericOption("gridsize", "Grid size", "5", 1),
    numericOption("scale", "Image scale", "1", 0.01, {decimal: true})], image),
  "3": promptPairs(math("Term"), math("Definition", {multiline: true})),
  "4": field("Passage", "gaps", { multiline: true }),
  "5": options([numericOption("columns", "Columns", "4", 1)],
    rows("Question", head("@", marked(math("Question"), "Align top left"), math("Answer", {optional: true}), {optionalBody: true}))),
  "6": orderedLine,
  "7": words("Name", {allowTrailing: true}),
  "8": rows("Pair", head("\n---\n", marked(math("Left item", {multiline: true}), "Correct answer"),
    marked(math("Right item", {multiline: true}), "Correct answer")), { separator: block }),
  "9": categorise,
  "10": multiChoice([
    toggle("scroll", "Show all questions together", "yes"),
    toggle("immediate", "Mark answers immediately"),
    numericOption("time", "Time limit (seconds)", "", 1, {special: "unlimited"}),
  ]),
  "11": rows("Timer", tuple(":", field("Label"), count("Duration (seconds)"))),
  "12": options([numericOption("time", "Spin time (seconds)", "12", 1)], optionalNumberList("Wheel entry", "Copies")),
  "13": rows("Block", math("Block label")),
  "14": optionalNumberList("Score bar", "Starting score", ":", -Infinity),
  "15": rows("Pair", tuple(":", math("Question"), math("Answer"))),
  "16": promptPairs(math("Question"), field("Answer")),
  "17": options([select("mode", "Shuffle", {letter: "Letters", word: "Words"}, "letter")],
    promptPairs(field("Clue"), field("Word or phrase")), block),
  "18": rows("Line", field("Text", "gaps")),
  "19": options([toggle("show", "Show hidden labels as clues"), toggle("disable_adding", "Prevent new pins")], imagePins),
  "20": rows("Card", card),
  "21": head(block, field("Topic", "text", {optional: true}), words(), {optionalHead: true}),
  "22": rows("Group", words(), {separator: block}),
  "23": options([numericOption("size", "Grid size", "10", 5, {max: 20}), toggle("show", "Show the word list", "yes"),
    toggle("simple", "Use simpler directions"), toggle("reveal", "Allow reveals")],
    head(line, field("Topic"), words()), line, true),
  "24": options([toggle("editing", "Allow tile editing")],
    head(line, field("Topic"), rows("Tile", field("Tile label"), {min: 9, max: 9}))),
  "25": rows("Question", question(4, true, field), { separator: block }),
  "26": options([toggle("angles", "Show angles")], rows("Shape", shape, {min: 0})),
  "27": head(block, field("Title"), rows("Group", words("Item"), {separator: block})),
  "28": head(block, field("Title", "text", {multiline: true}), rows("Question", reviewQuestion, {separator: block})),
  "29": options([numericOption("time", "Countdown (seconds)", "", 1)], words("Category")),
  "30": head(block, field("Topic", "text", {optional: true}), words(), {optionalHead: true}),
  "31": options([toggle("drop_all", "Drop all balls"), numericOption("group_size", "Group size", "", 1)],
    optionalNumberList("Name", "Number of balls", ",")),
  "32": rows("Clip", audioClip, { separator: block }),
  "33": options([toggle("add", "Allow new columns")], rows("Column", field("Column title"))),
  "34": field("Title"),
  "35": head(line, field("Title"), rows("Branch", field("Branch title"), {min: 0}), {optionalBody: true}),
  "36": head(line, count("Time limit (seconds)"),
    rows("Clue", head(":", field("Clue"), field("Answer")), {min: 20, max: 20}), {prefix: "TIME:"}),
};

export function getBuilder(id) {
  return Object.hasOwn(builders, id) ? builders[id] : null;
}

export function parseBuilder(schema, text) {
  if (!schema) return null;
  try {
    const value = schema.read(text);
    return schema.write(value) === text ? { value } : null;
  } catch (error) {
    if (error !== unsupported) throw error;
    return null;
  }
}

export function checkBuilder(schema, value) {
  const errors = schema.validate(value);
  if (errors.length) return errors;
  const serialized = schema.write(value);
  const roundTrip = parseBuilder(schema, serialized);
  const comparable = (data) => JSON.stringify(data, (key, item) => {
    if (key === "rowId") return undefined;
    if (key === "settings") return Object.fromEntries(Object.entries(item).filter(([, setting]) => setting !== ""));
    return item;
  });
  if (!roundTrip || comparable(value) !== comparable(roundTrip.value)) {
    return ["A field contains a separator used by this activity. Check the field or use Free Entry."];
  }
  return [];
}
