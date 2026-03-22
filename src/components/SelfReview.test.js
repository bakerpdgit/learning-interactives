import {
  getMarkschemePointValue,
  getQuestionScore,
  parseSelfReviewText,
} from "./SelfReview";

describe("parseSelfReviewText", () => {
  it("parses multiline questions and latex before the marks line", () => {
    const parsed = parseSelfReviewText(`Data Structures

Define an array
3
A *finite* collection of elements
of the same *type*
*sequenced/ordered* by an index

Define a set
2
An *unordered* collection
of *unique* elements

Evaluate
$$2^4$$
1
16`);

    expect(parsed.title).toBe("Data Structures");
    expect(parsed.questions).toHaveLength(3);
    expect(parsed.questions[2]).toMatchObject({
      text: "3. Evaluate\n$$2^4$$",
      marks: 1,
      markscheme: [{ text: "16", selected: false }],
    });
  });

  it("ignores sections without both question text and markscheme points", () => {
    const parsed = parseSelfReviewText(`Topic

Broken question
2

Valid question
1
Point`);

    expect(parsed.questions).toHaveLength(1);
    expect(parsed.questions[0]).toMatchObject({
      text: "1. Valid question",
      marks: 1,
    });
  });

  it("retains bracketed whole-number prefixes in markscheme text", () => {
    const parsed = parseSelfReviewText(`Maths

Find the total
2
[2] Correct answer: 52
Method shown`);

    expect(parsed.questions[0].markscheme).toEqual([
      { text: "[2] Correct answer: 52", selected: false },
      { text: "Method shown", selected: false },
    ]);
  });
});

describe("markscheme scoring", () => {
  it("uses bracketed whole-number prefixes as the point value", () => {
    expect(getMarkschemePointValue({ text: "[2] Correct answer: 52" })).toBe(2);
    expect(getMarkschemePointValue({ text: "Correct working" })).toBe(1);
  });

  it("caps the total score for a question at the marks available", () => {
    expect(
      getQuestionScore({
        marks: 2,
        markscheme: [
          { text: "Method shown", selected: true },
          { text: "[2] Correct answer: 52", selected: true },
        ],
      }),
    ).toBe(2);
  });
});
