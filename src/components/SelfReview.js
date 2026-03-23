import React, { useState, useEffect } from "react";
import { InlineMath } from "react-katex";
import styles from "./SelfReview.module.css";
import MathComponent from "./MathComponent";

const tokenPattern = /(\*[^*]+\*|\[\[[\s\S]+?\]\]|\[[^\]]+\]\(https?:[^)]+\))/g;

const renderInlineMathText = (text, keyPrefix) => {
  const segments = text.split("$$");

  return segments.map((segment, index) =>
    index % 2 === 1 ? (
      <InlineMath key={`${keyPrefix}-math-${index}`} math={segment} />
    ) : (
      <React.Fragment key={`${keyPrefix}-text-${index}`}>{segment}</React.Fragment>
    ),
  );
};

const renderTextToken = (text, keyPrefix, options = {}) => {
  const { trimCodePaddingStart = false, trimCodePaddingEnd = false } = options;
  const linkMatch = text.match(/^\[([^\]]+)\]\((https?:[^)]+)\)$/);

  if (linkMatch) {
    const [, label, href] = linkMatch;
    return (
      <a
        key={`${keyPrefix}-link`}
        className={styles.link}
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        {renderInlineMathText(label, `${keyPrefix}-link-label`)}
      </a>
    );
  }

  const isHighlighted = text.startsWith("*") && text.endsWith("*");
  if (isHighlighted) {
    return (
      <span key={`${keyPrefix}-highlight`} className={styles.highlight}>
        &nbsp;
        {renderInlineMathText(text.slice(1, -1), `${keyPrefix}-highlight`)}
        &nbsp;
      </span>
    );
  }

  const isCode = text.startsWith("[[") && text.endsWith("]]");
  if (isCode) {
    const codeClassName = [
      styles.inlineCode,
      trimCodePaddingStart ? styles.inlineCodeTrimStart : "",
      trimCodePaddingEnd ? styles.inlineCodeTrimEnd : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <code key={`${keyPrefix}-code`} className={codeClassName}>
        {renderInlineMathText(text.slice(2, -2), `${keyPrefix}-code`)}
      </code>
    );
  }

  return renderInlineMathText(text, keyPrefix);
};

const renderFormattedText = (text) => {
  const segments = text.split(tokenPattern).filter(Boolean);

  return segments.map((segment, index) => {
    const previousSegment = segments[index - 1] || "";
    const nextSegment = segments[index + 1] || "";
    const isCode = segment.startsWith("[[") && segment.endsWith("]]");

    return renderTextToken(segment, `segment-${index}`, {
      trimCodePaddingStart:
        isCode && (index === 0 || previousSegment.endsWith("\n")),
      trimCodePaddingEnd:
        isCode && (index === segments.length - 1 || nextSegment.startsWith("\n")),
    });
  });
};

const FormattedText = ({ text, className }) => (
  <div className={className}>{renderFormattedText(text)}</div>
);

const renderMarkschemePoint = (text) => (
  <FormattedText
    className={styles.formattedText}
    text={text}
  />
);

const markschemePointPattern = /^\[(\d+)\]\s*/;

const getMarkschemePointValue = (point) => {
  const match = point.text.match(markschemePointPattern);
  return match ? parseInt(match[1], 10) : 1;
};

const getQuestionScore = (question) =>
  Math.min(
    question.markscheme.reduce(
      (total, point) =>
        total + (point.selected ? getMarkschemePointValue(point) : 0),
      0,
    ),
    question.marks,
  );

const QuestionText = ({ text, className }) => (
  <FormattedText className={className} text={text} />
);

