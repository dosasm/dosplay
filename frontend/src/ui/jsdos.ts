
import { CommandInterface, getEmulators, utils } from "emulators";
import { jsdos } from "../config"
import { JsdosCanvas } from "./canvas";
import { Editor } from "./editor";
import * as cache from "./bundle-cache";
import {ui_bundle} from "./bundle"
import {diskBundle} from "./jsdos-disk";
import { ui_keyboard } from './keyboard';

class DosPath {
    full: string
    filename: string
    dirname: string
    disk: string
    extname: string
    barename: string
    constructor(wasm_path: string) {
        const wasm_segs = wasm_path.split("/")
        this.full = wasm_segs[1] + ":\\" + wasm_segs.slice(2).join("\\")
        this.filename = wasm_segs.slice(-1)[0]
        this.extname = this.filename.split(".").slice(-1)[0]
        this.barename = this.filename.replace("." + this.extname, "")
        this.dirname = wasm_segs[1] + ":\\" + wasm_segs.slice(2, -1).join("\\")
        this.disk= wasm_segs[1];
    }
}


export function ui_log(msg:string){
    const p_status = document.getElementById("stats") as HTMLParagraphElement
    p_status.innerText=msg;
}

const default_bundles_info = {
    "version": "1.0",
    "homepage": "https://github.com/dosasm/dosplay",
    "build_time": 1739588886709,
    "bundles": [
        {
            name:"MASM-v6.11",
            hash:"",
        }
    ]
}


export class Jsdos {
    dist = jsdos.dist;
    bundles = jsdos.bundles;
    bundles_info=default_bundles_info;
    select_bundle = document.getElementById("jsdosbundle") as HTMLSelectElement
    select_emulators = document.getElementById("emulators") as HTMLSelectElement
    button_start = document.getElementById("start") as HTMLButtonElement
    button_stop = document.getElementById("stop") as HTMLButtonElement
    


    emulators = getEmulators(undefined)
    jsdos_editor = new Editor();
    jsdos_canvas?: JsdosCanvas;
    ci?: CommandInterface;
    buttons_command: HTMLButtonElement[] = [];

    ready:Promise<void|undefined>
    _ready_ci_resolve=(a:any)=>{undefined}
    ready_ci=new Promise(resolve=>this._ready_ci_resolve=resolve)

    _stdout:string[]=[]
    public get stdout(){
        return this._stdout.join("")
    }

    on_ci=[
        (ci:CommandInterface)=>{ci.events().onStdout(data=>this._stdout.push(data))},
        (ci:CommandInterface)=>{this.jsdos_editor.ci = ci;},
        this._ready_ci_resolve
    ]


    record_stdout=true

