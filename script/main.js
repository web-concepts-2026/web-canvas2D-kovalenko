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

function onStamp(x, y) {
    const path = new Path2D("M256,0C114.843,0,0,114.843,0,256c0,141.157,114.843,256,256,256s256-114.843,256-256C512,114.843,397.157,0,256,0z M256,493.037C125.296,493.037,18.963,386.704,18.963,256C18.963,125.296,125.296,18.963,256,18.963S493.037,125.296,493.037,256 C493.037,386.704,386.704,493.037,256,493.037z M417.185,246.474H284.444h-37.926h-37.926H94.815c-5.236,0-9.482,4.267-9.482,9.505 c0,94.106,76.56,170.677,170.667,170.677s170.667-76.576,170.667-170.683C426.667,250.736,422.421,246.474,417.185,246.474z M256,265.436h18.963v47.407H256V265.436z M218.074,265.436h18.963v47.407h-18.963V265.436z M256,407.659 c-80.463,0-146.495-64-151.412-142.222h94.523v56.934c0,5.236,4.245,9.436,9.482,9.436h37.926h37.926 c5.236,0,9.481-4.2,9.481-9.436v-56.934h113.486C402.495,343.659,336.463,407.659,256,407.659z M170.667,113.778c-5.236,0-9.482,4.246-9.482,9.482v56.889c0,5.236,4.245,9.482,9.482,9.482s9.481-4.245,9.481-9.482 v-56.889C180.148,118.023,175.903,113.778,170.667,113.778z M322.37,113.778c-5.236,0-9.481,4.246-9.481,9.482v56.889c0,5.236,4.245,9.482,9.481,9.482s9.482-4.245,9.482-9.482 v-56.889C331.852,118.023,327.607,113.778,322.37,113.778z");

    const width = ctx.lineWidth;

    ctx.translate(x, y);
    ctx.scale(ctx.lineWidth / 100, ctx.lineWidth / 100);
    ctx.lineWidth = 10;
    
    ctx.stroke(path);

    ctx.lineWidth = width;
    ctx.scale(100 / ctx.lineWidth, 100 / ctx.lineWidth);
    ctx.translate(-x, -y);
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

function state() {
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
                    if (tool_selected == "stamp-btn") {
                        onStamp(event.offsetX, event.offsetY)
                    }
                    else if (currentState === STATE.IDLE) {
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
