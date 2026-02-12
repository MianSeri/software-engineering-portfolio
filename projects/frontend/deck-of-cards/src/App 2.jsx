import { useState, useEffect, useRef } from 'react'
import './App.css'
import Toast from './Toast.jsx'

function App() {
  //1. State Variables
  // This will hold the deck ID of our deck of cards
  const [deckId, setDeckId] = useState(null);

  // How many cards are still left in the deck
  const [remaining, setRemaining] = useState(0);

  // This will hold the last card we drew from the deck
  // At the beginning, there is no card, so it's null.
  // const [currentCard, setCurrentCard] = useState(null);
  const [cards, setCards] = useState([]); // All drawn cards
  const currentCard = cards.length > 0 ? cards[cards.length - 1] : null;
  const previousCard = cards.length > 1 ? cards[cards.length - 2] : null;


  // This is true while we are shuffling, so we can disable the shuffle button
  const [isShuffling, setIsShuffling] = useState(false);

  // This can hold an error message if something goes wrong
  const [error, setError] = useState(null);


  // Further Study: useRef to keep track of how many times we've drawn a card
  // Is the app currently drawing cards automatically?
  const [isAutoDrawing, setIsAutoDrawing] = useState(false);

  // This ref will hold the interval ID from setInterval
  // We use a ref so we can remember it without causing re-renders
  const intervalRef = useRef(null);

  const [toastMessage, setToastMessage] = useState("");

  // Further Study: helper to show no cards toast
  function showNoCardsToast() {
    setToastMessage("Error: no cards remaining!");
    setTimeout(() => setToastMessage(""), 3000); // Clear toast after 3 seconds
  }

  //2. useEffect: Run once when the app loads to create a new deck
  // When the component first appears, we ask the Deck of Cards API for a new deck.
    useEffect(() => {
    async function getNewDeck() {
      try{
        setError(null); // clear any old error

        // Ask the API for a new shuffled deck (1 deck)
        const response = await fetch(
          'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'
        );

        const data = await response.json();

        // Save the deck ID so we can use it later to draw cards
        setDeckId(data.deck_id);

        // Save how many cards are remaining (should be 52 at the start)
        setRemaining(data.remaining);
      } catch (err) {
        console.error("Error getting new deck:", err);
        setError("Could not load a new deck. Please try refreshing the page.");
      }
    }
    getNewDeck();
  }, []); // [] means: run only once when the component first mounts

// Further Study: helper to stop auto-drawing if it's running
function stopAutoDraw() {
  setIsAutoDrawing(false);
  
  // If we have an interval running, clear it
  if (intervalRef.current !== null) {
    clearInterval(intervalRef.current);
    intervalRef.current = null; // reset it
    }
  }

  // 3. Function to draw a card
  async function drawCard(){
    // If we don't have a deck ID yet, do nothing
    if(!deckId) return;

    // If no cards are left, show an alert and stop
    // if (remaining === 0) {
    //   alert("Error: no cards remaining!");
    //   return;
    // }

    try {
      setError(null); // clear any old error

      // Ask the API to draw 1 card from our existing deck
      const response = await fetch(
        `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`
      );
      
      const data = await response.json();

      // If the API says success is false, something went wrong
      if (!data.success) {
       showNoCardsToast();
        // Further study: Also stop auto-drawing if it's running
        stopAutoDraw();
        return;
      }

      // The drawn cards are in data.cards (an array)
      const card = data.cards[0];

      // Save this card so we can show it on the screen
      setCards(prevCards => [...prevCards, card]);

      // Update how many cards are left (for the UI)
      setRemaining(data.remaining);

      // Further Study: If the deck is now empty after this draw, alert and stop auto-drawing
      if (data.remaining === 0){
        showNoCardsToast();
        stopAutoDraw();
      }
    } catch (err) {
      console.error("Error drawing a card:", err);
      setError("Something went wrong while drawing a card.");

      // Further Studies: If something breaks while auto-drawing, stop that too
      stopAutoDraw();
    }
  }

  // Further Study: start and stop the interval
  function toggleAutoDraw() {
    // If we are already auto-drawing, then this click should stop it
    if (isAutoDrawing){
      stopAutoDraw();
      return;
    }

    // If we get here, we are not auto-drawing yet, se we want to start
    // Don't start auto-drawing if there is no deck
    if (!deckId) return;

    // Also don't start if the deck is already empty
    if (remaining === 0) {
      showNoCardsToast();
      return;
    }
    setIsAutoDrawing(true);

    // Make an interval that draws one card every 1000ms (1 second)
    intervalRef.current = setInterval(async () => {
      // Call our drawCard function each second
      await drawCard();
    }, 1000);
  }

  // 4. Function to shuffle the deck
  async function shuffleDeck() {
    // If we don't have a deck ID yet, do nothing
    if (!deckId) return;

    // Further Study: If we were auto-drawing, stop it when we shuffle
    stopAutoDraw();

    try {
      setError(null);
      setIsShuffling(true); // turn on "shuffling" state

      // Ask the API to shuffle our existing deck
      const response = await fetch(
        `https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`
      );

      const data = await response.json();

      if (!data.success) {
        setError("Could not shuffle the deck. Please try again.");
        setIsShuffling(false);
        return;
      }

      // Clear the current card from the screen because it's a fresh deck now
      setCards([]); // this clears the pile

      // Update remaining cards (should be back to 52)
      setRemaining(data.remaining);

      setIsShuffling(false); // turn off "shuffling" state
    } catch (err) {
      console.error("Error shuffling the deck:", err);
      setError("Something went wrong while shuffling the deck.");
      setIsShuffling(false);
    }
  }

  // Cleanup interval if the component unmounts
  useEffect(() => {
    return () => {
      // This function runs when the component is unmounting
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
    // 5. JSX: What we show on the screen
    return (
      <div className="app">
        {/* Toast message */}
        <Toast message={toastMessage} />
  
        {/* Title + remaining text */}
        <h1 className="app__title">Deck of Cards</h1>
  
        {/* Show how many cards are left */}
        <p className="app__remaining">Cards remaining: {remaining}</p>
  
        {/* Buttons */}
        <div className="controls">
          {/* Auto-draw toggle button */}
          <button
            className="btn btn--primary"
            onClick={toggleAutoDraw}
            disabled={!deckId || remaining === 0}
          >
            {isAutoDrawing ? "Stop Auto-Draw" : "Start Auto-Draw"}
          </button>
  
          {/* Shuffle Deck button */}
          <button
            className="btn btn--secondary"
            onClick={shuffleDeck}
            disabled={!deckId || isShuffling}
          >
            {isShuffling ? "Shuffling..." : "Shuffle Deck"}
          </button>
        </div>
  
        {/* Show error message if there is one */}
        {error && <p className="app__error">{error}</p>}
  
        {/* Show the cards as a neat stack if we have at least one */}
        {cards.length > 0 && (
  <div className="card-area">
    {/* Top card label */}
    <h2 className="card-area__title">
      {cards[cards.length - 1].value} of {cards[cards.length - 1].suit}
    </h2>

    {/* Layout: previous (small) + current (big) */}
    <div className="card-area__layout">
      {/* Previous card preview */}
      {previousCard && (
        <div className="card-area__previous">
          <p className="card-area__label">Previous</p>
          <div className="card-area__image-wrapper card-area__image-wrapper--small">
            <img
              src={previousCard.image}
              alt={`${previousCard.value} of ${previousCard.suit}`}
              className="card-area__image card-area__image--small"
            />
          </div>
        </div>
      )}

      {/* Current big card */}
      <div className="card-area__current">
        <p className="card-area__label">Current</p>
        <div className="card-area__image-wrapper">
          <img
            src={cards[cards.length - 1].image}
            alt={`${currentCard.value} of ${currentCard.suit}`}
            className="card-area__image"
          />
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    );
  }

  
export default App;
