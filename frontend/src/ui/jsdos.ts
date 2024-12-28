import { CommandInterface, get_emulators, utils } from "emulators";
import { jsdos } from "../config"
import { JsdosCanvas } from "./canvas";
import { Editor } from "./editor";

export class Jsdos {
    dist = jsdos.dist;
    bundles = jsdos.bundles;
    select_bundle = document.getElementById("jsdosbundle") as HTMLSelectElement
    select_emulators = document.getElementById("emulators") as HTMLSelectElement
    button_start = document.getElementById("start") as HTMLButtonElement
    button_stop = document.getElementById("stop") as HTMLButtonElement
    button_download = document.getElementById("editor-download-bundle") as HTMLButtonElement
    p_status=document.getElementById("stats") as HTMLParagraphElement


    emulators = get_emulators()
    constructor() {
        this.emulators.pathPrefix = this.dist;
        this.button_start.addEventListener("click", async () => {
            this.button_start.disabled = true;
            this.button_stop.disabled = false;
            const bundle = this.select_bundle.value;
            const url = this.bundles + bundle+".jsdos";
            const ci = await this.download_run_bundle(url);
            if (!ci) return
            (window as any).ci=ci;
            const jsdos_canvas=new JsdosCanvas(ci);
            const editor=new Editor(ci);
            editor.editor.container.addEventListener("focus", (e) => {
                jsdos_canvas.prevent_canvas_keymouse = true
            });
            editor.editor.container.addEventListener("click", (e) => {
                jsdos_canvas.prevent_canvas_keymouse = true
            });
            editor.editor.container.addEventListener("blur", (e) => {
                jsdos_canvas.prevent_canvas_keymouse = false
            });

            this.button_stop.addEventListener("click", async () => {
                await ci?.exit();
                this.button_start.disabled = false;
                this.button_stop.disabled = true;
            });

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
                    this.p_status.innerHTML = "Avg sleep p/sec: " + Math.round(avgSleep) +
                        ", avg non skippable sleep p/sec: " + Math.round(avgNonSkippableSleep) +
                        ", cycles p/ms: " + Math.round(avgCycles);
                });
            }, 3000);
        })
    }

    public down_bundle(url: string): Promise<Uint8Array> {
        // we need to download bundle, emulators accept only Uint8Array
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
            xhr.responseType = "arraybuffer";
            xhr.onreadystatechange = async () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(new Uint8Array(xhr.response))
                }
            };
            xhr.send();
        })
    }

    public async get_commands_button(ci: CommandInterface) {
        const nodes = await ci.fsTree();
        if (!nodes) return
        const profile = nodes.nodes?.find(v => v.name == ".jsdos");
        if (!profile) return
        const profile1 = profile.nodes?.find(v => v.name == "button_commands.bat");
        if (!profile1) return
        const data = await ci?.fsReadFile("./.jsdos/button_commands.bat");
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(data);
        const cmds = text.split("@REM").map((val) => {
            val = val.replace(/\r\n/g, "\n")
            const lines = val.split("\n")
            const name = lines[0].trim();
            const cmd = lines.slice(1).join("\n").trim()
            return { name, cmd }
        }).filter(x => x.name && x.cmd);
        const ctrl2 = [];
        for (const { name, cmd } of cmds) {

            const button_cmd = document.createElement("button");
            button_cmd.innerText = name
            const codes = utils.String2jsdosCode(cmd, false, false);
            codes.unshift([257]); // add a enter key to prevent previous program not exit
            button_cmd.addEventListener("click", () => {
                let i = 0;
                const id = setInterval(() => {
                    if (i >= codes.length) {
                        clearInterval(id)
                        setTimeout(() => {
                            ci?.simulateKeyPress(257)
                        }, 1000);
                    }
                    ci?.simulateKeyPress(...codes[i])
                    i++
                }, 100);

            })
            ctrl2.push(button_cmd)

        }
        return ctrl2
    }

    public async download_run_bundle(url: string): Promise<CommandInterface | undefined> {
        const bundle = await this.down_bundle(url);
        let ci: CommandInterface | undefined = undefined;
        switch (this.select_emulators.value) {
            case "dosboxDirect":
                ci = await this.emulators.dosboxDirect(bundle);
                break;
            case "dosboxWorker":
                ci = await this.emulators.dosboxWorker(bundle);
                break;
            case "dosboxXDirect":
                ci = await this.emulators.dosboxXDirect(bundle);
                break;
            case "dosboxXWorker":
                ci = await this.emulators.dosboxXWorker(bundle);
                break;
            default:
                console.error("unknown emulator" + this.select_emulators.value)
                break;
        }
        return ci;
    }
}