import React from "react";

export default function Card({ suit, value, faceDown }) {
  const getCardImage = () => {
    if (faceDown) return "/card-back.png"; // make sure this file is in your public folder
    let valCode = value === "10" ? "0" : value;
    const suitCode = suit ? suit[0].toUpperCase() : "";
    return `https://deckofcardsapi.com/static/img/${valCode}${suitCode}.png`;
  };

  return (
    <div className="w-24 h-36 shadow-lg rounded-md overflow-hidden transform transition-transform duration-300 hover:scale-105">
      <img
        src={getCardImage()}
        alt={faceDown ? "Card back" : `${value} of ${suit}`}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
