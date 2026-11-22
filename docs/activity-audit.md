# Activity usability audit

The browser audit covers all 36 players and the corresponding 36 archived players. Both versions receive the same activity text and complete the same task wherever their controls allow it. The main comparison uses Chromium at 1260 × 900. Image Reveal also resizes to a phone during play, and separate tests use emulated touch input for Match Drag & Drop and Fishbone. The existing site suite still checks each current activity from its Builder and a direct link at phone width.

## Regressions addressed

| Activity | Comparison and fix | Acceptance check |
| --- | --- | --- |
| Image Reveal | With a 2400 × 1600 fixture at 1260 × 900, the last tile extended to about y=965 on the updated site and y=885 in the archive. The old width calculation ignored the new heading and play panel. The player now fits the board to its actual content width and available height, and resizing preserves reveals. | The last tile fits, can be revealed by keyboard, and stays revealed after a phone resize. |
| Match Drag & Drop | Archived term cards were drag handles across the whole card. Before this fix the updated player worked when grabbing the text, while card padding did not start a drag. The full card now starts a drag and the Select button still works independently. | Drag from card padding with a mouse and with emulated tablet touch. The matching pair disappears and progress increments. |
| Image Pins | The archived Wikimedia thumbnail request returned HTTP 400. The original SVG returned HTTP 200. The updated player uses a bundled copy of that same map for the old thumbnail URL, including links and files that still contain it. The built-in pin positions were aligned to Zambia and Kenya. | Load the real bundled map with external requests blocked, reject a wrong label, and accept the correct label. Display source and licence links. |
| Fishbone Diagram | Both versions had Delete in the right-click dialog. A single branch’s add-label button extended around 6 px above the updated canvas, and the toolbar buttons touched. Selectable branch titles and labels now open the edit/delete dialog, and the toolbar and canvas controls have spacing. | Add, rename and remove a label and remove its branch. Check toolbar spacing, canvas containment and touch editing. |

