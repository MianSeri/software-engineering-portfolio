import { useEffect, useRef} from "react"; // we need useEffect and useRef to manage focus

const STAR_SIZE = 40; // size of the star in pixels 

function Star ({ id, position, onDestroy }) {

    const starRef = useRef(null);

    useEffect(() => {
        
        if (starRef.current) {
            starRef.current.focus();
        }
    }, []);

    function handleClick() {
        onDestroy(id);
    }

    return (
        <div
            ref = {starRef}
            tabIndex = "0"
            onClick = {handleClick}
            className = "star"
            style = {{
                position: "absolute",
                left: position.x,
                top: position.y,
                width: STAR_SIZE,
                height: STAR_SIZE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                cursor: "pointer",
                outline: "none",
            }}
        >
            ⭐
        </div>
    );
}

export default Star;