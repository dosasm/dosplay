import { CommandInterface, utils } from "emulators";
import { Actions, Action } from "./editor-command-interface";


export class DosPath {
    full: string;
    base: string;
    root: string;
    dir: string;
    disk: string;
    ext: string;
    name: string;

    constructor(public wasm_path: string) {
        const wasm_segs = wasm_path.split("/");
        this.full = wasm_segs[1] + ":\\" + wasm_segs.slice(2).join("\\");
        this.base = wasm_segs.slice(-1)[0];
        this.ext = this.base.split(".").slice(-1)[0];
        this.name = this.base.replace("." + this.ext, "");
        this.dir = wasm_segs[1] + ":\\" + wasm_segs.slice(2, -1).join("\\");
        this.disk = wasm_segs[1];
        this.root = this.disk + ":\\";
    }

    replaceKeysInString(inputString: string): string {
        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key)) {
                const placeholder = `\\\${${key}}`;
                const regex = new RegExp(placeholder, 'g');
                const value = this[key] as string; 
                inputString = inputString.replace(regex, value);
            }
        }
        return inputString;
    }
}



async function button_cmd_onclick(filelist: HTMLSelectElement,shell:utils.Shell,action:Action[]) {
    let wasm_path = filelist.value;
    let dos_path = new DosPath(wasm_path);
    for (const act of action){
        const a=act.fileext?.some(a=>dos_path.full.endsWith(a));
        const b=act.filematch?.some(a=>dos_path.full.match(new RegExp(a)))
        if (a||b){
            for (const c of act.cmd) {
                const cmd=dos_path.replaceKeysInString(c);
                await shell.exec(cmd,200,100).catch(console.log);
            }
        }
    }
}

export async function get_commands_button(ci: CommandInterface, filelist: HTMLSelectElement,actions:Actions) {
    const shell=new utils.Shell(ci)
    const ctrl2:HTMLButtonElement[] = [];
    for (const [key,value] of Object.entries(actions.actions)) {
        const button_cmd = document.createElement("button");
        button_cmd.innerText = key
        button_cmd.addEventListener("click", async () => {
            ctrl2.forEach(a=>a.disabled=true)
            let acts=value;
            if(!Array.isArray(acts)){
                acts=[acts]
            }
            if(key=="run"){
                acts.push({
                    fileext:["exe","com","bat"],
                    cmd:[
                        "cd ${dir}",
                        "${disk}:",
                        "${base}"
                    ]
                })
            }
            await button_cmd_onclick(filelist,shell,acts)
            ctrl2.forEach(a=>a.disabled=false)
        })
        ctrl2.push(button_cmd)
    }
    return {shell,buttons:ctrl2}
}