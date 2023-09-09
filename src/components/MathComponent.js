import { InlineMath } from "react-katex";

function parseAndRenderMath(text) {
  // Split the text based on $$ delimiters
  const segments = text.split("$$");
  const elements = [];

  segments.forEach((segment, index) => {
    if (index % 2 === 1) {
      // Odd-indexed segments are LaTeX (since they are enclosed between $$ delimiters)
      elements.push(<InlineMath key={index} math={segment} />);
    } else {
      elements.push(<span key={index}>{segment}</span>);
    }
  });

  return elements;
}

function MathComponent({ text }) {
  return <>{parseAndRenderMath(text)}</>;
}

export default MathComponent;
