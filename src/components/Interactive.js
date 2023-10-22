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
import LeftOrRight from "./LeftOrRight";
import CategoryMatch from "./CategoryMatch";
import MultiChoice from "./MultiChoice";
import Timers from "./Timers";
import RandomWheel from "./RandomWheel";
import BuildingBlocks from "./BuildingBlocks";

import { decompressText } from "./TextInput";

import "./Interactive.css"; // Importing the CSS file
import "katex/dist/katex.min.css";

function Interactive({ id }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  let txt = queryParams.get("txt");
  if (txt) {
    txt = decompressText(txt).trim();
  }
  let txtFail = false;

  const interativeDetails = [
    [
      "Phrase Memorise",
      "Provide one or more phrases to memorise on separate lines:",
      "The cat sat on the mat\nThe dog sat on the log",
      "^[\\s\\S]*$",
    ],
    [
      "Image Reveal",
      "Provide a URL to a (sufficiently large) image: ",
      "https://upload.wikimedia.org/wikipedia/commons/b/b6/Felis_catus-cat_on_snow.jpg?credit=Von.grzanka,CC_BY-SA_3.0,via_Wikimedia%20Commons",
      "^(https?|file|ftp|mailto|tel|data)://.*$",
    ],
    [
      "Match Drag & Drop",
      "Provide paired terms and definitions separated by a newline. Each pair should be separated by an additional newline.",
      "Term 1\nDefinition 1\n\nTerm 2\nDefinition 2\n\nTerm 3\nDefinition 3\n\nMaths for fun\n$$E=mc^2$$",
      "^([^\\n]+\\n[^\\n]+\\n\\n)+[^\\n]+\\n[^\\n]+$",
    ],
    [
      "Word Complete",
      "Provide some text with some words or numbers preceded by an asterisk to indicate words that should be tested: ",
      "The *cat sat on the *mat *2000 times.",
      "^(?!.*\\*\\s)[\\s\\S]*$",
    ],
    [
      "Quiz Board",
      "Provide quiz questions on separate lines (with optional answers after an @ symbol at the end of each line). Asterisk the start of a line to indicate top-left alignment. Terms can include \n to indicate new lines; equations can be included in latex form between pairs of $$.",
      "What is the capital of France?@Paris\nWhat did you rate lunch on a scale of 1-5?\n*What letter is this?\\n-----\\n  |\\n  |\\n-----\\nScrollbars will appear if needed@The letter I of course!\nHow many columns does the quizboard fit?@4 questions\nHow many rows does the quizboard fit?@4 rows\nWhy does it go blue & red & dark gray if you keep clicking?@So you can mark which team scored that point or mark right/wrong",
      "^(?!.*@\\s*$)(?!.*@.*@)[^\\n]*(\\n(?!.*@\\s*$)(?!.*@.*@)[^\\n]*)*$",
    ],
    [
      "Ordered Line",
      "Provide a start & stop label for the line (separated by a hyphen) & then a list of items/events to be ordered on separate lines.",
      "Start Label-Stop Label\nThing 1\nThing 2\nThing 3",
      "^\\S[^\\n]*\\s*\\-\\s*[^\\n]+(\\n\\S[^\\n]*)+$",
    ],
    [
      "Horse Race",
      "Provide a list of names for each horse on separate lines.",
      "Ella\nJonathan\nMia\nAhmed\nCaitlin\n",
      "^(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*$",
    ],
    [
      "Left or Right",
      "Provide a list of pairs of items ... each pair has its two items separated by a line of three hyphens, and each pair is separated by a blank line. You can optionally mark one of the items in each pair with an asterisk as shown to indicate that it is correct & allow auto-marking. Equations can be included in latex form between pairs of $$",
      "*Apple\n---\nAple\n\nThe grand old Duke of York\nHe had 5000 men\n---\n*The grand old Duke of York\nHe had 10,000 men\n\n*Einstein thought $$E=mc^2$$\n---\nEinstein thought $$E=mc^3$$",
      "^(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*\\n\\-\\-\\-\\n(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*(\\n\\n(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*\\n\\-\\-\\-\\n(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*)*$",
    ],
    [
      "Category Match",
      "Provide a list of categories (one per line) then a blank line & then a list of terms (one per line). Terms can include \n to indicate new lines; equations can be included in latex form between pairs of $$.",
      "Fruit\nVegetables\n\nApple\nBanana\nCarrot\nPotato\nTomato\nA bit of maths for fun\\n$$E=mc^2$$",
      "^(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*\\n\\n(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*$",
    ],

    // removed option from CategoryMatch for now: You can optionally mark each term with its correct category using @<number> to indicate its correct category based on the ordered list of catergories above to allow auto-marking.
    // investigate converting to drag & drop using useDrag &useDrop of react-dnd to drag on top of cat component to associate it & then mark
    // react-dnd is setup and is wrapped around App so don't include the wrapper in the interactive

    [
      "Multi-Choice Quiz",
      "Provide a list of questions and options, separated by a blank line with the correct answer (optionally) asterisked. The options line at the top specifies whether questions scroll or appear one by one,whether immediate feedback is given on each question and an optional time in seconds which can be removed. Terms can include \n to indicate new lines; equations can be included in latex form between pairs of $$.",
      "OPTIONS:scroll=yes,immediate=yes,time=300\n\nWhat is the next letter after D?\nA\nC\n*E\nF\n\nWhat is the next number after 10?\n9\n10\n*11\n\nWhat do you think of this quiz?\nI love it\nI don't like it\nI don't mind it for a change",
      "^(?:OPTIONS.*\\n\\n)?(?:[^\\n]+\\n(?:[^\\n]+(?:\\n|$)){2,}\\n?)+$",
    ],

    [
      "Timers",
      "Provide a list of labels and whole numbers each representing a time in seconds.",
      "Task 1:15\nTask 2:20\nTask 3:10",
      "^([^:]+:\\d+)(\\n[^:]+:\\d+)*$",
    ],

    [
      "Random Wheel",
      "Provide a list of labels/names for the wheel.",
      "Piano\nTrumpet\nFlute\nHarp\nViolin",
      "^(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*$",
    ],

    [
      "Building Blocks",
      "Provide a list of labels for the blocks.",
      "Piano\nTrumpet\nFlute\nHarp\nViolin",
      "^(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*$",
    ],
  ];

  if (txt) {
    const regexPattern = interativeDetails[parseInt(id) - 1][3];
    const regex = new RegExp(regexPattern);
    txtFail = !regex.test(txt);
  }

  if (!txt || txtFail) {
    return (
      <>
        <h1 className="interactiveTitle">
          {interativeDetails[parseInt(id) - 1][0]}
        </h1>
        <TextInput
          invalidTxt={txtFail}
          interactiveId={id}
          instructions={interativeDetails[parseInt(id) - 1][1]}
          defaultval={txtFail ? txt : interativeDetails[parseInt(id) - 1][2]}
        />
      </>
    );
  }

  switch (id) {
    case "1":
      return <PhraseMemorise text={txt} />;
    case "2":
      return <ImageReveal text={txt} />;
    case "3":
      return <MatchDragDrop text={txt} />;
    case "4":
      return <WordComplete text={txt} />;
    case "5":
      return <QuizBoard text={txt} />;
    case "6":
      return <OrderedLine text={txt} />;
    case "7":
      return <HorseRace text={txt} />;
    case "8":
      return <LeftOrRight text={txt} />;
    case "9":
      return <CategoryMatch text={txt} />;
    case "10":
      return <MultiChoice text={txt} />;
    case "11":
      return <Timers text={txt} />;
    case "12":
      return <RandomWheel text={txt} />;
    case "13":
      return <BuildingBlocks text={txt} />;
    default:
      return <div>Interactive #{id}</div>;
  }
}

export default Interactive;
