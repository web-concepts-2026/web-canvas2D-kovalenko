const canvas = document.querySelector("#paint-canvas");
const size_slider = document.querySelector("#brush-size");
const color_picker = document.querySelector("#brush-color");
const tools = document.querySelector("#tools");
const actions = document.querySelector("#actions");

let tool_selected = "draw-btn";

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

function onErase(x, y) {
    ctx.clearRect(x - ctx.lineWidth, y - ctx.lineWidth, ctx.lineWidth * 2, ctx.lineWidth * 2);
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
                        switch (tool_selected) {
                            case "draw-btn":
                                onDraw(event.offsetX, event.offsetY);
                                break;
                            case "erase-btn":
                                onErase(event.offsetX, event.offsetY);
                                break;
                        }
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

const tool_buttons = document.querySelectorAll(".tool-btn");

const default_button_color = window.getComputedStyle(tool_buttons[0]).backgroundColor;
const active_button_color = "#1c1b1c";
document.querySelector("#draw-btn").style = `background-color: ${active_button_color}`;

tools.addEventListener("click", (e) => {
    const btn = e.target.closest('.tool-btn');

    if (!btn) return;

    const prev_btn = document.querySelector(`#${tool_selected}`);
    if (prev_btn) prev_btn.style = '';

    tool_selected = btn.id;
    btn.style = `background-color: ${active_button_color}`;
})

actions.addEventListener("click", (e) => {
    const btn = e.target.closest('.tool-btn');

    if (!btn) return;

    switch(btn.id) {
        case "undo-btn":
            break;
        case "clear-btn":
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            break;
    }
})
