import { useEffect, useState, useRef } from "react";
import Star from "./Star.jsx";

const STAR_SIZE = 40;

function Space() {
    const [stars, setStars] = useState([]);
    const idRef = useRef(0);

    function createRandomStar() {
        const x = Math.random() * (window.innerWidth - STAR_SIZE);
        const y = Math.random() * (window.innerHeight - STAR_SIZE);

        idRef.current += 1; // this is a little counter to give each star a unique ID

        return {
            id: idRef.current,
            x,
            y,
        };
    }

function addStar() {
    setStars((prevStars) => [...prevStars, createRandomStar()]);
}

function destroyStar(id) {
    setStars((prevStars) => prevStars.filter((star) => star.id !== id));
}

  
useEffect(() => {
    // add one star right away
    addStar();

    // then keep adding stars every 2.5 seconds
    const intervalId = setInterval(addStar, 2500);

    // cleanup when Space is removed
    return () => clearInterval(intervalId);
}, []);

return (
    <div 
        className = "space"
        style = {{
            position: "relative",
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
        }}
    >
        {stars.map((star) => (
            <Star
            key={star.id}
            id ={star.id}
            position = {{x: star.x, y: star.y }}
            onDestroy = {destroyStar}
        />
        ))}
    </div>
  );
}

export default Space;