import React from "react";

const SUITS = ["H", "D", "C", "S"]; // Hearts, Diamonds, Clubs, Spades
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "0", "J", "Q", "K"];
// NOTE: in Deck of Cards API, "0" = Ten (so 0H is 10 of Hearts)

const IMG_BASE = "https://deckofcardsapi.com/static/img/";

// I will build a full deck of 52 cards with codes like "9H", "AS", "0D", etc.
function buildDeck() {
  const deck = [];
  for (let value of VALUES) {
    for (let suit of SUITS) {
      const code = `${value}${suit}`;
      deck.push({
        code,            // e.g. "9H"
        value,           // e.g. "9"
        suit,            // e.g. "H"
        img: `${IMG_BASE}${code}.png`,
      });
    }
  }
  return deck;
}

const FULL_DECK = buildDeck();

// Blackjack values: A=11, 10/J/Q/K=10, others = number
function getCardPoints(value) {
  if (value === "A") return 11;
  if (value === "K" || value === "Q" || value === "J" || value === "0") return 10;
  return parseInt(value, 10);
}

// Deal two different random cards and compute total
function dealHand() {
  const firstIndex = Math.floor(Math.random() * FULL_DECK.length);
  let secondIndex;
  do {
    secondIndex = Math.floor(Math.random() * FULL_DECK.length);
  } while (secondIndex === firstIndex);

  const card1 = FULL_DECK[firstIndex];
  const card2 = FULL_DECK[secondIndex];

  const total =
    getCardPoints(card1.value) + getCardPoints(card2.value);

  return {
    cards: [card1, card2],
    total,
    isBlackjack: total === 21,
  };
}

// We deal once when the file loads; refresh page to get a new hand
const HAND = dealHand();

function Blackjack() {
  return (
    <div className="Blackjack">
      <h1 className="Blackjack-title">Blackjack</h1>
      <p className="Blackjack-subtitle">
        Two cards are dealt automatically. Refresh to get a new hand.
      </p>

      <div className="Blackjack-cards">
        {HAND.cards.map((card) => (
          <div className="Blackjack-card" key={card.code}>
            <img src={card.img} alt={card.code} />
          </div>
        ))}
      </div>

      <p className="Blackjack-total">Total score: {HAND.total}</p>

      {HAND.isBlackjack && (
        <p className="Blackjack-message">BLACKJACK! 🎉</p>
      )}
    </div>
  );
}

export default Blackjack;