    constructor() {
        let _ci=()=>this.ci;
        ui_bundle(_ci)
        ui_keyboard(_ci)
        this.ready=fetch(this.bundles + "info.json").then(async (res) => {
            this.bundles_info = await res.json()
            this.select_bundle.innerHTML = "";
            const option = document.createElement("option");
            option.value = "disk";
            option.innerText = "disk";
            this.select_bundle.append(option)
            for (const bundle of this.bundles_info.bundles) {
                const option = document.createElement("option");
                option.value = bundle.name;
                option.innerText = bundle.name;
                this.select_bundle.append(option)
            }

            const build_time=new Date(this.bundles_info.build_time)
            function formatDateFromObject(date:Date) {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const hour = date.getHours();
                const minute = date.getMinutes();
                return `${year}/${month}/${day} ${hour}:${minute}`;
            }
            ui_log("loaded bundles from "+formatDateFromObject(build_time))
            console.log("wierd this zero?",build_time.getDay()) //? why zero?
        })
        this.emulators.pathPrefix = this.dist;

        this.jsdos_editor.editor.container.addEventListener("focus", (e) => {
            if (this.jsdos_canvas) {
                this.jsdos_canvas.prevent_canvas_keymouse = true;
            }
        });
        this.jsdos_editor.editor.container.addEventListener("click", (e) => {
            if (this.jsdos_canvas) {
                this.jsdos_canvas.prevent_canvas_keymouse = true;
            }
        });
        this.jsdos_editor.editor.container.addEventListener("blur", (e) => {
            if (this.jsdos_canvas) {
                this.jsdos_canvas.prevent_canvas_keymouse = false;
            }
        });

        this.jsdos_editor.filelist.addEventListener("input",()=>{
            const file=this.jsdos_editor.filelist.value;
            this.buttons_command.forEach((btn) => {
                const exts=btn.dataset.exts?.split(",") as string[];
                if(exts.some(ext=>file.includes(ext))){
                    btn.hidden=false
                }else{
                    btn.hidden=true
                }
            })
        })
        this.button_start.addEventListener("click", async () => {
            const bundle = this.select_bundle.value;
            const ci = await this.download_run_bundle(bundle);
            if (!ci) return
            this.button_start.disabled = true;
            this.button_stop.disabled = false;
            this.ci = ci;
            this.on_ci.forEach(call=>call(ci))

            this.jsdos_canvas = new JsdosCanvas(ci);
            this.buttons_command.forEach((btn) => {
                btn.remove();
            })


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
                    const msg = "Avg sleep p/sec: " + Math.round(avgSleep) +
                        ", avg non skippable sleep p/sec: " + Math.round(avgNonSkippableSleep) +
                        ", cycles p/ms: " + Math.round(avgCycles);
                    ui_log(msg)
                });
            }, 3000);

            ci.events().onExit(() => {
                this.button_start.disabled = false;
                this.button_stop.disabled = true;
                ui_log("stopped: click start to run")
            });

            const commands = await this.get_commands_button(ci)
            if (commands) {
                this.buttons_command = commands;
                for (const cmd of commands) {
                    (this.button_stop.parentElement as HTMLDivElement).append(cmd)
                }
            }
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

    public async get_bundle(bundlename: string): Promise<Uint8Array | undefined> {
        const version=document.getElementById("bundle-version") as HTMLSelectElement
        
        if(version.value=="original"){
            if(bundlename=="disk" && diskBundle.valid){
                await diskBundle.openFile();
                return diskBundle.uint8Array;
            }else{
                const finded=this.bundles_info.bundles.find(b=>b.name===bundlename);
                if(finded){
                    const id=finded.hash
                    const existed = await cache.existsBundle(id);
                    if (existed) {
                        ui_log("get bundle from cache "+id)
                        const res = await cache.getBundle(id);
                        if (res)
                            return res as Uint8Array;
                    }
                    const url=this.bundles + bundlename + ".jsdos";
                    ui_log("download "+url)
                    const bundle = await this.down_bundle(url);
                    await cache.cacheBundle(id, bundle);
                    return bundle;
                }
            }
        }else{
            const bundle=await cache.getBundle(version.value);
            if (bundle)
                return bundle;
        }
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

        const cmds = [{ 
            name: "batch",
            cmd: ["main.bat"],
            autocd:true, 
            supported_ext: ["bat"],
            fallback:""
        }];

        for (let line of text.split("\n")) {
            const l = line.trim();
            let magic=false;
            if (l.startsWith("@REM cmd:")) {
                const segs=l.split(";").map(seg=>seg.split(":").map(a=>a.trim()))
                const cd=segs.find(s=>s[0]==="cd")
                const ext=segs.find(s=>s[0]==="ext")
                const fallback=segs.find(s=>s[0]==="fallback")
                cmds.push({
                    name: segs[0][1],
                    cmd: [],
                    autocd:cd ? cd[1]!=="false":true,
                    supported_ext:ext?ext[1].split(","):[],
                    fallback:fallback?fallback[1]:""
                })
                magic=true;
            }
            if (!l.startsWith("@REM") && magic===false) {
                cmds[cmds.length - 1].cmd.push(l)
            }
        }

        const ctrl2 = [];
        for (const c of cmds) {

            const button_cmd = document.createElement("button");
            button_cmd.innerText = c.name
            button_cmd.dataset.exts=c.supported_ext.join(",")

            button_cmd.addEventListener("click", async () => {
                let wasm_path = this.jsdos_editor.filelist.value;
                let _cmd = structuredClone(c.cmd)

                let supported=false;
                const supported_ext = c.supported_ext
                if (supported_ext.length>0) {
                    supported=supported_ext.some(v => wasm_path.endsWith(v))
                }

                let dospath = new DosPath(wasm_path)
                if (supported) {
                    _cmd = _cmd.map(a=>a.replace(/main/g, dospath.barename))
                } else if(c.fallback) {
                    wasm_path = c.fallback
                    dospath = new DosPath(wasm_path)
                }else{
                    return
                }

                if(c.autocd){
                    _cmd.unshift("cd " + dospath.dirname, dospath.disk + ":")
                }

                let stdout = "";
                ci.events().onStdout((data) => {stdout += data.toLowerCase()});

                for (const c of _cmd) {
                    const codes = utils.string2jsdosKey(c, false, false);
                    for (const code of codes) {
                        ci?.simulateKeyPress(...code);
                        await new Promise(resolve => setTimeout(resolve, 60));
                    }
                    ci?.simulateKeyPress(257);
                    let now_stdout="";
                    const no_stdout_command=["cd"];
                    const is_disk_switch=c.match(/[A-Za-z]:/);
                    const no_stdout=no_stdout_command.some(v=>c.startsWith(v)) || is_disk_switch;
                    if (!no_stdout) {
                        await new Promise(resolve => {
                            const interval = setInterval(() => {
                                if (now_stdout==="" && stdout.includes(c.toLowerCase())) {
                                    now_stdout = stdout;
                                }
                                if (now_stdout!=="" && now_stdout !== stdout) {
                                    clearInterval(interval);
                                    resolve(undefined);
                                }
                            }, 100);
                        });
                    }
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            })
            ctrl2.push(button_cmd)

        }
        return ctrl2
    }

    public async download_run_bundle(bundlename: string): Promise<CommandInterface | undefined> {
        const bundle = await this.get_bundle(bundlename);
        if (!bundle) return;
        let ci: CommandInterface | undefined = undefined;
        ui_log("starting emulator")
        switch (this.select_emulators.value) {
            case "dosboxDirect":
                ci = await this.emulators.dosboxDirect(bundle);
                break;
            case "dosboxWorker":
                ci = await this.emulators.dosboxWorker(bundle);
                break;
            case "xDirect":
                ci = await this.emulators.dosboxXDirect(bundle);
                break;
            case "xWorker":
                ci = await this.emulators.dosboxXWorker(bundle);
                break;
            default:
                ui_log("unknown emulator" + this.select_emulators.value)
                break;
        }
        return ci;
    }
}