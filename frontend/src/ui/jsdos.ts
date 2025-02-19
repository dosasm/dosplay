
import { CommandInterface, getEmulators, utils } from "emulators";
import { jsdos } from "../config"
import { set_canvas_ci } from "./canvas";
import { Editor } from "./editor";
import * as cache from "./bundle-cache";
import { ui_bundle } from "./bundle"
import { diskBundle } from "./jsdos-disk";
import { ui_keyboard } from './keyboard';
import { BundleInfo } from "./editor-command-interface";



export function ui_log(msg: string) {
    const p_status = document.getElementById("stats") as HTMLParagraphElement
    p_status.innerText = msg;
}


export class Jsdos {
    dist = jsdos.dist;
    bundles = jsdos.bundles;
    bundles_info: BundleInfo | undefined;
    select_bundle = document.getElementById("jsdosbundle") as HTMLSelectElement
    select_emulators = document.getElementById("emulators") as HTMLSelectElement
    button_start = document.getElementById("start") as HTMLButtonElement
    button_stop = document.getElementById("stop") as HTMLButtonElement

    emulators = getEmulators(undefined)
    jsdos_editor = new Editor();
    ci?: CommandInterface;

    ready: Promise<void | undefined>
    _ready_ci_resolve = (a: any) => { undefined }
    ready_ci = new Promise(resolve => this._ready_ci_resolve = resolve)

    _stdout: string[] = []
    public get stdout() {
        return this._stdout.join("")
    }

    on_ci = [
        (ci: CommandInterface) => {
            this._stdout = []
            ci.events().onMessage((type, ...args) => { console.log(type, args) })
            ci.events().onStdout(data => this._stdout.push(data))
        },
        (ci: CommandInterface) => { 
            const b=this.bundles_info?.bundles.find(a=>a.name===this.select_bundle.value);
            this.jsdos_editor.on_ci(ci,b?.dosplay) 
        },
        this._ready_ci_resolve,
        set_canvas_ci
    ]


    record_stdout = true

    constructor() {
        let _ci = () => this.ci;
        ui_bundle(_ci)
        ui_keyboard(_ci)
        this.ready = fetch(this.bundles + "info.json").then(async (res) => {
            this.bundles_info = await res.json()
            this.select_bundle.innerHTML = "";
            const option = document.createElement("option");
            option.value = "disk";
            option.innerText = "disk";
            this.select_bundle.append(option)
            if (this.bundles_info) {
                for (const bundle of this.bundles_info.bundles) {
                    const option = document.createElement("option");
                    option.value = bundle.name;
                    option.innerText = bundle.name;
                    this.select_bundle.append(option)
                }

                const build_time = new Date(this.bundles_info.build_time)
                function formatDateFromObject(date: Date) {
                    const year = date.getFullYear();
                    const month = date.getMonth() + 1;
                    const day = date.getDate();
                    const hour = date.getHours();
                    const minute = date.getMinutes();
                    return `${year}/${month}/${day} ${hour}:${minute}`;
                }
                ui_log("loaded bundles from " + formatDateFromObject(build_time))
                console.log("wierd this zero?", build_time.getDay()) //? why zero?
            }

        })
        this.emulators.pathPrefix = this.dist;

        this.button_start.addEventListener("click", async () => {
            const bundle = this.select_bundle.value;
            const ci = await this.download_run_bundle(bundle);
            if (!ci) return
            this.button_start.disabled = true;
            this.button_stop.disabled = false;
            this.ci = ci;
            this.on_ci.forEach(call => call(ci))

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
                    const msg = "Avg sleep p/sec: " + Math.round(avgSleep);
                    ui_log(msg)
                });
            }, 3000);

            ci.events().onExit(() => {
                this.button_start.disabled = false;
                this.button_stop.disabled = true;
                ui_log("stopped: click start to run")
            });
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
        const version = document.getElementById("bundle-version") as HTMLSelectElement

        if (version.value == "original") {
            if (bundlename == "disk" && diskBundle.valid) {
                await diskBundle.openFile();
                return diskBundle.uint8Array;
            } else if (this.bundles_info) {
                const finded = this.bundles_info.bundles.find(b => b.name === bundlename);
                if (finded) {
                    const id = finded.hash
                    const existed = await cache.existsBundle(id);
                    if (existed) {
                        ui_log("get bundle from cache " + id)
                        const res = await cache.getBundle(id);
                        if (res)
                            return res as Uint8Array;
                    }
                    const url = this.bundles + finded.filepath;
                    ui_log("download " + url)
                    const bundle = await this.down_bundle(url);
                    await cache.cacheBundle(id, bundle);
                    return bundle;
                }
            }
        } else {
            const bundle = await cache.getBundle(version.value);
            if (bundle)
                return bundle;
        }
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