The bundled [Africa map](https://commons.wikimedia.org/wiki/File:Africa_map.svg) is the unchanged SVG credited to Faigl.ladislav and JCRules, with the current revision by Smasongarrison. It is distributed under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).

## Fixes from the audit

| Area | What changed | Regression coverage |
| --- | --- | --- |
| Phone input and layout | Word Match has a labelled input. Anagram detects answers with no distinct shuffle and wraps tiles. Diamond Nine, Horse Race, Score Chart and Tarsia fit a narrow play area. | Enter a guess with Backspace, solve a repeated-letter and regular anagram, place and edit a Diamond Nine tile, and use race, score and rotation controls at 390 px. |
| Text and answer feedback | Word Complete renders text in React and tracks each gap occurrence separately. Grid Solve and Word Find give retry feedback. | Preserve literal angle brackets and complete two identical gaps. Enter an incorrect answer and retry using the keyboard. |
| Placement and movement | Categorise stores category assignments. Word Banks and Anagram support select-and-place alongside dragging. Order can move items up and down. Geometry and Ordered Line have labelled controls for moving their canvas objects. | Assign duplicate terms independently, resize, move a word between gaps, reorder and submit a group, and move or edit selected canvas objects. |
| Keyboard play | Phrase Memorise, Quiz Board, Left or Right, Connect, Diamond Nine and individual race controls have native keyboard actions. WordSearch has arrow navigation and accepts either endpoint order. | Reveal, select, edit and score using keyboard controls. Find a word starting at its last letter. |
| Media and links | Audio Complete reports loading, playback and recovery. Image Pins starts unplaced labels in a tray and accepts replacement media. Deck of Cards has a separate Open card link control. | Recover from a blocked clip, replace a failed map image, place a tray label and drag a pin, and focus a flashcard link separately from Flip. |
| Timed and recorded activities | Raffle Balls prevents concurrent draws. Multi-Choice can pause and resume the countdown. Gold Run closes its clue at expiry. Time Recorder categories have pressed state and CSV output quotes category names when needed. | Start a raffle three times in one event loop, record one result and reset. Resume a paused quiz, mark a hex wrong and expire, and download the time recorded against a comma-containing category name. |
| Classroom boards | Random Wheel announces the selected item. Building Blocks preserves positions on resize. Kanban and Freyar have Move and Delete controls. Fishbone leaves its toolbar outside the panning area and grows the board when the font grows. | Spin a wheel, resize with a moved block, move and delete cards, and pan to a crowded diagram’s head at a larger font size. |
| Other play flows | Prize Pot updates each bet independently. Image Reveal and Self-Review retain their existing play flows. | Drag separate prize bags, reveal the final tile of a dense portrait grid, and mark, revisit and clear a self-review answer. |

The scenarios are in [activity-regressions.spec.js](../tests/activity-regressions.spec.js). The desktop comparison with the archive remains in [activity-ui.spec.js](../tests/activity-ui.spec.js). Physical classroom iPad testing and checks of YouTube playback and the timer cue on a managed school device are still open.

## Original action list

| Priority | Reproduction | Proposed change and acceptance check |
| --- | --- | --- |
| High | Open Word Match on a touch-only phone. The letters are accepted through a document key listener and the displayed boxes do not bring up a keyboard. | Add a labelled text input with appropriate mobile keyboard settings. Test typed letters, Backspace, and a correct guess using a touch phone viewport. |
| High | Anagram’s shuffle loop requires a different order. For a repeated-only answer such as AA every permutation is the same. This was identified in the player code. | Handle answers with only one possible ordering and cap shuffle attempts. Add a test that opens the exercise and can progress without freezing. |
| High | Enter angle brackets in Word Complete. The player builds its exercise from an HTML string, which can interpret the teacher’s text as markup. This was identified in the player code. | Render passage text and gap fields in React, preserving line breaks and the existing asterisk format. Test literal angle brackets and the complete answer flow. |
| Medium | Categorise moves terms visually over category panels, but neither version attaches a term to a category or offers keyboard placement. | Provide select-and-place alongside drag. Use actual category assignments so items stay with their categories on a resize. |
| Medium | Word Banks and Anagram can be played with desktop drag. Their controls use native HTML drag events. | Add tap/keyboard selection and placement, with the existing mouse drag still available. |
| Medium | Geometry and Ordered Line offer actions that depend on canvas gestures or secondary click. | Add labelled controls for selected shapes or labels and make the same actions available on keyboard and touch. |
| Medium | WordSearch asks for the first and last letter in a particular order. The grid’s cells are click-only. | Accept either endpoint order and provide keyboard movement and selection. Test an ordinary find and a backwards find. |
| Medium | Audio Complete’s transcript and next-question flow work offline with a mocked external source. The YouTube example still depends on the school network and browser playback rules. | Expose playback status and a helpful recovery message. Verify a host video on a school device and keep the existing offline recording tests. |
| Medium | Raffle Balls leaves Select available while the draw runs. The same click starts another physics run. This was identified in the player code. | Disable Select while drawing and re-enable it after reset. Test rapid repeated presses and verify each entry is counted once. |
| Lower | Deck of Cards offers Flip and Next buttons. For a linked card, opening the link still depends on clicking the card surface. | Add a separate, labelled link control. Test keyboard access to both the link and card controls. |
| Lower | Several click targets are plain text or icon-only, including tiles in Connect and Diamond Nine and the pencil and magnifier in Word Find. | Use native buttons or roving focus on boards and give icon controls labels. Test the actual keyboard flow for each game. |
| Lower | Time Recorder exposes the time-category targets as clickable text. | Make each category a labelled control with selected state and add a repeatable CSV check covering an elapsed category. |

Before these fixes, the phone-width browser survey found extra scroll inside Diamond Nine (175 px), Anagram (77 px), Score Chart (50 px), Horse Race (26 px) and Tarsia (13 px) with their built-in examples. Kanban and Fishbone have dedicated horizontal board scrollers. Prioritise fitting Diamond Nine’s choices and Anagram’s letters in the viewport, then check score and race controls stay reachable. The Fishbone survey used four branches and kept the toolbar outside its scroller.

## Per-activity browser coverage

The scenario column describes the action and observed outcome checked in both versions. The original follow-up column preserves the tasks noted during the first comparison. The status of those tasks is summarised above.

| Activity | Browser scenario | Original follow-up |
| --- | --- | --- |
| 1. Phrase Memorise | Reveal a masked word, then reset it. | Add a keyboard action for revealing individual words. |
| 2. Image Reveal | Reveal the final tile of a large image. The updated board also retains progress on resize. | Check a very tall portrait and a dense tile grid on real phones. |
| 3. Match Drag & Drop | Drag a term to its definition and confirm the matched pair disappears. | Verify long-press dragging on classroom iPads. |
| 4. Word Complete | Enter a wrong answer, then correct the gap and move on. | Render plain passage text safely and label the score and remaining gaps. |
| 5. Quiz Board | Reveal a question, then reveal its answer. | Use focusable question tiles and label the team-colour states. |
| 6. Ordered Line | Add a milestone through the dialog and verify the canvas redraws. | Make label movement and layout controls available without precise dragging. |
| 7. Horse Race | Move a selected horse and verify it advances. | Give each lane a labelled move control rather than relying on the emoji. |
| 8. Left or Right | Select the correct spelling and submit it for a score. | Make the answer boxes keyboard-selectable and expose their selected state. |
| 9. Categorise | Add a term and move it to a category with the mouse. | Add category assignments and keyboard placement. |
| 10. Multi-Choice Quiz | Choose an answer and submit the quiz. | Add a repeatable check for one-question-at-a-time navigation and resumed countdown. |
| 11. Timers | Pause and resume. Existing tests also cover completion and the teacher cue. | Verify the completion cue on managed classroom browsers. |
| 12. Random Wheel | Remove an option and verify the wheel redraws. | Announce the selected result as text and test a complete spin. |
| 13. Building Blocks | Add and move a new block. | Keep existing positions when the viewport changes. |
| 14. Score Chart | Add and remove a star from one team. | Give the plus and minus controls names that identify the team. |
| 15. Tarsia Squares Puzzle | Rotate a puzzle square and verify its labels move. | Check long and mathematical tile labels on a phone and add a named Rotate control. |
| 16. Grid Solve | Open a clue and submit a correct answer. | Provide a keyboard entry point and feedback after incorrect guesses. |
| 17. Anagram | Drag a letter to solve a deliberately reversed two-letter answer. | Handle repeated-only answers and add tap and keyboard placement. |
| 18. Word Banks | Drag a word from the bank into its gap. | Add tap-to-select and keyboard placement. |
| 19. Image Pins | Load the map and submit a correct label. The updated test also checks wrong-answer feedback and the bundled image. | Start unplaced labels in a tray. The South Africa label currently starts near northwest Africa and can clip at the left edge on phones. Add checks for dragging a new pin and replacing failed custom media. |
| 20. Deck Of Cards | Flip a card, remove it and see the empty deck state. | Add a separate keyboard-accessible link for linked cards. |
| 21. Word Find | Reveal a letter and submit a whole-word guess. | Label the icon buttons and give feedback on an incorrect guess. |
| 22. Connect | Select four related tiles and confirm they move to the solved area. | Make word tiles operable by keyboard. |
| 23. WordSearch | Find a real placed word by clicking its endpoints. | Add keyboard movement and support the reverse endpoint order. |
| 24. Diamond Nine | Select a side tile and move it into the diamond. | Label edit and placement controls and add keyboard operation. |
| 25. Prize Pot Quiz | Bet on the correct answer, submit and check the fund and next question. | Add a check for splitting a bet by dragging individual bags. |
| 26. Geometry | Move a plotted vertex with a real mouse drag and verify the canvas changes. | Add explicit shape controls for touch and keyboard. |
| 27. Order | Place the first group in order, submit and verify the next group appears. | Add Move up and Move down controls. |
| 28. Self-Review | Type an answer and open its marking points. | Add an end-to-end check of marking, returning to an answer and clearing progress. |
| 29. Time Recorder | Add a category, start the clock and record time against it. | Add keyboard operation and a CSV content check. |
| 30. Word Match | Guess a word with the keyboard and check the score. | Add a real mobile input field. |
| 31. Raffle Balls | Start a draw and verify a result is recorded. | Prevent overlapping draws and verify repeat selection and reset. |
| 32. Audio Complete | Complete a transcript gap and advance to the next clip. | Add real-device coverage for playback restrictions and a visible playback status. |
| 33. Kanban Board | Add a card to a named column. | Add a test for movement between columns, and provide a keyboard Move action. |
| 34. Freyar Diagram | Add an item to a diagram box. | Add a test for moving and deleting items and a keyboard alternative to the bin. |
| 35. Fishbone Diagram | Add, rename and delete a label, then delete its branch. | Check a crowded diagram with long labels and verify panning at large text sizes. |
| 36. Gold Run | Open a hex, reveal its answer and mark it correct. | Add a check for time expiry and an incorrect answer on a phone. |

## Repeat the checks

    npm run check

To run just the activity interaction audit against a built site

    npm run build:site
    npx playwright test tests/activity-ui.spec.js

Playwright opens real pages and uses browser mouse, keyboard and touch events. External media is blocked or served from local fixtures. The audio scenario checks the transcript and navigation. The site suite separately exercises playback of an embedded recording. Timed activities, game rules and device compatibility need additional scenarios for exhaustive coverage.
