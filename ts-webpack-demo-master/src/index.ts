import { Terminal } from "@xterm/xterm"
import "./index.css"
import Stats from "stats.js"



declare const emulators: any

emulators.pathPrefix = "/dist/";

//changes
const stats = new Stats();
stats.showPanel(0);
stats.dom.style.left = "initial";
stats.dom.style.right = "0px";
document.body.appendChild(stats.dom);

let runId = 0;
var term = new Terminal();
const ele = document.getElementById('terminal') as HTMLDivElement
term.open(ele);

async function runBundle(bundle: Uint8Array, options: { x: boolean, worker: boolean }) {
    const id = runId++;
    const stdout = document.getElementById("stdout") as HTMLPreElement;
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl");
    const statsEl = document.getElementById("stats") as HTMLParagraphElement;

    // promise is resolved when emulator is started
    const ci = await (options.worker ?
        (options.x ? emulators.dosboxXWorker(bundle) : emulators.dosboxWorker(bundle)) :
        (options.x ? emulators.dosboxXDirect(bundle) : emulators.dosDirect(bundle)));

    let intervalStartedAt = Date.now();
    let prevNonSkippableSleepCount = 0;
    let prevSleepCount = 0;
    let prevCycles = 0;
    setInterval(() => {
        ci.asyncifyStats().then((stats: any) => {
            const dt = Date.now() - intervalStartedAt;
            const nonSkippableSleep = stats.nonSkippableSleepCount - prevNonSkippableSleepCount;
            const avgSleep = (stats.sleepCount - prevSleepCount) * 1000 / dt;
            const avgNonSkippableSleep = (stats.nonSkippableSleepCount - prevNonSkippableSleepCount) * 1000 / dt;
            const avgCycles = (stats.cycles - prevCycles) / dt;
            intervalStartedAt = Date.now();
            prevNonSkippableSleepCount = stats.nonSkippableSleepCount;
            prevSleepCount = stats.sleepCount;
            prevCycles = stats.cycles;
            statsEl.innerHTML = "Avg sleep p/sec: " + Math.round(avgSleep) +
                ", avg non skippable sleep p/sec: " + Math.round(avgNonSkippableSleep) +
                ", cycles p/ms: " + Math.round(avgCycles);
        });
    }, 3000);

    (window as any).ci = ci;

    //@ts-ignore
    webGl({
        canvas,
        addOnResize: () => { },
    }, ci, stats);
    //@ts-ignore
    audioNode(ci);

    ci.events().onStdout((message: string) => {
        // stdout.innerHTML += message;
        term.write(message)
    });

    // ci.events().onMessage(console.log.bind(console));

    function getKeyCode(code: number) {
        switch (code) {
            case 13: return 257;
            case 38: return 265;
            case 39: return 262;
            case 37: return 263;
            case 40: return 264;
            case 17: return 342;
            case 190: return 46;
            default: return code;
        }
    }

    window.addEventListener("keydown", (e) => {
        ci.sendKeyEvent(getKeyCode(e.keyCode), true);
        e.stopPropagation();
        e.preventDefault();
    });
    window.addEventListener("keyup", (e) => {
        ci.sendKeyEvent(getKeyCode(e.keyCode), false);
        e.stopPropagation();
        e.preventDefault();
    });
    canvas.addEventListener("mousemove", (e) => {
        ci.sendMouseMotion(
            (e.clientX - canvas.offsetLeft) / canvas.width,
            (e.clientY - canvas.offsetTop) / canvas.height);
        e.stopPropagation();
        e.preventDefault();
    });
    canvas.addEventListener("mousedown", (e) => {
        ci.sendMouseButton(0, true);
        e.stopPropagation();
        e.preventDefault();
    });
    canvas.addEventListener("mouseup", (e) => {
        ci.sendMouseButton(0, false);
        e.stopPropagation();
        e.preventDefault();
    });
}

function downloadBundleAndRun(options: { x: boolean, worker: boolean }) {
    (document.getElementById("controls") as HTMLDivElement).style.display = "none";
    const bundleUrl = "/dist/test/helloworld.jsdos?timestamp=" + Date.now();

    // we need to download bundle, emulators accept only Uint8Array
    const xhr = new XMLHttpRequest();
    xhr.open("GET", bundleUrl, true);
    xhr.overrideMimeType("text/plain; charset=x-user-defined");
    xhr.responseType = "arraybuffer";
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // do not forget to create Uint8Array, 
            // arraybuffer will not work!
            runBundle(new Uint8Array(xhr.response), options);
        }
    };
    xhr.send();
};


document.getElementById("dosboxWorker")?.addEventListener("click",()=>downloadBundleAndRun({worker: true, x: false}))
document.getElementById("dosboxDirect")?.addEventListener("click",()=>downloadBundleAndRun({worker: false, x: false}))
document.getElementById("xWorker")?.addEventListener("click",()=>downloadBundleAndRun({worker: true, x: true}))
document.getElementById("xDirect")?.addEventListener("click",()=>downloadBundleAndRun({worker: false, x: true}))