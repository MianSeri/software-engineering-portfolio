// // src/Pokedex.js
// import React from "react";
// import Pokecard from "./Pokecard";

// function Pokedex({ pokemon, exp, isWinner }) {
//   return (
//     <div className="Pokedex">
//       <h1>Pokedex</h1>
//       <h2 className="Pokedex-exp">Total Experience: {exp}</h2>
//       {isWinner && <p className="Pokedex-winner">THIS HAND WINS!</p>}

//       <div className="Pokedex-cards">
//         {pokemon.map((p) => (
//           <Pokecard
//             key={p.id}
//             id={p.id}
//             name={p.name}
//             type={p.type}
//             base_experience={p.base_experience}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// export default Pokedex;

import React from "react";
import Pokecard from "./Pokecard";

function Pokedex({ pokemon, exp, isWinner }) {
  const pokedexClass = isWinner ? "Pokedex Pokedex-winner" : "Pokedex"; // Add winner class if isWinner is true
  const resultClass = isWinner 
    ? "Pokedex-result Pokedex-result--winner"
    : "Pokedex-result";

  return (
    <div className={pokedexClass}>
      <div className="Pokedex-header">
        <span className="Pokedex-title">Hand</span>
        <h2 className="Pokedex-exp">Total EXP: {exp}</h2>
      </div>

      <p className={resultClass}>
        {isWinner ? "Winner" : "Try again"}
      </p>

      <div className="Pokedex-cards">
        {pokemon.map((p) => (
          <Pokecard
            key={p.id}
            id={p.id}
            name={p.name}
            type={p.type}
            base_experience={p.base_experience}
          />
        ))}
      </div>
    </div>
  );
}

export default Pokedex;
