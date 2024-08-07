import { InlineMath } from "react-katex";

function parseAndRenderMath(text) {
  const prefix = Math.random().toString(36).substring(2, 10); // Generate an 8-character random string

  // Split the text based on $$ delimiters
  const segments = text.split("$$");
  const elements = [];

  segments.forEach((segment, index) => {
    if (index % 2 === 1) {
      // Odd-indexed segments are LaTeX (since they are enclosed between $$ delimiters)
      elements.push(
        <InlineMath key={`MCIM-${prefix}-${index}`} math={segment} />
      );
    } else {
      elements.push(<span key={`MCSP-${prefix}-${index}`}>{segment}</span>);
    }
  });

  return elements;
}

const renderWithNewLines = (text) => {
  return text.replace(/\\n/g, "\n");
};

function MathComponent({ text, renderNewLines = false }) {
  if (renderNewLines) {
    text = renderWithNewLines(text);
  }

  return (
    <div
      style={{
        whiteSpace:
          text.includes("\n") && renderNewLines ? "pre-wrap" : "normal",
        marginTop: text.includes("$$") ? "0.5em" : "0",
      }}
    >
      {parseAndRenderMath(text)}
    </div>
  );
}

export default MathComponent;
