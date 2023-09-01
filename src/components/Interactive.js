import React from "react";
import { useLocation } from "react-router-dom";
import TextInput from "./TextInput";
import PhraseMemorise from "./PhraseMemorise";
import ImageReveal from "./ImageReveal";
import MatchDragDrop from "./MatchDragDrop";
import WordComplete from "./WordComplete";
import QuizBoard from "./QuizBoard";
import OrderedLine from "./OrderedLine";
import HorseRace from "./HorseRace";
import "./Interactive.css"; // Importing the CSS file
import { textFieldClasses } from "@mui/material";

function Interactive({ id }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const txt = queryParams.get("txt");

  const interativeDetails = [
    [
      "Phrase Memorise",
      "Provide a phrase to memorise",
      "The cat sat on the mat\nThe dog sat on the log",
    ],
    [
      "Image Reveal",
      "Provide a URL to a (sufficiently large) image: ",
      "https://upload.wikimedia.org/wikipedia/commons/b/b6/Felis_catus-cat_on_snow.jpg?credit=Von.grzanka,CC_BY-SA_3.0,via_Wikimedia%20Commons",
    ],
    [
      "Match Drag & Drop",
      "Provide paired terms and definitions separated by a newline. Each pair should be separated by an additional newline.",
      "Term 1\nDefinition 1\n\nTerm 2\nDefinition 2\n\nTerm 3\nDefinition 3\n\nTerm 4\nDefinition 4",
    ],
    [
      "Word Complete",
      "Provide some text with some words or numbers preceded by an asterisk to indicate words that should be tested: ",
      "The *cat sat on the *mat *2000 times.",
    ],
    [
      "Quiz Board",
      "Provide quiz questions on separate lines (with optional answers after an @ symbol at the end of each line). Asterisk the start of a line to indicate top-left alignment with new-line codes \\n permitted.",
      "What is the capital of France?@Paris\nWhat did you rate lunch on a scale of 1-5?\n*What letter is this?\\n-----\\n  |\\n  |\\n-----\\nScrollbars will appear if needed@The letter I of course!\nHow many columns does the quizboard fit?@4 questions\nHow many rows does the quizboard fit?@4 rows\nWhy does it go blue & red & dark gray if you keep clicking?@So you can mark which team scored that point or mark right/wrong",
    ],
    [
      "Ordered Line",
      "Provide a start & stop label for the line (separated by a hyphen) & then a list of items/events to be ordered on separate lines.",
      "Start Label-Stop Label\nThing 1\nThing 2\nThing 3",
    ],
    [
      "Horse Race",
      "Provide a list of names for each horse on separate lines.",
      "Ella\nJonathan\nMia\nAhmed\nCaitlin\n",
    ],
  ];

  if (!txt) {
    return (
      <>
        <h1 className="interactiveTitle">
          {interativeDetails[parseInt(id) - 1][0]}
        </h1>
        <TextInput
          interactiveId={id}
          instructions={interativeDetails[parseInt(id) - 1][1]}
          defaultval={interativeDetails[parseInt(id) - 1][2]}
        />
      </>
    );
  }

  switch (id) {
    case "1":
      return <PhraseMemorise text={txt} />;
    case "2":
      return <ImageReveal text={txt} />;
    case "3": // Handle the new interactive
      return <MatchDragDrop text={txt} />;
    case "4": // Handle the new interactive
      return <WordComplete text={txt} />;
    case "5":
      return <QuizBoard text={textFieldClasses} />;
    case "6":
      return <OrderedLine text={txt} />;
    case "7":
      return <HorseRace text={txt} />;
    default:
      return <div>Interactive #{id}</div>;
  }
}

export default Interactive;
