import { CommandInterface, utils } from "emulators";


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
        this.disk = wasm_segs[1];
    }
}

const DEFAULT_CMD={
    name: "batch",
    cmd: ["main.bat"],
    autocd: true,
    supported_ext: ["bat"],
    fallback: ""
}

async function button_cmd_onclick(filelist: HTMLSelectElement,ci:CommandInterface,c:typeof DEFAULT_CMD) {
    let wasm_path = filelist.value;
    let _cmd = structuredClone(c.cmd)

    let supported = false;
    const supported_ext = c.supported_ext
    if (supported_ext.length > 0) {
        supported = supported_ext.some(v => wasm_path.endsWith(v))
    }

    let dospath = new DosPath(wasm_path)
    if (supported) {
        _cmd = _cmd.map(a => a.replace(/main/g, dospath.barename))
    } else if (c.fallback) {
        wasm_path = c.fallback
        dospath = new DosPath(wasm_path)
    } else {
        return
    }

    if (c.autocd) {
        _cmd.unshift("cd " + dospath.dirname, dospath.disk + ":")
    }

    let stdout = "";
    ci.events().onStdout((data) => { stdout += data.toLowerCase() });

    for (const c of _cmd) {
        const codes = utils.string2jsdosKey(c, false, false);
        for (const code of codes) {
            ci?.simulateKeyPress(...code);
            await new Promise(resolve => setTimeout(resolve, 60));
        }
        ci?.simulateKeyPress(257);
        let now_stdout = "";
        const no_stdout_command = ["cd"];
        const is_disk_switch = c.match(/[A-Za-z]:/);
        const no_stdout = no_stdout_command.some(v => c.startsWith(v)) || is_disk_switch;
        if (!no_stdout) {
            await new Promise(resolve => {
                const interval = setInterval(() => {
                    if (now_stdout === "" && stdout.includes(c.toLowerCase())) {
                        now_stdout = stdout;
                    }
                    if (now_stdout !== "" && now_stdout !== stdout) {
                        clearInterval(interval);
                        resolve(undefined);
                    }
                }, 100);
            });
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

export async function get_commands_button(ci: CommandInterface, filelist: HTMLSelectElement) {
    const nodes = await ci.fsTree();
    if (!nodes) return
    const profile = nodes.nodes?.find(v => v.name == ".jsdos");
    if (!profile) return
    const profile1 = profile.nodes?.find(v => v.name == "button_commands.bat");
    if (!profile1) return
    const data = await ci?.fsReadFile("./.jsdos/button_commands.bat");
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);

    const cmds = [DEFAULT_CMD];

    for (let line of text.split("\n")) {
        const l = line.trim();
        let magic = false;
        if (l.startsWith("@REM cmd:")) {
            const segs = l.split(";").map(seg => seg.split(":").map(a => a.trim()))
            const cd = segs.find(s => s[0] === "cd")
            const ext = segs.find(s => s[0] === "ext")
            const fallback = segs.find(s => s[0] === "fallback")
            cmds.push({
                name: segs[0][1],
                cmd: [],
                autocd: cd ? cd[1] !== "false" : true,
                supported_ext: ext ? ext[1].split(",") : [],
                fallback: fallback ? fallback[1] : ""
            })
            magic = true;
        }
        if (!l.startsWith("@REM") && magic === false) {
            cmds[cmds.length - 1].cmd.push(l)
        }
    }

    const ctrl2:HTMLButtonElement[] = [];
    for (const c of cmds) {

        const button_cmd = document.createElement("button");
        button_cmd.innerText = c.name
        button_cmd.dataset.exts = c.supported_ext.join(",")

        ctrl2.push(button_cmd)
    }

    for (const idx in ctrl2){
        ctrl2[idx].addEventListener("click", async () => {
            ctrl2.forEach(a=>a.disabled=true)
            await button_cmd_onclick(filelist,ci,cmds[idx])
            ctrl2.forEach(a=>a.disabled=false)
        })
    }
    return ctrl2
}