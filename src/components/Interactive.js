import React, { useState } from "react";
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
import ScoreChart from "./ScoreChart";
import Tarsia from "./Tarsia";
import GridSolve from "./GridSolve";
import Anagram from "./Anagram";
import WordBanks from "./WordBanks";
import ImagePins from "./ImagePins";
import DeckOfCards from "./DeckOfCards";
import WordFind from "./WordFind";
import Connect from "./Connect";
// import CarGame from "./CarGame";
import WordSearch from "./WordSearch";
import DecompressText from "./DecompressText";
import DiamondNine from "./DiamondNine";
import PrizePot from "./PrizePot";

import { decompressText } from "./TextInput";

import "./Interactive.css"; // Importing the CSS file
import "katex/dist/katex.min.css";

function Interactive({ id }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  // Conditionally render the file input for ImagePins interactive
  const shouldShowUpload = id === "19" || id === "2"; // for ImagePins and ImageReveal
  let txt = queryParams.get("txt");
  if (txt) {
    txt = decompressText(txt).trim();
  }
  let txtFail = false;
  const [textInputValue, setTextInputValue] = useState("");

  const interativeDetails = [
    [
      "Phrase Memorise",
      "Provide one or more phrases to memorise on separate lines:",
      "The cat sat on the mat\nThe dog sat on the log",
      "^[\\s\\S]*$",
    ],
    [
      "Image Reveal",
      "Provide a URL to a (sufficiently large) image. You can also provide your own image in base64 encoded format as shown in the Image Pins interactive example.",
      "https://upload.wikimedia.org/wikipedia/commons/b/b6/Felis_catus-cat_on_snow.jpg?credit=Von.grzanka,CC_BY-SA_3.0,via_Wikimedia%20Commons",
      "^(https?|file|ftp|mailto|tel|data):.*$",
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
      "Categorise",
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

    [
      "Score Chart",
      "Provide a list of labels for the score bars and optional initial scores",
      "Team 1:5\nTeam 2:0\nTeam 3",
      "^([^:]+(:\\d+)?)(\\n[^:]+(:\\d+)?)*$",
    ],

    [
      "Tarsia Squares",
      "Provide a list of questions and answers colon-separated",
      "Capital of France:Paris\nLargest Planet:Jupiter\n$$9^2$$:81\nFirst President of USA:George Washington\nElement Symbol for Gold:Au\nAuthor of 1984:George Orwell\n$$x(x+2)$$:$$x^2+2x$$\nCurrency of Japan:Yen\nSpeed of Light:299,792,458 m/s\nHuman Chromosomes:46\nLongest River:Nile\nSmallest Prime:2",
      "^([^:]+(:.+)?)(\\n[^:]+(:.+)?)*$",
    ],

    [
      "Grid Solve",
      "Provide paired questions and answers separated by a newline. Each pair should be separated by an additional newline. Questions can include \\n for new lines. Marking will be case and whitespace insensitive.",
      "Capital of France\nParis\n\nLargest Planet\nJupiter\n\n$$9^2$$\n81\n\nFirst President of USA\nGeorge Washington\n\nElement Symbol for Gold\nAu\n\nAuthor of 1984\nGeorge Orwell\n\n$$x(x+2)$$\nx^2+2x\n\nCurrency of Japan\nYen\n\nLongest River\nNile\n\nSmallest Prime\n2",
      "^[\\s\\S]*$",
    ],

    [
      "Anagram",
      "Provide paired clues and words/short phrases on consecutive lines with each pair separated by an additional newline. The options line at the top specifies whether the anagram is by letters (default) or by words which would be suitable for phrase answers.",
      "OPTIONS:mode=letter\n\nCapital of France\nParis\n\nLargest Planet\nJupiter\n\nAuthor of 1984\nGeorge Orwell",
      "^[\\s\\S]*$",
    ],

    [
      "Word Banks",
      "Provide lines of text with some words asterisked to indicate words which will be removed and put into the word bank.",
      "*Paris is the capital of *France\n*George *Orwell wrote *Animal *Farm",
      "^[\\s\\S]*$",
    ],

    [
      "Image Pins",
      "Allows the user to place pins on an image to highlight points of interest. Note you can specify an image URL, as shown in the Image Reveal interactive, or your own image in base64 format as shown below by selecting a local image up to max 15 KB.",
      "data:image/png;base64,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",
      "^[\\s\\S]*$",
    ],

    [
      "Deck Of Cards",
      "Each line below will become a separate card in a shuffled pack. Use | to give the card a reverse-side and @ to link the card to a URL",
      "green and in your garden|grass\nthis website|www.classinteractives.co.uk@https://www.classinteractives.co.uk\na card without a reverse side",
      "^[\\s\\S]*$",
    ],

    [
      "Word Find",
      "For your chosen topic area, give a list of words to be found in the word search puzzle, one per line",
      "Fruits\n\nApple\nBanana\nCherry\nDate\nElderberry\nFig\nGrape\nMelon",
      "^.*\\n\\n(.*\\n?)*$",
    ],

    [
      "Connect",
      "List groups of words, separated by a blank line, to allow the user to try to match the groups together",
      "cat\nfrog\ndog\nlion\n\nchair\ntable\ndesk\n\nrun\njump\ncrawl",
      "^(.*\\n*)*$",
    ],

    //[
    //  "Car Game",
    //  "Collect the on-topic words whilst avoiding the off-topic ones! First give a topic followed by blank-line separated lists of on-topic and off-topic words",
    //  "animals\n\ncat\ndog\nrabbit\nfish\n\nchair\napple\ncar",
    //  "^(.*\\n*)*$",
    //],

    [
      "WordSearch",
      "Provide a topic and list of words. The options line at the top specifies the grid size (5-20), whether to show the words being found and whether to only use simpler directions with no overlaps.",
      "OPTIONS:size=10,show=yes,simple=no\nAnimals\nzebra\nfrog\nbutterfly\nrabbit\ndeer\nlion",
      "^[\\s\\S]*$",
    ],

    [
      "Diamond Nine",
      "Provide a title and then nine lines (for the tiles).Options specify whether editing of the tiles is allowed.",
      "OPTIONS:editing=yes\nSocietal Spending\nHealth\nEducation\nDefence\nWelfare\nTransport\nEnvironment\nHousing\nIndustry\nAgriculture",
      "^([^\n]+\n){10}[^\n]+$",
    ],

    [
      "Prize Pot",
      "Provide a set of blank-line separated questions, each with a question followed by exactly four answers, one of which is correct denoted by a *",
      "What is the next letter after D?\nA\nC\n*E\nF\n\nWhat is the next number after 10?\n9\n10\n*11\n12\n\nWhat is the third vowel in alphabet order?\nU\nE\n*I\nA\n\nWhat is the penultimate letter of the alphabet?\n*Y\nX\nZ\nW",
      "^[\\s\\S]*$",
    ],

    [
      "Edit",
      "Paste a full puzzle URL below to decompress the text for further editing:",
      "https://www.classinteractives.co.uk/?id=18&txt=FQBQhgTglgzgBLOAXAFgUzgYzAByksAGzgHsAzOYAMQjADtM0AoYAcTRIgHMNgB5CAHc0hYoIgkkvAIJ0oAWyKUqkeUA",
      "^https.*$",
    ],
  ];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const maxSize = 15 * 1024; // 15 KB, for example

    if (file) {
      if (file.size > maxSize) {
        alert(
          "File is too large. Please select a file compressed to smaller than 15 KB for custom uploads."
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setTextInputValue(dataUrl); // Update the state with the Data URL
      };
      reader.readAsDataURL(file);
    }
  };

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
        {shouldShowUpload && (
          <>
            <p>Choose a custom image up to 15 KB max:</p>
            <input
              type="file"
              className="fileUpload"
              accept="image/*"
              onChange={handleFileChange}
            />
          </>
        )}
        <TextInput
          invalidTxt={txtFail}
          interactiveId={id}
          instructions={interativeDetails[parseInt(id) - 1][1]}
          defaultval={
            txtFail
              ? txt
              : textInputValue || interativeDetails[parseInt(id) - 1][2]
          }
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
    case "14":
      return <ScoreChart text={txt} />;
    case "15":
      return <Tarsia text={txt} />;
    case "16":
      return <GridSolve text={txt} />;
    case "17":
      return <Anagram text={txt} />;
    case "18":
      return <WordBanks text={txt} />;
    case "19":
      return <ImagePins text={txt} />;
    case "20":
      return <DeckOfCards text={txt} />;
    case "21":
      return <WordFind text={txt} />;
    case "22":
      return <Connect text={txt} />;
    case "23":
      return <WordSearch text={txt} />;
    case "24":
      return <DiamondNine text={txt} />;
    case "25":
      return <PrizePot text={txt} />;
    case "26":
      return <DecompressText text={txt} />;
    default:
      return <div>Interactive #{id}</div>;
  }
}

export default Interactive;
