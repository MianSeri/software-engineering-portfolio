
function ActionButton({ gameStatus, onFire, onRestart}) {
    if (gameStatus === "playing") {
        return (
                <button className="fire-btn" onClick={onFire}>
                    Fire!
                </button>
        );
    }
    return (
            <button className="restart-btn" onClick={onRestart}>
                Restart?
            </button>
    );  
}

export default ActionButton;