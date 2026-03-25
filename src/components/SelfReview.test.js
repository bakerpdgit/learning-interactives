import React from "react";
import { createRoot } from "react-dom/client";
import { act, Simulate } from "react-dom/test-utils";
import SelfReview, {
  getMarkschemePointValue,
  getQuestionScore,
  parseSelfReviewText,
} from "./SelfReview";
import styles from "./SelfReview.module.css";

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

describe("formatted self-review rendering", () => {
  let container;
  let root;

  beforeEach(() => {
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("trims inline code side padding when a [[...]] block starts or ends on its own line", () => {
    act(() => {
      root.render(
        <SelfReview
          text={`Topic

Explain the output
[[line 1
line 2]]
Then reference [[inline example]] in a sentence.
1
Method shown`}
        />,
      );
    });

    const codes = Array.from(container.querySelectorAll("code"));
    const blockCode = codes.find((node) => node.textContent?.includes("line 1"));
    const inlineCode = codes.find((node) => node.textContent === "inline example");

    expect(blockCode).toBeTruthy();
    expect(blockCode.className).toContain(styles.inlineCodeTrimStart);
    expect(blockCode.className).toContain(styles.inlineCodeTrimEnd);

    expect(inlineCode).toBeTruthy();
    expect(inlineCode.className).toContain(styles.inlineCode);
    expect(inlineCode.className).not.toContain(styles.inlineCodeTrimStart);
    expect(inlineCode.className).not.toContain(styles.inlineCodeTrimEnd);
  });

  it("renders highlighted text, markdown links, and inline code in question and markscheme text", () => {
    act(() => {
      root.render(
        <SelfReview
          text={`Topic

Define a *customer record* in [[x + y == 7]]. [See here](https://example.com)
1
Includes a *customer record* example with [[x + y == 7]]
Supports [reference link](https://example.com/markscheme)`}
        />,
      );
    });

    const findHighlight = (scope) =>
      Array.from(scope.querySelectorAll("span")).find(
        (node) =>
          node.textContent?.includes("customer record") &&
          node.innerHTML.includes("&nbsp;"),
      );

    const questionHighlight = findHighlight(container);
    expect(questionHighlight).toBeTruthy();
    expect(questionHighlight.tagName).toBe("SPAN");
    expect(questionHighlight.innerHTML).toContain("&nbsp;");

    const questionCode = Array.from(container.querySelectorAll("code")).find(
      (node) => node.textContent === "x + y == 7",
    );
    expect(questionCode).toBeTruthy();

    const questionLink = Array.from(container.querySelectorAll("a")).find(
      (node) => node.textContent === "See here",
    );
    expect(questionLink).toBeTruthy();
    expect(questionLink.getAttribute("href")).toBe("https://example.com");
    expect(questionLink.getAttribute("target")).toBe("_blank");
    expect(questionLink.getAttribute("rel")).toBe("noreferrer");

    const reviewButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Review",
    );

    act(() => {
      Simulate.click(reviewButton);
    });

    const markschemeText = Array.from(
      container.querySelectorAll('[class*="markschemePointContent"]'),
    ).find((node) => node.textContent.includes("customer record"));
    const markschemeHighlight = findHighlight(markschemeText);

    expect(markschemeHighlight).toBeTruthy();
    expect(markschemeHighlight.tagName).toBe("SPAN");
    expect(markschemeHighlight.innerHTML).toContain("&nbsp;");
    expect(markschemeHighlight.previousSibling?.textContent).toBe("Includes a ");
    expect(markschemeHighlight.nextSibling?.textContent).toBe(" example with ");

    const markschemeCode = Array.from(markschemeText.querySelectorAll("code")).find(
      (node) => node.textContent === "x + y == 7",
    );
    expect(markschemeCode).toBeTruthy();

    const markschemeLink = Array.from(container.querySelectorAll("a")).find(
      (node) => node.textContent === "reference link",
    );
    expect(markschemeLink).toBeTruthy();
    expect(markschemeLink.getAttribute("href")).toBe(
      "https://example.com/markscheme",
    );
    expect(markschemeLink.getAttribute("target")).toBe("_blank");
  });

  it("shows retry in review mode and clears answer + selected markscheme points", () => {
    act(() => {
      root.render(
        <SelfReview
          text={`Topic

Question one
2
Point A
Point B`}
        />,
      );
    });

    const textarea = container.querySelector("textarea");
    act(() => {
      Simulate.change(textarea, { target: { value: "My answer" } });
    });

    const reviewButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Review",
    );

    act(() => {
      Simulate.click(reviewButton);
    });

    const firstPoint = container.querySelector('[class*="markschemePoint"]');
    act(() => {
      Simulate.click(firstPoint);
    });

    const retryButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Retry",
    );

    act(() => {
      Simulate.click(retryButton);
    });

    expect(container.querySelector("textarea").value).toBe("");
    expect(
      container.querySelectorAll('[class*="markschemePoint"]').length,
    ).toBe(0);
  });

  it("restores persisted answers and selected markscheme points from localStorage", () => {
    const text = `Topic

Question one
2
Point A
Point B`;

    act(() => {
      root.render(<SelfReview text={text} />);
    });

    act(() => {
      Simulate.change(container.querySelector("textarea"), {
        target: { value: "Stored answer" },
      });
    });

    const reviewButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Review",
    );

    act(() => {
      Simulate.click(reviewButton);
    });

    const firstPoint = container.querySelector('[class*="markschemePoint"]');
    act(() => {
      Simulate.click(firstPoint);
    });

    act(() => {
      root.unmount();
      root = createRoot(container);
      root.render(<SelfReview text={text} />);
    });

    expect(container.querySelector("textarea").value).toBe("Stored answer");
    const selectedPoint = container.querySelector(`.${styles.selected}`);
    expect(selectedPoint).toBeTruthy();
  });

  it("shows a go back button on summary screen and returns to question view", () => {
    const text = `Topic

Question one
1
Point A`;

    act(() => {
      root.render(<SelfReview text={text} />);
    });

    const reviewButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Review",
    );
    act(() => {
      Simulate.click(reviewButton);
    });

    const summaryButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Review Summary",
    );
    act(() => {
      Simulate.click(summaryButton);
    });

    const goBackButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Go Back",
    );
    expect(goBackButton).toBeTruthy();

    act(() => {
      Simulate.click(goBackButton);
    });

    expect(container.querySelector("textarea")).toBeTruthy();
  });

  it("does not restore expired localStorage state", () => {
    const text = `Topic

Question one
1
Point A`;

    window.localStorage.setItem(
      "self-review-state:Topic",
      JSON.stringify({
        questions: [
          {
            text: "1. Question one",
            marks: 1,
            markscheme: [{ text: "Point A", selected: true }],
            answer: "Old answer",
            reviewed: true,
          },
        ],
        currentQuestionIndex: 0,
        isReviewMode: true,
        isReviewStage: false,
        expiresAt: Date.now() - 1000,
      }),
    );

    act(() => {
      root.render(<SelfReview text={text} />);
    });

    expect(container.querySelector("textarea").value).toBe("");
    expect(window.localStorage.getItem("self-review-state:Topic")).toContain(
      "\"answer\":\"\"",
    );
  });
});
