// At the top of your Interactive component file
import React, {
  Suspense,
  lazy,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import ShareModal from "./ShareModal.js";
import { useEditContext } from "../EditContext";
import { handleActivityFileChange } from "../ImageUploads";
import { useLocation, useHistory } from "react-router-dom";
import TextInput from "./TextInput";
import { compressText, decompressText } from "./TextInput";
import "./Interactive.css"; // Importing the CSS file
import "katex/dist/katex.min.css";
import { ACTIVITY_DATA_SEPARATOR } from "./Uploader";
import { LOCAL_MARKER } from "./TextInput";

const PhraseMemorise = lazy(() => import("./PhraseMemorise"));
const ImageReveal = lazy(() => import("./ImageReveal"));
const MatchDragDrop = lazy(() => import("./MatchDragDrop"));
const WordComplete = lazy(() => import("./WordComplete"));
const QuizBoard = lazy(() => import("./QuizBoard"));
const OrderedLine = lazy(() => import("./OrderedLine"));
const HorseRace = lazy(() => import("./HorseRace"));
const LeftOrRight = lazy(() => import("./LeftOrRight"));
const CategoryMatch = lazy(() => import("./CategoryMatch"));
const MultiChoice = lazy(() => import("./MultiChoice"));
const Timers = lazy(() => import("./Timers"));
const RandomWheel = lazy(() => import("./RandomWheel"));
const BuildingBlocks = lazy(() => import("./BuildingBlocks"));
const ScoreChart = lazy(() => import("./ScoreChart"));
const Tarsia = lazy(() => import("./Tarsia"));
const GridSolve = lazy(() => import("./GridSolve"));
const Anagram = lazy(() => import("./Anagram"));
const WordBanks = lazy(() => import("./WordBanks"));
const ImagePins = lazy(() => import("./ImagePins"));
const DeckOfCards = lazy(() => import("./DeckOfCards"));
const WordFind = lazy(() => import("./WordFind"));
const Connect = lazy(() => import("./Connect"));
const WordSearch = lazy(() => import("./WordSearch"));
const DiamondNine = lazy(() => import("./DiamondNine"));
const PrizePot = lazy(() => import("./PrizePot"));
const Geometry = lazy(() => import("./Geometry"));
const Order = lazy(() => import("./Order"));
const SelfReview = lazy(() => import("./SelfReview"));
const TimeRecorder = lazy(() => import("./TimeRecorder"));
const WordMatch = lazy(() => import("./WordMatch"));
const RaffleBalls = lazy(() => import("./RaffleBalls"));

const Uploader = lazy(() => import("./Uploader"));
// const DecompressText = lazy(() => import("./DecompressText"));

const specialIDs = ["999"]; // for Uploader
// import CarGame from "./CarGame";

function Interactive({ id }) {
  const {
    isEditable,
    disableEdit,
    textData,
    setTextData,
    imageData,
    setImageData,
  } = useEditContext();

  const history = useHistory();
  const location = useLocation();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const txt = queryParams.get("txt");
  // Conditionally render the file input for ImagePins interactive
  const idIsSpecial = specialIDs.includes(id);

  let txtFail = false;

  const [initialLoad, setInitialLoad] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const handleShareClick = () => {
    // build share URL if not too long
    const url = new URL(window.location);
    let params = url.searchParams;
    const idValue = params.get("id");
    params = new URLSearchParams({
      id: idValue,
      txt: compressText(textData),
    });

    const shareUrl = `${window.location.origin}${
      window.location.pathname
    }?${params.toString()}`;

    if (shareUrl.length > 2000 || imageData) {
      setShareUrl(
        "The URL is too long to share ... please use the Save option instead and distribute the file for use with the Uploader home-page option."
      );
    } else {
      setShareUrl(shareUrl);
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const updateDataFromFile = useCallback(
    (fileContent) => {
      const lines = fileContent.split("\n");

      const textDataLine = lines.find((line) => line.includes("ActivityData:"));

      if (textDataLine) {
        // split on the separator
        const [txtData, imgData] = textDataLine
          .replace("ActivityData:", "")
          .split(ACTIVITY_DATA_SEPARATOR);

        if (txtData) {
          setTextData(decompressText(txtData));
        }

        // set image data if it exists
        if (imgData) {
          setImageData(decompressText(imgData));
        }
      }
    },
    [setTextData, setImageData]
  );

  useEffect(() => {
    const switchToRun = () => {
      disableEdit();
      // switch to run
      const url = new URL(window.location);
      let params = url.searchParams;
      // Retrieve the value of the current id
      const idValue = params.get("id");

      params = new URLSearchParams({
        id: idValue,
        txt: compressText("localrun"),
      });

      history.replace({
        pathname: location.pathname,
        search: params.toString(),
      });
    };

    const restoreData = () => {
      // data should be already stored in textData or imageData
      let txtData = "";

      if (!idIsSpecial && !textData) {
        if (sessionStorage.getItem("textData")) {
          // check sessionStorage
          txtData = sessionStorage.getItem("textData");
          setTextData(txtData);
        }
      }

      if (txtData && txtData.includes(LOCAL_MARKER) && !imageData) {
        if (sessionStorage.getItem("imageData")) {
          setImageData(sessionStorage.getItem("imageData"));
        }
      }
    };

    if (initialLoad) {
      if (txt && (txt.startsWith("http:") || txt.startsWith("https:"))) {
        // loading via CORS
        fetch(decodeURIComponent(txt))
          .then((response) => response.text())
          .then((data) => {
            updateDataFromFile(data);
            switchToRun();
          })
          .catch((error) =>
            console.error("Error loading remote activity:", error)
          );
      } else {
        let txtprocess = decompressText(txt).trim();

        if ((!txtprocess || txtprocess === "localedit") && !idIsSpecial) {
          setInitialLoad(false);
          restoreData();
          return;
        } else if (txtprocess === "localrun" || idIsSpecial) {
          setInitialLoad(false);
          restoreData();
          return;
        } else {
          setTextData(txtprocess);
          switchToRun();
        }
      }
    }
  }, [
    initialLoad,
    idIsSpecial,
    setTextData,
    disableEdit,
    history,
    location.pathname,
    txt,
    imageData,
    queryParams,
    setImageData,
    textData,
    updateDataFromFile,
  ]);

  const INVALID = (
    <div className="invalidInteractive">
      This is an invalid link which does not embed the interactive data. Load
      the interactive via the option on the homepage instead. Or browse to it
      now ...
      <br />
      <input
        type="file"
        className="fileUpload"
        accept=".txt"
        onChange={(event) =>
          handleActivityFileChange(event.target.files[0], updateDataFromFile)
        }
      />
    </div>
  );

  const handleSaveClick = () => {
    const fileName = "ClassInteractive.txt";
    let fileText = `This is a Class Interactive learning exercise.\n\nTo play it, visit www.classinteractives.co.uk and use the Load option to select this text file.\n\nAlternatively use the Activity Link below.\n\n`;

    fileText += `Activity Link:\n${window.location.href}\n\n`;

    let activityData = "";

    if (textData) {
      activityData += compressText(textData);
    }

    if (imageData) {
      activityData += ACTIVITY_DATA_SEPARATOR + compressText(imageData);
    }

    if (activityData) {
      fileText += `ActivityData:${activityData}\n\n`;
    }

    const blob = new Blob([fileText], { type: "text/plain" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a); // Append the anchor to body temporarily
    a.click(); // Trigger the download

    document.body.removeChild(a); // Clean up by removing the anchor from body
  };

  const handleEditClick = () => {
    const url = new URL(window.location);
    let params = url.searchParams;
    // Retrieve the value of the current id
    const idValue = params.get("id");

    params = new URLSearchParams({
      id: idValue,
      txt: compressText("localedit"),
    });
    history.replace({
      pathname: location.pathname,
      search: params.toString(),
    });
  };

  const resolveInteractive = (id, txt) => {
    switch (id) {
      case "1":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <PhraseMemorise text={txt} />
          </Suspense>
        );
      case "2":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <ImageReveal text={txt} />
          </Suspense>
        );
      case "3":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <MatchDragDrop text={txt} />
          </Suspense>
        );
      case "4":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <WordComplete text={txt} />
          </Suspense>
        );
      case "5":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <QuizBoard text={txt} />
          </Suspense>
        );
      case "6":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <OrderedLine text={txt} />
          </Suspense>
        );
      case "7":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <HorseRace text={txt} />
          </Suspense>
        );
      case "8":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <LeftOrRight text={txt} />
          </Suspense>
        );
      case "9":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <CategoryMatch text={txt} />
          </Suspense>
        );
      case "10":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <MultiChoice text={txt} />
          </Suspense>
        );
      case "11":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Timers text={txt} />
          </Suspense>
        );
      case "12":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <RandomWheel text={txt} />
          </Suspense>
        );
      case "13":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <BuildingBlocks text={txt} />
          </Suspense>
        );
      case "14":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <ScoreChart text={txt} />
          </Suspense>
        );
      case "15":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Tarsia text={txt} />
          </Suspense>
        );
      case "16":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <GridSolve text={txt} />
          </Suspense>
        );
      case "17":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Anagram text={txt} />
          </Suspense>
        );
      case "18":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <WordBanks text={txt} />
          </Suspense>
        );
      case "19":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <ImagePins text={txt} />
          </Suspense>
        );
      case "20":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <DeckOfCards text={txt} />
          </Suspense>
        );
      case "21":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <WordFind text={txt} />
          </Suspense>
        );
      case "22":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Connect text={txt} />
          </Suspense>
        );
      case "23":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <WordSearch text={txt} />
          </Suspense>
        );
      case "24":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <DiamondNine text={txt} />
          </Suspense>
        );
      case "25":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <PrizePot text={txt} />
          </Suspense>
        );
      case "26":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Geometry text={txt} />
          </Suspense>
        );
      case "27":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Order text={txt} />
          </Suspense>
        );
      case "28":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <SelfReview text={txt} />
          </Suspense>
        );
      case "29":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <TimeRecorder text={txt} />
          </Suspense>
        );
      case "30":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <WordMatch text={txt} />
          </Suspense>
        );
      case "31":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <RaffleBalls text={txt} />
          </Suspense>
        );
      case "999":
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Uploader text={txt} />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Uploader text={txt} />
          </Suspense>
        );
    }
  };

  const interativeDetails = [
    [
      "Phrase Memorise",
      "Provide one or more phrases to memorise on separate lines. Options specify whether how to show each word (first/all/none) where the default is to show each first letter. Options also specifies how to order phrases (random/maintain).",
      "OPTIONS:show=first,order=random\nThe cat sat on the mat\nThe dog sat on the log",
      "^[\\s\\S]*$",
      "click each word to toggle its view",
      false,
    ],
    [
      "Image Reveal",
      "Provide a URL to an image to reveal using a tiled grid.",
      "OPTIONS:gridsize=5\nhttps://upload.wikimedia.org/wikipedia/commons/b/b6/Felis_catus-cat_on_snow.jpg?credit=Von.grzanka,CC_BY-SA_3.0,via_Wikimedia%20Commons",
      "^(OPTIONS:.*\\n)?((https?|file|ftp|mailto|tel|data):.*)|\\[local\\]$",
      "click boxes to reveal",
      true,
    ],
    [
      "Match Drag & Drop",
      "Provide paired terms and definitions separated by a newline. Each pair should be separated by an additional newline.",
      "Term 1\nDefinition 1\n\nTerm 2\nDefinition 2\n\nTerm 3\nDefinition 3\n\nMaths for fun\n$$E=mc^2$$",
      "^([^\\n]+\\n[^\\n]+\\n\\n)+[^\\n]+\\n[^\\n]+$",
      "drag and drop to match",
      false,
    ],
    [
      "Word Complete",
      "Provide some text with some words or numbers preceded by an asterisk to indicate words that should be tested: ",
      "The *cat sat on the *mat 20 times today and *30 times yesterday so *50 times in total.",
      "^(?!.*\\*\\s)[\\s\\S]*$",
      "type the missing words within 3 guesses to keep your streak",
      false,
    ],
    [
      "Quiz Board",
      "Provide quiz questions on separate lines (with optional answers after an @ symbol at the end of each line). Asterisk the start of a line to indicate top-left alignment. Terms can include \n to indicate new lines; equations can be included in latex form between pairs of $$.",
      "What is the capital of France?@Paris\nWhat did you rate lunch on a scale of 1-5?\n*What letter is this?\\n-----\\n  |\\n  |\\n-----\\nScrollbars will appear if needed@The letter I of course!\nHow many columns does the quizboard fit?@4 questions\nHow many rows does the quizboard fit?@4 rows\nWhy does it go blue & red & dark gray if you keep clicking?@So you can mark which team scored that point or mark right/wrong",
      "^(?!.*@\\s*$)(?!.*@.*@)[^\\n]*(\\n(?!.*@\\s*$)(?!.*@.*@)[^\\n]*)*$",
      "click to reveal; click again to reveal answer or colour tile",
      false,
    ],
    [
      "Ordered Line",
      "Provide a start & stop label for the line (separated by a hyphen) & then a list of items/events to be ordered on separate lines.",
      "Start Label-Stop Label\nThing 1\nThing 2\nThing 3",
      "^\\S[^\\n]*\\s*\\-\\s*[^\\n]+(\\n\\S[^\\n]*)+$",
      "drag left/right to order",
      false,
    ],
    [
      "Horse Race",
      "Provide a list of names for each horse on separate lines.",
      "Ella\nJonathan\nMia\nAhmed\nCaitlin\n",
      "^(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*$",
      "click a horse to award a move or use the random move button",
      false,
    ],
    [
      "Left or Right",
      "Provide a list of pairs of items ... each pair has its two items separated by a line of three hyphens, and each pair is separated by a blank line. You can optionally mark one of the items in each pair with an asterisk as shown to indicate that it is correct & allow auto-marking. Equations can be included in latex form between pairs of $$",
      "*Apple\n---\nAple\n\nThe grand old Duke of York\nHe had 5000 men\n---\n*The grand old Duke of York\nHe had 10,000 men\n\n*Einstein thought $$E=mc^2$$\n---\nEinstein thought $$E=mc^3$$",
      "^(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*\\n\\-\\-\\-\\n(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*(\\n\\n(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*\\n\\-\\-\\-\\n(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*)*$",
      "click left or right to select the right option",
      false,
    ],
    [
      "Categorise",
      "Provide a list of categories (one per line) then a blank line & then a list of terms (one per line). Terms can include \n to indicate new lines; equations can be included in latex form between pairs of $$.",
      "Fruit\nVegetables\n\nApple\nBanana\nCarrot\nPotato\nTomato\nA bit of maths for fun\\n$$E=mc^2$$",
      "^(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*\\n\\n(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*$",
      "drag terms to categories",
      false,
    ],

    // removed option from CategoryMatch for now: You can optionally mark each term with its correct category using @<number> to indicate its correct category based on the ordered list of catergories above to allow auto-marking.
    // investigate converting to drag & drop using useDrag &useDrop of react-dnd to drag on top of cat component to associate it & then mark
    // react-dnd is setup and is wrapped around App so don't include the wrapper in the interactive

    [
      "Multi-Choice Quiz",
      "Provide a list of questions and options, separated by a blank line with the correct answer (optionally) asterisked. The options line at the top specifies whether questions scroll or appear one by one,whether immediate feedback is given on each question and an optional time in seconds which can be removed. Terms can include \n to indicate new lines; equations can be included in latex form between pairs of $$.",
      "OPTIONS:scroll=yes,immediate=yes,time=300\n\nWhat is the next letter after D?\nA\nC\n*E\nF\n\nWhat is the next number after 10?\n9\n10\n*11\n\nWhat do you think of this quiz?\nI love it\nI don't like it\nI don't mind it for a change",
      "^(?:OPTIONS.*\\n\\n)?(?:[^\\n]+\\n(?:[^\\n]+(?:\\n|$)){2,}\\n?)+$",
      "click to select an answer",
      false,
    ],

    [
      "Timers",
      "Provide a list of labels and whole numbers each representing a time in seconds.",
      "Task 1:15\nTask 2:20\nTask 3:10",
      "^([^:]+:\\d+)(\\n[^:]+:\\d+)*$",
      "time multiple events",
      false,
    ],

    [
      "Random Wheel",
      "Provide a list of labels/names for the wheel with optional number of times to repeat any of them using a colon and frequency. Options specifies the spin time in seconds.",
      "OPTIONS:time=8\nPiano:3\nTrumpet\nFlute\nHarp\nViolin",
      "^(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*$",
      "click an item from the list to remove, right-click to remove all instances",
      false,
    ],

    [
      "Building Blocks",
      "Provide a list of labels for the blocks.",
      "Piano\nTrumpet\nFlute\nHarp\nViolin",
      "^(?!\\s*$)[^\\n]+(\\n(?!\\s*$)[^\\n]+)*$",
      "drag or resize blocks, double-click to bring to the front, right-click to delete",
      false,
    ],

    [
      "Score Chart",
      "Provide a list of labels for the score bars and optional initial scores",
      "Team 1:5\nTeam 2:0\nTeam 3",
      "^([^:]+(:\\d+)?)(\\n[^:]+(:\\d+)?)*$",
      "use the buttons to add or subtract points",
      false,
    ],

    [
      "Tarsia Squares Puzzle",
      "Provide a list of questions and answers colon-separated",
      "Capital of France:Paris\nLargest Planet:Jupiter\n$$9^2$$:81\nFirst President of USA:George Washington\nElement Symbol for Gold:Au\nAuthor of 1984:George Orwell\n$$x(x+2)$$:$$x^2+2x$$\nCurrency of Japan:Yen\nSpeed of Light:299,792,458 m/s\nHuman Chromosomes:46\nLongest River:Nile\nSmallest Prime:2",
      "^([^:]+(:.+)?)(\\n[^:]+(:.+)?)*$",
      "get q&a pairs next to each other: use rotate button or click one box then another to swap",
      false,
    ],

    [
      "Grid Solve",
      "Provide paired questions and answers separated by a newline. Each pair should be separated by an additional newline. Questions can include \\n for new lines. Marking will be case and whitespace insensitive.",
      "Capital of France\nParis\n\nLargest Planet\nJupiter\n\n$$9^2$$\n81\n\nFirst President of USA\nGeorge Washington\n\nElement Symbol for Gold\nAu\n\nAuthor of 1984\nGeorge Orwell\n\n$$x(x+2)$$\nx^2+2x\n\nCurrency of Japan\nYen\n\nLongest River\nNile\n\nSmallest Prime\n2",
      "^[\\s\\S]*$",
      "click a square to complete an answer - press enter to check it",
      false,
    ],

    [
      "Anagram",
      "Provide paired clues and words/short phrases on consecutive lines with each pair separated by an additional newline. The options line at the top specifies whether the anagram is by letters (default) or by words which would be suitable for phrase answers.",
      "OPTIONS:mode=letter\n\nCapital of France\nParis\n\nLargest Planet\nJupiter\n\nAuthor of 1984\nGeorge Orwell",
      "^[\\s\\S]*$",
      "drag and drop items left or right to find the correct order",
      false,
    ],

    [
      "Word Banks",
      "Provide lines of text with some words asterisked to indicate words which will be removed and put into the word bank.",
      "*Paris is the capital of *France\n*George *Orwell wrote *Animal *Farm",
      "^[\\s\\S]*$",
      "drag & drop words to fill in the gaps",
      false,
    ],

    [
      "Image Pins",
      "Allows the user to place or label pins on an image. The last line should be the image URL; use prior lines to specify optional existing pin labels to be positioned. Any label ending with a coordinate with be fixed at that percentage from the top-left; the label will be hidden and the user will need to correctly label it. The show option specifies whether to show a list of the hidden labels on the right and setting disable_adding means that new user pins are not allowed.",
      "OPTIONS:show=yes,disable_adding=no\nZambia(65,72)\nKenya(80,50)\nSouth Africa\nhttps://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Africa_map.svg/585px-Africa_map.svg.png?20221108003218",
      "^[\\s\\S]*$",
      "double-click to label pin, drag to move pin, click to add pin, right-click to delete added pin",
      true,
    ],

    [
      "Deck Of Cards",
      "Each line below will become a separate card in a shuffled pack. Use | to give the card a reverse-side and @ to link the card to a URL",
      "green and in your garden|grass\nthis website|www.classinteractives.co.uk@https://www.classinteractives.co.uk\na card without a reverse side",
      "^[\\s\\S]*$",
      "click to flip, right-click to reveal URL",
      false,
    ],

    [
      "Word Find",
      "For your chosen topic area, give a list of words to be found in the word search puzzle, one per line",
      "Fruits\n\nApple\nBanana\nCherry\nDate\nElderberry\nFig\nGrape\nMelon",
      "^(.*\\n?)*$",
      "guess all the words with as few letter hints needed as possible",
      false,
    ],

    [
      "Connect",
      "List groups of words, separated by a blank line, to allow the user to try to match the groups together",
      "cat\nfrog\ndog\nlion\n\nchair\ntable\ndesk\n\nrun\njump\ncrawl",
      "^(.*\\n*)*$",
      "select groups of related words and then click to check your selection",
      false,
    ],

    //[
    //  "Car Game",
    //  "Collect the on-topic words whilst avoiding the off-topic ones! First give a topic followed by blank-line separated lists of on-topic and off-topic words",
    //  "animals\n\ncat\ndog\nrabbit\nfish\n\nchair\napple\ncar",
    //  "^(.*\\n*)*$",
    //],

    [
      "WordSearch",
      "Provide a topic and list of words. The options line at the top specifies the grid size (5-20), whether to show the words being found, whether to give a reveal option and whether to only use simpler directions / no overlaps. Each user will get a new random grid each time.",
      "OPTIONS:size=10,show=yes,simple=no,reveal=yes\nAnimals\nzebra\nfrog\nbutterfly\nrabbit\ndeer\nlion",
      "^[\\s\\S]*$",
      "click the first and then last letter of a word to identify it",
      false,
    ],

    [
      "Diamond Nine",
      "Provide a topic and then nine lines (for the tiles).Options specify whether editing of the tiles is allowed.",
      "OPTIONS:editing=yes\nPrioritise Societal Spending\nHealth\nEducation\nDefence\nWelfare\nTransport\nEnvironment\nHousing\nIndustry\nAgriculture",
      "^([^\n]+\n){10}[^\n]+$",
      "arrange the tiles in your priority from top to bottom; click a tile then a place",
      false,
    ],

    [
      "Prize Pot Quiz",
      "Provide a set of blank-line separated questions, each with a question followed by exactly four answers, one of which is correct denoted by a *",
      "What is the next letter after D?\nA\nC\n*E\nF\n\nWhat is the next number after 10?\n9\n10\n*11\n12\n\nWhat is the third vowel in alphabet order?\nU\nE\n*I\nA\n\nWhat is the penultimate letter of the alphabet?\n*Y\nX\nZ\nW",
      "^[\\s\\S]*$",
      "drag at least some of your prize pot to an option or click one to risk it all!",
      false,
    ],

    [
      "Geometry",
      "Provide a list of polygons, one per line, as defined by a set of vertices on a conceptual 1000 pixel by 1000 pixel square. Straight lines only require two vertices. The options line controls whether angles are shown.",
      "OPTIONS:angles=yes\n(300,500),(500,300),(700,800)\n(900,100),(900,200)\n[100,100],[130,130]",
      "^[\\s\\S]*$",
      "right click to duplicate shape, double-click vertex to remove, double-click polygon to add a vertex, drag a shape to move",
      false,
    ],

    [
      "Order",
      "Order items into the correct sequence. Provide a title and line-separated list of items, one per line, in the correct order.",
      "Alphabetical\n\ncat\nfrog\nlion\nzebra\n\napple\ndate\nmelon\norange\npear",
      "^[\\s\\S]*$",
      "drag to order correctly",
      false,
    ],

    [
      "Self-Review",
      "Provide a title, followed by new-line separated groups where each group contains a question, marks available and a list of markscheme points. There can be more markscheme points than marks and asterisks are used to mark underlined key vocabulary.",
      "Data Structures\n\nDefine an array\n3\nA *finite* collection of elements\nof the same *type*\n*sequenced/ordered* by an index\n\nDefine a set\n2\nAn *unordered* collection\nof *unique* elements",
      "^.*\n\n(?:.+\n[1-9]d*(?:\n.+)+)(?:\n\n.+\n[1-9]d*(?:\n.+)+)*$",
      "write your answer then select from markscheme points to award marks",
      false,
    ],

    [
      "Time Recorder",
      "Provide a list of categories to record time against. The first line can optionally specify the time in seconds to start with & count down. Design by Allan Williamson.",
      "OPTIONS:time=3600\nTeacher Whole Class Talk\nStudent Whole Class Talk\nStudent Group Exercise\nStudent Individual Exercise",
      "^[\\s\\S]*$",
      "click each category to record time against that category",
      false,
    ],
    [
      "Word Match",
      "For your chosen topic area, give a list of words to be found in the word search puzzle, one per line",
      "Fruits\n\napple\nbanana\ncherry\ndate\nelderberry\nfig\ngrape\nmelon",
      "^(.*\\n?)*$",
      "type letters to guess the words using the colour feedback: green for correct, red stripe for not in word, yellow dots for elsewhere in word",
      false,
    ],
    [
      "Raffle Balls",
      "Provide a list of comma-separated names and their number of raffle tickets",
      "Gemma,12\nPaul,8\nMarkus,13\nAmy,10",
      "^(.*\\n?)*$",
      "use the buttons to select a raffle ball or restore the removed one to the box; click a ball to expand it",
      false,
    ],
  ];

  // MAIN PROCESSING

  if (!txt || (!txt.startsWith("http:") && !txt.startsWith("https:"))) {
    let txtprocess = decompressText(txt).trim();

    // check if we are in localrun mode, localedit mode or load mode
    if ((!txtprocess || txtprocess === "localedit") && !idIsSpecial) {
      const txtTextInput = txtprocess
        ? textData
        : interativeDetails[parseInt(id) - 1][2];

      const regexPattern = interativeDetails[parseInt(id) - 1][3];
      const regex = new RegExp(regexPattern);
      txtFail = !regex.test(txtTextInput);

      return (
        <>
          <h1 className="interactiveTitle">
            {interativeDetails[parseInt(id) - 1][0]}
          </h1>
          <TextInput
            invalidTxt={txtFail}
            interactiveId={id}
            instructions={interativeDetails[parseInt(id) - 1][1]}
            defaultVal={txtTextInput}
            showUpload={interativeDetails[parseInt(id) - 1][5]}
          />
        </>
      );
    } else if (txtprocess === "localrun" || idIsSpecial) {
      // data should be already stored in textData or imageData

      if (!idIsSpecial && !textData) {
        return INVALID;
      }

      if (textData && textData.includes(LOCAL_MARKER) && !imageData) {
        return INVALID;
      }

      return (
        <>
          {isModalOpen && (
            <ShareModal url={shareUrl} onClose={handleCloseModal} />
          )}
          {isEditable && !idIsSpecial && (
            <>
              <div className="toolbar">
                <div className="editDiv">
                  <div className="tooltip">
                    <div className="editIcon" onClick={handleEditClick}>
                      ✏️
                    </div>
                    <span className="tooltipText">Edit Text</span>
                  </div>
                  <div className="tooltip">
                    <div className="saveIcon" onClick={handleSaveClick}>
                      💾
                    </div>
                    <span className="tooltipText">Download</span>
                  </div>
                  <div className="tooltip">
                    <div className="shareIcon" onClick={handleShareClick}>
                      📤
                    </div>
                    <span className="tooltipText">Share</span>
                  </div>
                </div>
              </div>
            </>
          )}
          {!idIsSpecial && (
            <>
              <h1 className="interactiveTitle">
                {interativeDetails[parseInt(id) - 1][0]}
              </h1>
              <p className="instructions">
                {interativeDetails[parseInt(id) - 1][4]}
              </p>
            </>
          )}
          {resolveInteractive(id, textData)}
        </>
      );
    }
  }
}

export default Interactive;
