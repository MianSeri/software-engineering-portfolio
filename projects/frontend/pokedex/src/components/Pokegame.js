import React from 'react';
import Pokedex from './Pokedex';

const POKEMON = [
    {id: 4, name: 'Charmander', type: 'fire', base_experience: 62},
  {id: 7, name: 'Squirtle', type: 'water', base_experience: 63},
  {id: 11, name: 'Metapod', type: 'bug', base_experience: 72},
  {id: 12, name: 'Butterfree', type: 'flying', base_experience: 178},
  {id: 25, name: 'Pikachu', type: 'electric', base_experience: 112},
  {id: 39, name: 'Jigglypuff', type: 'normal', base_experience: 95},
  {id: 94, name: 'Gengar', type: 'poison', base_experience: 225},
  {id: 133, name: 'Eevee', type: 'normal', base_experience: 65}
];

function Pokegame (){
    // starting with an empty hand1 and a full copy in hand2
    let hand1 = [];
    let hand2 = [...POKEMON];

    // I move random Pokemon from hand2 to hand1 until they are equal
    while (hand1.length < hand2.length){
        const randIdx = Math.floor(Math.random() * hand2.length);
        const randPokemon = hand2.splice(randIdx, 1)[0];
        hand1.push(randPokemon);
    }

    const exp1 = hand1.reduce((total, pokemon) => total + pokemon.base_experience, 0);
    const exp2 = hand2.reduce((total, pokemon) => total + pokemon.base_experience, 0);

    return (
        <div className="Pokegame">
            <h1>Pokegame!</h1>
            <div className="Pokegame-hands">
            <Pokedex pokemon={hand1} exp={exp1} isWinner={exp1 > exp2} />
            <Pokedex pokemon={hand2} exp={exp2} isWinner={exp2 > exp1} />
            </div>
        </div>
    );
}

export default Pokegame;