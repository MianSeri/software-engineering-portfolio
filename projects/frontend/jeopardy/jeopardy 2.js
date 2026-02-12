// GLOBAL DATA STRUCTURES

// How many categories across
const NUM_CATEGORIES = 6;

// How many questions per category
const NUM_QUESTIONS_PER_CAT = 5;

// Base URL for the API
const API_BASE = "https://rithm-jeopardy.herokuapp.com/api";


// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

// HELPER TO SHUFFLE THE CARDS
// Usind Fisher-Yates Shuffle code to randomize an array because it modifies the original array without creating a new one.
function shuffle(array){
    for (let i = array.length - 1; i > 0; i--){
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids, like: [4, 12, 23, 5, 9, 20]
 */

// Here add the async-await code to link with API and get the category Ids
async function getCategoryIds() {
    //1. I ask the API: "please give me 100 categories"
    const response = await axios.get(`${API_BASE}/categories?count=100`);
    const allCategories = response.data; // this gets me the array of {id, title, clues_count}

    //2. I shuffle the array of 100 categories to randomize them
    shuffle(allCategories);

    //3. I pick the first NUM_CATEGORIES ids from the shuffled array
    const ids = allCategories.slice(0, NUM_CATEGORIES).map(c => c.id);
            //using .slice method to create a copy of the array from index 0 (and extract but not include) to NUM_CATEGORIES
            //using .map method to create a new array with only the ids of the categories
    return ids;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    //1. I ask the API for one specific category by id plus it's clues
    const res = await axios.get(`${API_BASE}/category?id=${catId}`);
    const catData = res.data; // this gets me the object with {id, title, clues}

    //2. I take all the clues and shuffle them
    let clues = catData.clues; //clues is an array or string containing all the clues for that category
    shuffle(clues);

    //3. I pick only the first NUM_QUESTIONS_PER_CAT clues
    let pickedClue = clues.slice(0, NUM_QUESTIONS_PER_CAT);
            //using .slice method to extract a portion of the clues and returning a new one
            //start at index 0 (inclusive) so the slice begins from the very first element 
            //ends at NUM_QUESTIONS_PER_CAT so the slice stops before that index (exclusive)

    //4. I format the clues to have only the question, answer and showing properties
    const clueArray = pickedClue.map(c => ({
        question: c.question,
        answer: c.answer,
        showing: null
    }));
            //using .map method ti iterate over each clue in pickedClue array
            //for each clue c, I create a new object with only the question, answer and showing properties

    return{
        title: catData.title,
        clues: clueArray
    }
            //returning an object with the title of the category and the formatted clues array
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

// The instructions is using JQuery language - #jeopardy/<thead>/<tbody>... //

async function fillTable() {
    const $board = $("#jeopardy"); // Grab the table
    $board.empty(); // Clear any existing content

    // Build the header row <thead> with category titles
    const $thead = $("<thead>");
    const $headerRow = $("<tr>");

    for (let cat of categories) {
        const $th = $("<th>").text(cat.title); 
        $headerRow.append($th);
    }
        //For each category in the categories array, I create a new <th> element with cat.title

    $thead.append($headerRow);
    $board.append($thead);

    // Build body (<tbody>) with question cells ("?")
    const $tbody = $("<tbody>");

    // It needs NUM_QUESTIONS_PER_CAT rows so 5 rows (one per clue index)
    for (let clueIdx = 0; clueIdx < NUM_QUESTIONS_PER_CAT; clueIdx++) {
        const $tr = $("<tr>");

        //6 cells in each row (one cell per category)
        for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++){
            const $td = $("<td>")
            .text("?") //put "?" inside each cell
            .attr("data-cat-idx", catIdx) 
            .attr("data-clue-idx", clueIdx);
                // Add data-cat-idx and data-clue-idx attributes so the cell "remembers" where in categories array its clue lives
            $tr.append($td);
        }
        $tbody.append($tr);
    }
    $board.append($tbody);
}
            //So every td knows: they belong to category 0...5 and clue 0...4 in that category


/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

// this instruction also calls for JQuery language .showing doesn't exist in DOM /
// the idea is that when clicking on a cell: flip the "?" to the question, then to the answer, then ignore further clicks //

function handleClick() {
    //find which cell was clicked with $(evt.target)
    const $cell = $(this); // Get the cell that was clicked

    //ignore clicks on header cells
    // if ($cell.is("th")) return;

    //find which category and which clue the cell represents
    const catIdx = $cell.data("cat-idx");
    const clueIdx = $cell.data("clue-idx");

    //safety check
    if (catIdx === undefined || clueIdx === undefined) return;

    //find the matching clue in categories array
    const clue = categories[catIdx].clues[clueIdx];

    //if null, first time: show question
    if (clue.showing === null) {
        $cell.text(clue.question);
        clue.showing = "question";
        $cell.removeClass().addClass("showing-question"); //added this to activate the "question" and "answer" classes for showing question 
    }

    //if showing is "question", second time: show answer
    else if (clue.showing === "question") {
        $cell.text(clue.answer);
        clue.showing = "answer";
        $cell.removeClass().addClass("showing-answer"); //activates the "question" and "answer" classes
    }

    //if showing is "answer", do nothing
    else {
        return;
    }         
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $("#jeopardy").empty();
    $("#spinner").show();
    $("#start").text("Loading...");
    $("#start").prop("disabled", true);
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $("#spinner").hide();
    $("#start").text("Restart!");
    $("#start").prop("disabled", false);
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    showLoadingView(); //show loading spinner

    //1. Get random category Ids
    const catIds = await getCategoryIds(); //call getCategoryIds to get array of category ids

    //2. For each id, get the full category data + clues
    categories = [];
    for (let id of catIds) {
        const cat = await getCategory(id); //call getCategory to get full category data
        categories.push(cat); //push the category data into categories array
    }

    //3. Build the HTML table
    await fillTable(); //call fillTable to draw everything on the page

    hideLoadingView(); //hide loading spinner and update button
}

/** On click of start / restart button, set up game. */

// TODO
$(async function() {
    //when user clicks start/restart button, set up game
    $("#start").on("click", setupAndStart);

/** On page load, add event handler for clicking clues */

// TODO
    //when user clicks on a clue cell, flip "?" - to question - to answer
    $("#jeopardy").on("click", "td", handleClick);
});