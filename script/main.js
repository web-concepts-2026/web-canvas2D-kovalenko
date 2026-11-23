const canvas = document.querySelector("#paint-canvas");
const size_slider = document.querySelector("#brush-size");
const color_picker = document.querySelector("#brush-color");

const ctx = canvas.getContext("2d");

const canvas_rect = canvas.getBoundingClientRect();
ctx.canvas.width = canvas_rect.width;
ctx.canvas.height = canvas_rect.height;

ctx.lineWidth = size_slider.value;
ctx.strokeStyle = color_picker.value;
ctx.lineCap = "round";

let lastX = undefined;
let lastY = undefined;

function onDraw(x, y) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke()

    lastX = x;
    lastY = y;
}

function onIdle(x, y) {
    lastX = x;
    lastY = y;
}

const stateMachine = state(onDraw, onIdle)

canvas.addEventListener("mousemove", function (event) {
    stateMachine.next(event)
});
canvas.addEventListener("mousedown", function (event) {
    stateMachine.next(event)
});
canvas.addEventListener("mouseup", function (event) {
    stateMachine.next(event)
});
window.addEventListener("mouseup", function (event) {
    stateMachine.next(event)
});
canvas.addEventListener("pointerleave", function (event) {
    stateMachine.next(event)
})

function state(onDraw, onIdle) {
    const STATE = {
        IDLE: "idle",
        DRAW: "draw",
    }

    let currentState = STATE.IDLE;

    return {
        next: (event) => {
            switch(event.type) {
                case "mousemove":
                    if (currentState === STATE.IDLE) {
                        onIdle(event.offsetX, event.offsetY);
                    } else if (currentState === STATE.DRAW) {
                        onDraw(event.offsetX, event.offsetY);
                    }
                    break;
                case "mouseup":
                    if (currentState === STATE.DRAW) {
                        currentState = STATE.IDLE;
                    }
                    break;
                case "mousedown":
                    if (currentState === STATE.IDLE) {
                        currentState = STATE.DRAW;
                    }
                    break;
                case "pointerleave":
                    if (currentState === STATE.DRAW) {
                        currentState = STATE.IDLE;
                    }
                    break;
            }
        }
    }
}

size_slider.addEventListener("change", () => {
    ctx.lineWidth = size_slider.value;
})

color_picker.addEventListener("change", () => {
    ctx.strokeStyle = color_picker.value;
})
