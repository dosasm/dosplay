import { Terminal } from "@xterm/xterm"
import "./index.css"
import Stats from "stats.js"
import { HtmlKeyCode2jsdos, String2jsdosCode } from "./key/map";
import { CommandInterface, Emulators } from "../jsdos/types/emulators";
import { FsNode } from "../jsdos/types/protocol/protocol";
import ace from "ace-builds"

let global_ci: CommandInterface | undefined = undefined;
let global_editor_focused: boolean = false;
const path_ele = document.getElementById("editor-path") as HTMLInputElement

declare const emulators: Emulators
const editor=ace.edit("editor");
(window as any).editor=editor;

//changes
const stats = new Stats();
stats.showPanel(0);
stats.dom.style.left = "initial";
stats.dom.style.right = "0px";
document.body.appendChild(stats.dom);

let runId = 0;
var term = new Terminal();
const ele = document.getElementById('terminal') as HTMLDivElement
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
term.open(ele);

async function runBundle(bundle: Uint8Array, options: { x: boolean, worker: boolean }) {
    const id = runId++;
    const stdout = document.getElementById("stdout") as HTMLPreElement;
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

    return ci
}

function downloadBundleAndRun(options: { x: boolean, worker: boolean }) {
    (document.getElementById("controls") as HTMLDivElement).style.display = "none";
    const ele = document.getElementById("jsdosbundle") as HTMLSelectElement;
    const bundleUrl = emulators.pathPrefix + `/bundle/${ele.value}.jsdos?timestamp=` + Date.now();

    // we need to download bundle, emulators accept only Uint8Array
    const xhr = new XMLHttpRequest();
    xhr.open("GET", bundleUrl, true);
    xhr.overrideMimeType("text/plain; charset=x-user-defined");
    xhr.responseType = "arraybuffer";
    xhr.onreadystatechange = async () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // do not forget to create Uint8Array, 
            // arraybuffer will not work!
            const cipromise = runBundle(new Uint8Array(xhr.response), options);
            let ctrl2 = (document.getElementById("controls-2") as HTMLDivElement);
            ctrl2.hidden = false

            const pause = document.createElement("button");
            pause.innerText = "pause"
            let isPause = true;
            pause.addEventListener("click", () => {
                if (isPause) {
                    global_ci?.pause()
                    pause.innerHTML = "resume"
                } else {
                    global_ci?.resume()
                    pause.innerHTML = "pause"
                }
                isPause = !isPause
            })
            ctrl2.append(pause)

            const ver = document.createElement("button");
            ver.innerText = "Version"
            ver.addEventListener("click", () => {
                const codes = String2jsdosCode("ver");
                for (const c of codes) {
                    global_ci?.simulateKeyPress(...c)
                }
            })
            ctrl2.append(ver)

            const ci = await cipromise;
            (window as any).ci = ci;
            global_ci = ci;

            const nodes=await global_ci.fsTree();
            if(!nodes) return
            const profile=nodes.nodes?.find(v=>v.name==".jsdos");
            if(!profile) return
            const profile1=profile.nodes?.find(v=>v.name=="button_commands.bat");
            if(!profile1) return
            const data = await global_ci?.fsReadFile("./.jsdos/button_commands.bat");

            const decoder = new TextDecoder('utf-8');
            const text = decoder.decode(data);
            const cmds = text.split("@REM").map((val) => {
                val=val.replace(/\r\n/g,"\n")
                const lines = val.split("\n")
                const name = lines[0].trim();
                const cmd = lines.slice(1).join("\n").trim()
                return { name, cmd }
            }).filter(x => x.name && x.cmd);
            for (const { name, cmd } of cmds) {

                const button_cmd = document.createElement("button");
                button_cmd.innerText = name
                const codes = String2jsdosCode(cmd, false, false);
                button_cmd.addEventListener("click", () => {
                    let i = 0;
                    const id = setInterval(() => {
                        if (i >= codes.length) {
                            clearInterval(id)
                            setTimeout(() => {
                                global_ci?.simulateKeyPress(257)
                            }, 1000);
                        }
                        global_ci?.simulateKeyPress(...codes[i])
                        i++
                    }, 100);
                    
                })
                ctrl2.append(button_cmd)

            }
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
                    const t = decoder.decode(text);
                    editor.setValue(t);
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
    let path = path_ele.value;
    let text = editor.getValue();
    if (!text) {
        return
    }
    const e = new TextEncoder()
    if (text) {
        global_ci?.fsWriteFile(path, e.encode(text.replace(/\n/g, '\r\n')));
        editor.setValue(`writed to file ${path}`);
        path_ele.value = ""
    }
});

function download(data: Uint8Array, filename: string) {
    const blob = new Blob([data], { type: 'text/plain' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

document.getElementById("editor-download-file")?.addEventListener(
    "click", async function () {
        if (!path_ele.value) { return }
        const data = await global_ci?.fsReadFile(path_ele.value)
        if (data) {
            download(data, path_ele.value)
        }
    }
)
document.getElementById("editor-download-bundle")?.addEventListener(
    "click", async function () {
        const data = await global_ci?.persist()
        if (data) {
            download(data, "bundle.jsdos")
        }

    }
)

editor.container.addEventListener("focus", (e) => {
    global_editor_focused = true
});
editor.container.addEventListener("click", (e) => {
    global_editor_focused = true
});
editor.container.addEventListener("blur", (e) => {
    global_editor_focused = false
});
canvas.addEventListener("click", (e) => {
    global_editor_focused = false
});

