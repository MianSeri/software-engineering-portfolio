import React from 'react';

const POKE_API = 
"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/"

function Pokecard({id, name, type, base_experience}) {
    const imgSrc = `${POKE_API}${id}.png`;

    return (
        <div className="Pokecard">
            <h2 className="Pokecard-title">{name}</h2>
            <img src={imgSrc} alt={name} />
            <p> Type: {type}</p>
            <p> EXP: {base_experience}</p>
        </div>
    );
}

export default Pokecard;