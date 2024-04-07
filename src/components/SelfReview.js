import React, { useState, useEffect } from "react";
import styles from "./SelfReview.module.css";

const processMarkschemePoint = (text) => {
  // Use a regular expression to find words surrounded by asterisks
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
                <div className={styles.userAnswer}>{question.answer}</div>
              </td>
              <td className={styles.markschemeCell}>
                {question.markscheme.map((point, index) => (
                  <div
                    key={index}
                    className={`${styles.reviewMarkschemePoint} ${
                      point.selected ? styles.selected : ""
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: processMarkschemePoint(point.text),
                    }}
                  >
                    {/* point.text now processed and rendered with HTML */}
                  </div>
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
              >
                {/* point.text now processed and rendered with HTML */}
              </div>
            ))}
          </div>
          <div className={styles.marksScored}>[{marksScored} marks scored]</div>
        </>
      )}
    </div>
  );
};

const SelfReview = ({ text }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isReviewStage, setIsReviewStage] = useState(false);

  const parseText = (text) => {
    const sections = text.split("\n\n");
    const title = sections.shift();
    let questions = sections.map((section, index) => {
      const parts = section.split("\n").filter((part) => part.trim() !== ""); // Ensure empty lines are filtered out
      return {
        // Prefix the question number to the question text
        text: `${index + 1}. ${parts[0]}`, // Adjusted here
        marks: parseInt(parts[1], 10),
        markscheme: parts.slice(2).map((markschemePoint) => ({
          text: markschemePoint,
          selected: false, // Initial state for selection
        })),
        answer: "", // Initial state for user's answer
      };
    });

    return { title, questions };
  };

  useEffect(() => {
    const { title, questions } = parseText(text);
    setTitle(title);
    setQuestions(questions);
    setCurrentQuestionIndex(0);
    setIsReviewMode(false);
  }, [text]);

  const toggleReviewMode = () => {
    if (isReviewMode) {
      setCurrentQuestionIndex((prev) =>
        prev + 1 < questions.length ? prev + 1 : prev
      );
      if (currentQuestionIndex === questions.length - 1) {
        setIsReviewStage(true);
      }
      setIsReviewMode(false);
    } else {
      setIsReviewMode(true);
    }
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
      <h1 className="interactiveTitle">{title}</h1>
      <div className={styles.selfReview}>
        {isReviewStage ? (
          <>
            <div className={styles.celebration}>😃</div>
            <ReviewDisplay questions={questions} />
          </>
        ) : (
          <>
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
            <button onClick={toggleReviewMode} className={styles.reviewButton}>
              {isReviewMode && currentQuestionIndex < questions.length - 1
                ? "Next"
                : isReviewMode
                ? "Review Summary"
                : "Review"}
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default SelfReview;
