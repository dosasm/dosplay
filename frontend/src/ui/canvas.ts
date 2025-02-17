import { CommandInterface,utils } from "emulators";
import { webGl } from "./webgl";
import Stats from "stats.js"
import { audioNode } from "./audionode";

class KeyMouseListener{
    keydown=(e:KeyboardEvent) => {
        let ke = utils.htmlKey2jsdos(e.code)
        if (ke && this.ci) {
            this.ci.sendKeyEvent(ke, true);
            e.stopPropagation();
            e.preventDefault();
        }
    }
    keyup = (e:KeyboardEvent) => {
        let ke = utils.htmlKey2jsdos(e.code)
        if (ke && this.ci) {
            this.ci.sendKeyEvent(ke, false);
            e.stopPropagation();
            e.preventDefault();
        }
    }
    constructor(private ci?:CommandInterface){
            
    }
    dispatch(){
        window.addEventListener("keydown",this.keydown)
        window.addEventListener("keyup",this.keyup)
    }
    remove(){
        window.removeEventListener("keydown",this.keydown)
        window.removeEventListener("keyup",this.keyup)
    }
}

export class JsdosCanvas {
    canvas_jsdos = document.getElementById("jsdos-canvas") as HTMLCanvasElement
    statsEl = document.getElementById("stats") as HTMLParagraphElement;
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

        const keyListener=new KeyMouseListener(ci)
            
        canvas.addEventListener("mousemove", (e) => {
            //TODO: if the click patch key event maybe we need to ignore this mouse
            if (true) {
                ci.sendMouseMotion(
                    (e.clientX - canvas.offsetLeft) / canvas.clientWidth,
                    (e.clientY - canvas.offsetTop) / canvas.clientHeight);
                e.stopPropagation();
                e.preventDefault();
            }
        });
        canvas.addEventListener("mousedown", (e) => {
            if (true) {
                ci.sendMouseButton(0, true);
                e.stopPropagation();
                e.preventDefault();
            }
        });
        canvas.addEventListener("mouseup", (e) => {
            if (true) {
                ci.sendMouseButton(0, false);
                e.stopPropagation();
                e.preventDefault();
            }
        });
        window.addEventListener("click", (e:MouseEvent) => {
            if(e.target===canvas){
                keyListener.dispatch()
            }else{
                keyListener.remove()
            }
        });
        canvas.addEventListener("focus", (e) => {
            keyListener.dispatch()
        });
        canvas.addEventListener("blur",()=>{
            keyListener.remove()
        });
    }
}