const ReviewDisplay = ({ questions }) => {
  const totalScore = questions.reduce(
    (acc, question) => acc + getQuestionScore(question),
    0,
  );
  const maxScore = questions.reduce((acc, question) => acc + question.marks, 0);

  return (
    <div className={styles.reviewDisplay}>
      <table className={styles.reviewTable}>
        <tbody>
          {questions.map((question, index) => (
            <tr key={index}>
              <td className={styles.questionCell}>
                <QuestionText
                  className={styles.reviewQuestionText}
                  text={question.text}
                />
                <div className={styles.reviewMarksAvailable}>
                  [{question.marks}]
                </div>
                <div className={styles.userAnswer}>
                  {question.answer ? (
                    <MathComponent text={question.answer} renderNewLines />
                  ) : (
                    <span className={styles.blankAnswer}>—</span>
                  )}
                </div>
              </td>
              <td className={styles.markschemeCell}>
                {question.markscheme.map((point, pointIndex) => (
                  <div
                    key={pointIndex}
                    className={`${styles.reviewMarkschemePoint} ${
                      point.selected ? styles.selected : ""
                    }`}
                  >
                    <span
                      className={styles.selectionIndicator}
                      aria-hidden="true"
                    >
                      {point.selected ? "✓" : "○"}
                    </span>
                    <div className={styles.markschemePointContent}>
                      {renderMarkschemePoint(point.text)}
                    </div>
                  </div>
                ))}

                <div className={styles.marksScored}>
                  [{getQuestionScore(question)} marks scored]
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.overallScore}>
        Overall score: {totalScore} out of {maxScore}
      </div>
    </div>
  );
};

const QuestionDisplay = ({
  question,
  mode,
  onAnswerChange,
  onSelectMarkschemePoint,
}) => {
  const marksScored = getQuestionScore(question);

  return (
    <div className={styles.questionContainer}>
      <QuestionText className={styles.question} text={question.text} />
      <div className={styles.marksAvailable}>[{question.marks}]</div>
      <textarea
        className={styles.answerInput}
        value={question.answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Type your answer here..."
        readOnly={mode !== "question"}
      />
      {mode === "review" && (
        <>
          <div className={styles.markschemeContainer}>
            Select the points you included in your answer:
            {question.markscheme.map((point, index) => (
              <div
                key={index}
                onClick={() => onSelectMarkschemePoint(index)}
                className={`${styles.markschemePoint} ${
                  point.selected ? styles.selected : ""
                }`}
              >
                <span className={styles.selectionIndicator} aria-hidden="true">
                  {point.selected ? "✓" : "○"}
                </span>
                <div className={styles.markschemePointContent}>
                  {renderMarkschemePoint(point.text)}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.marksScored}>[{marksScored} marks scored]</div>
        </>
      )}
    </div>
  );
};

const QuestionNavigator = ({
  questions,
  currentQuestionIndex,
  isReviewMode,
  onSelectQuestion,
  onEndReview,
}) => (
  <aside className={styles.navigatorPanel}>
    <div className={styles.navigatorHeader}>Question navigator</div>
    <div className={styles.navigatorMode}>
      {isReviewMode ? "Review mode" : "Answer mode"}
    </div>
    <div className={styles.navigatorList}>
      {questions.map((question, index) => {
        const isActive = index === currentQuestionIndex;
        const isAnswered = question.answer.trim() !== "";
        const hasBeenReviewed = question.reviewed;

        return (
          <button
            key={`${question.text}-${index}`}
            type="button"
            onClick={() => onSelectQuestion(index)}
            className={`${styles.navigatorItem} ${
              isActive ? styles.navigatorItemActive : ""
            } ${isAnswered ? styles.navigatorItemAnswered : ""} ${
              hasBeenReviewed ? styles.navigatorItemReviewed : ""
            }`}
          >
            <span className={styles.navigatorItemLabel}>Q{index + 1}</span>
            <span className={styles.navigatorItemStatus}>
              {hasBeenReviewed ? "Reviewed" : isAnswered ? "Answered" : "Blank"}
            </span>
          </button>
        );
      })}
    </div>
    <button
      type="button"
      onClick={onEndReview}
      className={styles.endReviewButton}
    >
      END REVIEW
    </button>
  </aside>
);

const isMarksLine = (line) => /^\d+$/.test(line.trim());

const parseQuestionSection = (section) => {
  const lines = section.split("\n").map((line) => line.trimEnd());
  const marksIndex = lines.findIndex((line) => isMarksLine(line));

  if (marksIndex === -1) {
    return null;
  }

  const questionLines = lines.slice(0, marksIndex);
  const markschemeLines = lines.slice(marksIndex + 1);
  const questionText = questionLines.join("\n").trim();
  const markscheme = markschemeLines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((markschemePoint) => ({
      text: markschemePoint,
      selected: false,
    }));

  if (!questionText || markscheme.length === 0) {
    return null;
  }

  return {
    text: questionText,
    marks: parseInt(lines[marksIndex].trim(), 10),
    markscheme,
    answer: "",
    reviewed: false,
  };
};

export const parseSelfReviewText = (value) => {
  const sections = value
    .split(/\n\s*\n/)
    .map((section) => section.trim())
    .filter(Boolean);
  const parsedTitle = sections.shift() || "";
  const parsedQuestions = sections
    .map((section) => parseQuestionSection(section))
    .filter(Boolean)
    .map((question, index) => ({
      ...question,
      text: `${index + 1}. ${question.text}`,
    }));

  return { title: parsedTitle, questions: parsedQuestions };
};

export { getMarkschemePointValue, getQuestionScore };

const SelfReview = ({ text }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isReviewStage, setIsReviewStage] = useState(false);

  useEffect(() => {
    const { title: parsedTitle, questions: parsedQuestions } =
      parseSelfReviewText(text);
    setTitle(parsedTitle);
    setQuestions(parsedQuestions);
    setCurrentQuestionIndex(0);
    setIsReviewMode(false);
    setIsReviewStage(false);
  }, [text]);

  const showSummary = () => {
    setIsReviewStage(true);
    setIsReviewMode(false);
  };

  const handleSelectQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setIsReviewStage(false);
    setIsReviewMode(questions[index]?.reviewed ?? false);
  };

  const advanceToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setIsReviewMode(questions[index]?.reviewed ?? false);
  };

  const toggleReviewMode = () => {
    if (isReviewMode) {
      if (currentQuestionIndex === questions.length - 1) {
        showSummary();
        return;
      }

      advanceToQuestion(currentQuestionIndex + 1);
      return;
    }

    setQuestions((prevQuestions) =>
      prevQuestions.map((question, index) =>
        index === currentQuestionIndex
          ? { ...question, reviewed: true }
          : question,
      ),
    );
    setIsReviewMode(true);
  };

  const handleSelectMarkschemePoint = (questionIndex, pointIndex) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question, qIndex) => {
        if (qIndex === questionIndex) {
          const newMarkscheme = question.markscheme.map((point, pIndex) => {
            if (pIndex === pointIndex) {
              return { ...point, selected: !point.selected };
            }
            return point;
          });
          return { ...question, markscheme: newMarkscheme, reviewed: true };
        }
        return question;
      }),
    );
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question, qIndex) => {
        if (qIndex === questionIndex) {
          return { ...question, answer };
        }
        return question;
      }),
    );
  };

  return (
    <>
      <h1 className={styles.interactiveSubTitle}>{title}</h1>
      <div className={styles.selfReview}>
        {isReviewStage ? (
          <>
            <div className={styles.celebration}>😃</div>
            <ReviewDisplay questions={questions} />
          </>
        ) : (
          <div className={styles.exerciseLayout}>
            <div className={styles.exerciseContent}>
              {currentQuestionIndex < questions.length && (
                <>
                  <QuestionDisplay
                    question={questions[currentQuestionIndex]}
                    mode={isReviewMode ? "review" : "question"}
                    onAnswerChange={(answer) =>
                      handleAnswerChange(currentQuestionIndex, answer)
                    }
                    onSelectMarkschemePoint={(pointIndex) =>
                      handleSelectMarkschemePoint(
                        currentQuestionIndex,
                        pointIndex,
                      )
                    }
                  />
                  <div className={styles.questionProgress}>
                    [Question {currentQuestionIndex + 1} of {questions.length}]
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={toggleReviewMode}
                className={styles.reviewButton}
              >
                {isReviewMode && currentQuestionIndex < questions.length - 1
                  ? "Next"
                  : isReviewMode
                    ? "Review Summary"
                    : "Review"}
              </button>
            </div>
            <QuestionNavigator
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              isReviewMode={isReviewMode}
              onSelectQuestion={handleSelectQuestion}
              onEndReview={showSummary}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default SelfReview;
