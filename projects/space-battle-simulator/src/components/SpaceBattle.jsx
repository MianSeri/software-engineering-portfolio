import { useState } from 'react';
import HealthDisplay from './HealthDisplay';
import ActionButton from './ActionButton';
import StatusBar from './StatusBar';

function SpaceBattle({minDamage = 5, maxDamage = 20}){
    //1. boxes in React's memory
    const [playerHealth, setPlayerHealth] = useState(100);
    const [enemyHealth, setEnemyHealth] = useState(100);
    const[gameStatus, setGameStatus] = useState("playing"); 
    // "playing", "win", "lose", "draw"

    //2. logic functions
    function getRandomDamage(min, max){
        // Step 1: I'll make a random number between 0 and 1
        const random = Math.random();

        // Step 2: Stretch it to the size of out damage range
        const rangeSize = max - min +1;

        // Step 3: I'll multiply and shift it up by the minimum
        const randomInRange = random * rangeSize + min;

        // Step 4: I'll round down to the nearest whole number
        return Math.floor(randomInRange);
    }

    function handleFire(){
        //how much damage I do
        const playerHit = getRandomDamage(minDamage, maxDamage);
        //how much damage the enemy does
        const enemyHit = getRandomDamage(minDamage, maxDamage);

        //enemy loses "playerHit" health
        const newEnemyHealth = enemyHealth - playerHit;
        //I lose "enemyHit" health
        const newPlayerHealth = playerHealth - enemyHit;

        //update the boxes in React's memory
        setEnemyHealth(newEnemyHealth);
        setPlayerHealth(newPlayerHealth);

        // ---- check for win/lose/draw conditions ----
        if (newPlayerHealth <= 0 && newEnemyHealth <= 0){
            // both died
            setGameStatus("draw");
        } else if (newEnemyHealth <= 0){
            // enemy died first
            setGameStatus("win");
        } else if (newPlayerHealth <= 0){
            // I died first
            setGameStatus("lose");
        }
        // if non of these are true, we leave gameStatus as "playing"
    }

    function handleRestart() {
        setPlayerHealth(100);
        setEnemyHealth(100);
        setGameStatus("playing");
    }

    function getStatusMessage() {
        if (gameStatus === "playing"){
            return "Engage the enemy!";
        }
        if (gameStatus === "win"){
            return "Mission Complete! Your defeated the enemy!";
        }
        if (gameStatus === "lose"){
            return "Mission Failed! Your spacecraft has been defeated!";
        }
        if (gameStatus === "draw"){
            return "Stalemate. Both spacecrafts have been destroyed! It's a draw!";
        }

        return "";
    }




    return (
        <div className="battle-screen">
          <div className="battle-title">Space Battle Simulator</div>
    
          <div className="health player">Player Health: {playerHealth}</div>
    
          <div className="center-button">
            {gameStatus === "playing" ? (
              <button className="fire-btn" onClick={handleFire}>
                Fire!
              </button>
            ) : (
              <button className="restart-btn" onClick={handleRestart}>
                Restart?
              </button>
            )}
          </div>
    
          <div className="health enemy">Enemy Health: {enemyHealth}</div>
    
          <div className="status-bar">{getStatusMessage()}</div>
        </div>
      );
    }

export default SpaceBattle;