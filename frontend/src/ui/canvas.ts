import { CommandInterface,utils } from "emulators";
import { webGl } from "./webgl";
import Stats from "stats.js"
import { audioNode } from "../audionode";

export class JsdosCanvas {
    canvas_jsdos = document.getElementById("jsdos-canvas") as HTMLCanvasElement
    statsEl = document.getElementById("stats") as HTMLParagraphElement;
    public prevent_canvas_keymouse=false;
    constructor(ci: CommandInterface) {
        const stats = new Stats();
        stats.showPanel(0);
        stats.dom.style.left = "initial";
        stats.dom.style.right = "0px";
        document.body.appendChild(stats.dom);

        const canvas = this.canvas_jsdos;
        canvas.parentElement?.clientWidth
        webGl(canvas, ci, stats)
        audioNode(ci)


        ci.events().onMessage(console.log.bind(console));
        ci

        window.addEventListener("keydown", (e) => {
            if(this.prevent_canvas_keymouse)return;
            let ke = utils.HtmlKeyCode2jsdos(e.code)
            if (ke) {
                ci.sendKeyEvent(ke, true);
                e.stopPropagation();
                e.preventDefault();
            }
        });
        window.addEventListener("keyup", (e) => {
            if(this.prevent_canvas_keymouse)return;
            let ke = utils.HtmlKeyCode2jsdos(e.code)
            if (ke) {
                ci.sendKeyEvent(ke, false);
                e.stopPropagation();
                e.preventDefault();
            }
        });
        canvas.addEventListener("mousemove", (e) => {
            if (!this.prevent_canvas_keymouse) {
                ci.sendMouseMotion(
                    (e.clientX - canvas.offsetLeft) / canvas.width,
                    (e.clientY - canvas.offsetTop) / canvas.height);
                e.stopPropagation();
                e.preventDefault();
            }
        });
        canvas.addEventListener("mousedown", (e) => {
            if (!this.prevent_canvas_keymouse) {
                ci.sendMouseButton(0, true);
                e.stopPropagation();
                e.preventDefault();
            }
        });
        canvas.addEventListener("mouseup", (e) => {
            if (!this.prevent_canvas_keymouse) {
                ci.sendMouseButton(0, false);
                e.stopPropagation();
                e.preventDefault();
            }
        });
        canvas.addEventListener("click", (e) => {
            this.prevent_canvas_keymouse = false
        });
    }
}