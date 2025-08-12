import React, { useState, useEffect } from "react";
import Card from "./components/Card";

const suits = ["hearts", "diamonds", "clubs", "spades"];
const values = [
  "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "J", "Q", "K", "A"
];

function cardValue(card) {
  if (!card) return -1;
  if (card.value === "J") return 11;
  if (card.value === "Q") return 12;
  if (card.value === "K") return 13;
  if (card.value === "A") return 14;
  return parseInt(card.value, 10);
}

function createDeck() {
  const deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  return deck;
}

function shuffle(arr) {
  let a = [...arr];
  for (let i = a.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [playerDeck, setPlayerDeck] = useState([]);
  const [computerDeck, setComputerDeck] = useState([]);
  const [playerCard, setPlayerCard] = useState(null);
  const [computerCard, setComputerCard] = useState(null);

  const [message, setMessage] = useState("Click Play Round to start.");
  const [gameOver, setGameOver] = useState(false);

  // War state
  const [warInProgress, setWarInProgress] = useState(false);
  // warPile now contains cards with owner property
  const [warPile, setWarPile] = useState([]);

  // Log state for last round info
  const [log, setLog] = useState("");

  useEffect(() => {
    startGame();
  }, []);

  function startGame() {
    const deck = shuffle(createDeck());
    setPlayerDeck(deck.slice(0, 26));
    setComputerDeck(deck.slice(26));
    setPlayerCard(null);
    setComputerCard(null);
    setMessage("Game started! Click Play Round.");
    setGameOver(false);
    setWarInProgress(false);
    setWarPile([]);
    setLog("");
  }

  function cardStr(card) {
    return card ? `${card.value} of ${card.suit}` : "None";
  }

  // Count war pile cards owned by each player
  function warPileCount(owner) {
    return warPile.filter(card => card.owner === owner).length;
  }

  function playRound() {
    if (gameOver) return;

    let pDeck = [...playerDeck];
    let cDeck = [...computerDeck];
    let pile = [...warPile];

    // War resolution step
    if (warInProgress) {
      if (pDeck.length < 4 || cDeck.length < 4) {
        if (pDeck.length > cDeck.length) {
          setMessage("🎉 You win the game! 🎉");
        } else if (cDeck.length > pDeck.length) {
          setMessage("💻 Computer wins the game! 💻");
        } else {
          setMessage("It's a draw!");
        }
        setGameOver(true);
        setLog("");
        return;
      }

      const pWarCards = pDeck.splice(0, 4).map(card => ({ ...card, owner: "player" }));
      const cWarCards = cDeck.splice(0, 4).map(card => ({ ...card, owner: "computer" }));
      pile.push(...pWarCards, ...cWarCards);

      const pWarCard = pWarCards[pWarCards.length - 1];
      const cWarCard = cWarCards[cWarCards.length - 1];

      setPlayerCard(pWarCard);
      setComputerCard(cWarCard);

      const pVal = cardValue(pWarCard);
      const cVal = cardValue(cWarCard);

      if (pVal > cVal) {
        // Winner takes all cards in pile (including previous war cards)
        pDeck = [...pDeck, ...pile.map(c => ({ suit: c.suit, value: c.value }))];
        setMessage("🎉 You win the round! 🎉");
        setWarInProgress(false);
        setWarPile([]);
        setLog(`WAR resolved! ${cardStr(pWarCard)} beats ${cardStr(cWarCard)}`);
      } else if (cVal > pVal) {
        cDeck = [...cDeck, ...pile.map(c => ({ suit: c.suit, value: c.value }))];
        setMessage("💻 Computer wins the round! 💻");
        setWarInProgress(false);
        setWarPile([]);
        setLog(`WAR resolved! ${cardStr(cWarCard)} beats ${cardStr(pWarCard)}`);
      } else {
        setMessage("⚔️ WAR continues! ⚔️");
        setWarInProgress(true);
        setWarPile(pile);
        setLog(`WAR continues! Both drew ${cardStr(pWarCard)}`);
      }

      setPlayerDeck(pDeck);
      setComputerDeck(cDeck);

      checkGameOver(pDeck, cDeck);
      return;
    }

    // Normal round step
    if (pDeck.length === 0 || cDeck.length === 0) {
      checkGameOver(pDeck, cDeck);
      return;
    }

    const pCard = pDeck.shift();
    const cCard = cDeck.shift();

    setPlayerCard(pCard);
    setComputerCard(cCard);

    const pVal = cardValue(pCard);
    const cVal = cardValue(cCard);

    if (pVal > cVal) {
      pDeck.push(pCard, cCard);
      setMessage("🎉 You win the round! 🎉");
      setLog(`${cardStr(pCard)} beats ${cardStr(cCard)}`);
    } else if (cVal > pVal) {
      cDeck.push(pCard, cCard);
      setMessage("💻 Computer wins the round! 💻");
      setLog(`${cardStr(cCard)} beats ${cardStr(pCard)}`);
    } else {
      setMessage("⚔️ WAR! ⚔️");
      setWarInProgress(true);
      setWarPile([
        { ...pCard, owner: "player" },
        { ...cCard, owner: "computer" }
      ]);
      setLog(`WAR started with ${cardStr(pCard)} and ${cardStr(cCard)}`);
    }

    setPlayerDeck(pDeck);
    setComputerDeck(cDeck);
    checkGameOver(pDeck, cDeck);
  }

  function checkGameOver(pDeck, cDeck) {
    if (pDeck.length === 52) {
      setMessage("🎉 You win the game! 🎉");
      setGameOver(true);
      setLog("");
    } else if (cDeck.length === 52) {
      setMessage("💻 Computer wins the game! 💻");
      setGameOver(true);
      setLog("");
    } else if (pDeck.length === 0) {
      setMessage("💻 Computer wins the game! 💻");
      setGameOver(true);
      setLog("");
    } else if (cDeck.length === 0) {
      setMessage("🎉 You win the game! 🎉");
      setGameOver(true);
      setLog("");
    }
  }

  // Display count = deck length + war pile cards owned by that player
  const displayPlayerCount = playerDeck.length + warPileCount("player");
  const displayComputerCount = computerDeck.length + warPileCount("computer");

  return (
    <div className="flex flex-col min-h-screen bg-green-700 text-white">
      <main className="flex-grow flex flex-col items-center justify-center p-6 max-w-xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">War Card Game</h1>

        <div className="flex gap-16 mb-8 items-end">
          <div className="flex flex-col items-center">
            <Card
              suit={playerCard?.suit}
              value={playerCard?.value}
              faceDown={!playerCard}
            />
            <p className="mt-2 font-semibold">Player ({displayPlayerCount})</p>
          </div>

          <div className="flex flex-col items-center">
            <Card
              suit={computerCard?.suit}
              value={computerCard?.value}
              faceDown={!computerCard}
            />
            <p className="mt-2 font-semibold">Computer ({displayComputerCount})</p>
          </div>
        </div>

        <p className="text-2xl font-bold mb-2 text-yellow-300">{message}</p>
        {log && (
          <div className="bg-green-800 rounded p-3 mb-6 text-center text-sm font-mono">
            {log}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={playRound}
            disabled={gameOver}
            className="px-6 py-2 bg-yellow-500 rounded hover:bg-yellow-600 disabled:opacity-60"
          >
            Play Round
          </button>

          <button
            onClick={startGame}
            className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Restart Game
          </button>
        </div>
      </main>

      <footer className="text-center text-sm p-4 bg-green-800">
        © 2025 War Card Game — Open Source under the MIT License.
      </footer>
    </div>
  );
}
