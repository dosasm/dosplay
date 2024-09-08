import { Terminal } from "@xterm/xterm"
import "./index.css"
import Stats from "stats.js"
import { HtmlKeyCode2jsdos } from "./key/map";
import { CommandInterface, Emulators } from "../jsdos/types/emulators";
import { FsNode } from "../jsdos/types/protocol/protocol";

let global_ci: CommandInterface | undefined = undefined;
let global_editor_focused: boolean = false;
const editorPanel=(document.getElementById("editor") as HTMLTextAreaElement)

declare const emulators: Emulators

emulators.pathPrefix = "jsdos/";

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
        (options.x ? emulators.dosboxXDirect(bundle) : emulators.dosboxDirect(bundle)));

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
    global_ci = ci;

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

    ci.events().onMessage(console.log.bind(console));

    window.addEventListener("keydown", (e) => {
        let ke = HtmlKeyCode2jsdos(e.code)
        if (ke && !global_editor_focused) {
            ci.sendKeyEvent(ke, true);
            e.stopPropagation();
            e.preventDefault();
        }
    });
    window.addEventListener("keyup", (e) => {
        let ke = HtmlKeyCode2jsdos(e.code)
        if (ke && !global_editor_focused) {
            ci.sendKeyEvent(ke, false);
            e.stopPropagation();
            e.preventDefault();
        }
    });
    canvas.addEventListener("mousemove", (e) => {
        if (!global_editor_focused) {
            ci.sendMouseMotion(
                (e.clientX - canvas.offsetLeft) / canvas.width,
                (e.clientY - canvas.offsetTop) / canvas.height);
            e.stopPropagation();
            e.preventDefault();
        }
    });
    canvas.addEventListener("mousedown", (e) => {
        if (!global_editor_focused) {
            ci.sendMouseButton(0, true);
            e.stopPropagation();
            e.preventDefault();
        }
    });
    canvas.addEventListener("mouseup", (e) => {
        if (!global_editor_focused) {
            ci.sendMouseButton(0, false);
            e.stopPropagation();
            e.preventDefault();
        }
    });
}

function downloadBundleAndRun(options: { x: boolean, worker: boolean }) {
    (document.getElementById("controls") as HTMLDivElement).style.display = "none";
    const ele = document.getElementById("jsdosbundle") as HTMLSelectElement;
    const bundleUrl = `jsdos/bundle/${ele.value}.jsdos?timestamp=` + Date.now();

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


document.getElementById("dosboxWorker")?.addEventListener("click", () => downloadBundleAndRun({ worker: true, x: false }))
document.getElementById("dosboxDirect")?.addEventListener("click", () => downloadBundleAndRun({ worker: false, x: false }))
document.getElementById("xWorker")?.addEventListener("click", () => downloadBundleAndRun({ worker: true, x: true }))
document.getElementById("xDirect")?.addEventListener("click", () => downloadBundleAndRun({ worker: false, x: true }))
function renderFileTree(nodes: FsNode[], container: HTMLDivElement | HTMLUListElement, path = "./") {
    const ul = document.createElement('ul');
    nodes && nodes.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.name;
        li.className = item.nodes ? "file" : "folder"; // 简单的类名区分文件和文件夹  

        if (item.nodes && item.nodes.length > 0) {
            const childUl = document.createElement('ul');
            renderFileTree(item.nodes, childUl, path + item.name + "/"); // 递归渲染子文件夹  
            li.appendChild(childUl);
        } else {
            li.addEventListener("click", async function () {
                let text = await global_ci?.fsReadFile(path + item.name)
                if (text) {
                    // 创建一个TextDecoder实例，指定编码为'utf-8'  
                    const decoder = new TextDecoder('utf-8');
                    const t=decoder.decode(text);
                    editorPanel.value=t;
                    (document.getElementById("editor-path") as HTMLInputElement).value = path + item.name
                }
            })
        }
        ul.appendChild(li);
    });

    container.appendChild(ul);
}
async function renderFileTreeHandle() {
    const ele = document.getElementById("filetree") as HTMLDivElement;
    const tree = await global_ci?.fsTree()
    if (ele && tree) {
        ele.innerHTML = ""
        if (tree.nodes)
            renderFileTree(tree.nodes, ele);
    }
}
document.getElementById("filetree")?.addEventListener(
    "click", renderFileTreeHandle
)
setInterval(renderFileTreeHandle, 1000);
// renderFileTreeHandle()



document.getElementById("editor-write")?.addEventListener("click", function () {
    let path = (document.getElementById("editor-path") as HTMLInputElement).value;
    let text = (document.getElementById("editor") as HTMLTextAreaElement).textContent;
    const e = new TextEncoder()
    if (text) {
        global_ci?.fsWriteFile(path, e.encode(text));
        editorPanel.value=`writed`
    }
});

editorPanel.addEventListener("focus", (e) => {
    global_editor_focused = true
});
editorPanel.addEventListener("blur", (e) => {
    global_editor_focused = false
});
