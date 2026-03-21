import React, { useState, useEffect } from "react";
import styles from "./SelfReview.module.css";

const processMarkschemePoint = (text) => {
  const regex = /\*([^*]+)\*/g;
  return text.replace(regex, `<span class=${styles.highlight}>$1</span>`);
};

const ReviewDisplay = ({ questions }) => {
  const totalScore = questions.reduce(
    (acc, question) =>
      acc +
      Math.min(
        question.markscheme.filter((point) => point.selected).length,
        question.marks
      ),
    0
  );
  const maxScore = questions.reduce((acc, question) => acc + question.marks, 0);

  return (
    <div className={styles.reviewDisplay}>
      <table className={styles.reviewTable}>
        <tbody>
          {questions.map((question, index) => (
            <tr key={index}>
              <td className={styles.questionCell}>
                <div className={styles.reviewQuestionText}>{question.text}</div>
                <div className={styles.reviewMarksAvailable}>
                  [{question.marks}]
                </div>
                <div className={styles.userAnswer}>
                  {question.answer || <span className={styles.blankAnswer}>—</span>}
                </div>
              </td>
              <td className={styles.markschemeCell}>
                {question.markscheme.map((point, pointIndex) => (
                  <div
                    key={pointIndex}
                    className={`${styles.reviewMarkschemePoint} ${
                      point.selected ? styles.selected : ""
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: processMarkschemePoint(point.text),
                    }}
                  />
                ))}

                <div className={styles.marksScored}>
                  [
                  {Math.min(
                    question.markscheme.filter((point) => point.selected)
                      .length,
                    question.marks
                  )}{" "}
                  marks scored]
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
  const marksScored = Math.min(
    question.markscheme.filter((point) => point.selected).length,
    question.marks
  );

  return (
    <div className={styles.questionContainer}>
      <div className={styles.question}>{question.text}</div>
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
                dangerouslySetInnerHTML={{
                  __html: processMarkschemePoint(point.text),
                }}
              />
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
        const hasReviewSelections = question.markscheme.some(
          (point) => point.selected
        );

        return (
          <button
            key={question.text}
            type="button"
            onClick={() => onSelectQuestion(index)}
            className={`${styles.navigatorItem} ${
              isActive ? styles.navigatorItemActive : ""
            } ${isAnswered ? styles.navigatorItemAnswered : ""} ${
              hasReviewSelections ? styles.navigatorItemReviewed : ""
            }`}
          >
            <span className={styles.navigatorItemLabel}>Q{index + 1}</span>
            <span className={styles.navigatorItemStatus}>
              {hasReviewSelections
                ? "Reviewed"
                : isAnswered
                ? "Answered"
                : "Blank"}
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

const SelfReview = ({ text }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isReviewStage, setIsReviewStage] = useState(false);

  const parseText = (value) => {
    const sections = value.split("\n\n");
    const parsedTitle = sections.shift();
    const parsedQuestions = sections.map((section, index) => {
      const parts = section.split("\n").filter((part) => part.trim() !== "");
      return {
        text: `${index + 1}. ${parts[0]}`,
        marks: parseInt(parts[1], 10),
        markscheme: parts.slice(2).map((markschemePoint) => ({
          text: markschemePoint,
          selected: false,
        })),
        answer: "",
      };
    });

    return { title: parsedTitle, questions: parsedQuestions };
  };

  useEffect(() => {
    const { title: parsedTitle, questions: parsedQuestions } = parseText(text);
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

  const toggleReviewMode = () => {
    if (isReviewMode) {
      if (currentQuestionIndex === questions.length - 1) {
        showSummary();
        return;
      }

      setCurrentQuestionIndex((prev) => prev + 1);
      setIsReviewMode(false);
      return;
    }

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
          return { ...question, markscheme: newMarkscheme };
        }
        return question;
      })
    );
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question, qIndex) => {
        if (qIndex === questionIndex) {
          return { ...question, answer };
        }
        return question;
      })
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
                        pointIndex
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
              onSelectQuestion={setCurrentQuestionIndex}
              onEndReview={showSummary}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default SelfReview;
