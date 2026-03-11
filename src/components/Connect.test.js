import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import OnlyConnect from "./Connect";
import styles from "./Connect.module.css";

const CONNECT_TEXT = `Beta
Alpha
Delta
Gamma

Kiwi
Apple
Pear
Mango`;

const findElementByText = (container, text, selector = "div,button") =>
  Array.from(container.querySelectorAll(selector)).find(
    (element) => element.textContent === text
  );

const clickElement = (element) => {
  act(() => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
};

const getChildTexts = (element) =>
  Array.from(element.children).map((child) => child.textContent);

describe("OnlyConnect", () => {
  let container;
  let root;

  beforeEach(() => {
    jest.useFakeTimers();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
      root.unmount();
    });
    jest.useRealTimers();
    container.remove();
  });

  it("keeps incorrect selections until deselect is clicked", () => {
    act(() => {
      root.render(<OnlyConnect text={CONNECT_TEXT} />);
    });

    const alphaTile = findElementByText(container, "Alpha");
    const betaTile = findElementByText(container, "Beta");

    clickElement(alphaTile);
    clickElement(betaTile);

    expect(alphaTile.classList.contains(styles.selected)).toBe(true);
    expect(betaTile.classList.contains(styles.selected)).toBe(true);

    clickElement(findElementByText(container, "Check", "button"));

    expect(alphaTile.classList.contains(styles.selected)).toBe(true);
    expect(betaTile.classList.contains(styles.selected)).toBe(true);

    clickElement(findElementByText(container, "Deselect", "button"));

    expect(alphaTile.classList.contains(styles.selected)).toBe(false);
    expect(betaTile.classList.contains(styles.selected)).toBe(false);
  });

  it("reorders unmatched tiles and matched groups alphabetically", () => {
    act(() => {
      root.render(<OnlyConnect text={CONNECT_TEXT} />);
    });

    ["Kiwi", "Apple", "Pear", "Mango"].forEach((word) => {
      clickElement(findElementByText(container, word));
    });

    clickElement(findElementByText(container, "Check", "button"));
    clickElement(findElementByText(container, "Reorder", "button"));

    const gameAreaGrid = container.querySelector(`.${styles.GameAreaGrid}`);
    const correctGroup = container.querySelector(`.${styles.CorrectGroup}`);

    expect(getChildTexts(gameAreaGrid)).toEqual([
      "Alpha",
      "Beta",
      "Delta",
      "Gamma",
    ]);
    expect(getChildTexts(correctGroup)).toEqual([
      "Apple",
      "Kiwi",
      "Mango",
      "Pear",
    ]);
  });
});
