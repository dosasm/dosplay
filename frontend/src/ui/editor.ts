import { CommandInterface, utils } from "emulators";
import ace from "ace-builds"
import { FsNode } from "emulators/dist/out/protocol/protocol";
import { download } from "./download";
import { get_commands_button,DosPath } from "./editor-command";
import { sleep } from "../utils";

function sortStrings(strings: string[]): string[] {
    return strings.sort((a, b) => {
        const isAPrefixedWithD = a.startsWith('/D/');
        const isBPrefixedWithD = b.startsWith('/D/');
        const isAPrefixedWithCExample = a.startsWith('/C/example');
        const isBPrefixedWithCExample = b.startsWith('/C/example');

        if (isAPrefixedWithD && !isBPrefixedWithD) {
            return -1;
        } else if (!isAPrefixedWithD && isBPrefixedWithD) {
            return 1;
        } else if (isAPrefixedWithCExample && !isBPrefixedWithCExample) {
            return -1;
        } else if (!isAPrefixedWithCExample && isBPrefixedWithCExample) {
            return 1;
        } else {
            return a.localeCompare(b);
        }
    });
}

export class Editor {
    editor = ace.edit("editor");

    filelist = document.getElementById("editor-filelist") as HTMLSelectElement;
    writefile = document.getElementById("editor-write-file") as HTMLButtonElement;

    button_download_file = document.getElementById("editor-download-file") as HTMLButtonElement;
    button_download_bundle = document.getElementById("bundle-download") as HTMLButtonElement

    div_exec=document.getElementById("editor-exec-commands") as HTMLDivElement;

    public current_file() {
        return this.filelist.value as string;
    }

    private _ci: CommandInterface | undefined
    buttons_command: HTMLButtonElement[] = [];
    public on_ci(ci: CommandInterface){
        this._ci=ci;
        this.list().then(
            async ()=>{
                const r=await get_commands_button(ci,this.filelist)
                if (r) {
                    this.buttons_command.forEach(a=>a.remove())
                    this.buttons_command = r.buttons;
                    for (const cmd of r.buttons) {
                        this.div_exec.append(cmd)
                    }
                }
                this.filelist.dispatchEvent(new Event("input"))
            }
        )
    }
    public get ci() {
        return this._ci
    }

    public async list() {
        if (!this.ci) {
            return
        }
        const files = await this.listfiles(this.ci);
        if (!files) {
            return
        }

        const old = this.filelist.value
        this.filelist.innerHTML = "";
        const eles = [];
        for (const file of files) {
            const option = document.createElement("option");
            option.value = file;
            option.innerText = file;
            if (file === old) {
                option.selected = true
            }
            eles.push(option)
        }
        if(!old){
            eles[0].selected=true
        }
        this.filelist.append(...eles)
    }

    constructor() {
        this.editor.on("change", () => {
            this.writefile.hidden = false;
        });

        this.filelist.addEventListener(
            "click",
            () => { this.list() }
        )
        this.filelist.addEventListener(
            "input",
            async () => {
                const file=this.filelist.value;
                this.buttons_command.forEach((btn) => {
                    const exts=btn.dataset.exts?.split(",") as string[];
                    if(exts.some(ext=>file.includes(ext))){
                        btn.hidden=false
                    }else{
                        btn.hidden=true
                    }
                })
                
                if (!this.ci) {
                    return;
                }
                if (this.writefile.hidden == false) {
                    this.open_file(file, true);
                } else {
                    this.open_file(this.filelist.value);
                }
            }
        )

        this.writefile.addEventListener(
            "click",
            async () => {
                if (!this.ci) {
                    return;
                }
                const filename = this.filelist.value;
                const text = this.editor.getValue();
                const encoder = new TextEncoder();
                const data = encoder.encode(text);
                await this.ci.fsWriteFile(filename, data);
                this.writefile.hidden = true;
            })

        this.button_download_file.addEventListener(
            "click",
            async () => {
                if (!this.ci) {
                    return;
                }
                const filename = this.filelist.value;
                const data = await this.ci.fsReadFile(filename);
                download(data, filename);
            })

        this.button_download_bundle.addEventListener(
            "click",
            async () => {
                if (!this.ci) {
                    return;
                }
                const bundle = await this.ci.persist(false);
                if (!bundle) {
                    return;
                }
                download(bundle, "bundle.jsdos");
            })

        
    }

    public async open_file(filename: string, force = false) {
        if (!this.ci) {
            return;
        }
        if (force == false && this.writefile.hidden === false) {
            return
        }
        await this.list()
        this.filelist.value = filename;
        const data = await this.ci.fsReadFile(filename);

        const decoder = new TextDecoder("utf-8");
        const text = decoder.decode(data);
        this.editor.setValue(text,1);
        this.writefile.hidden = true;

        if (filename.endsWith(".c")) {
            this.editor.getSession().setMode("ace/mode/c_cpp");
        } else if (filename.endsWith(".h")) {
            this.editor.getSession().setMode("ace/mode/c_cpp");
        } else if (filename.endsWith(".asm")) {
            this.editor.getSession().setMode("ace/mode/assembly_x86");
        } else {
            this.editor.getSession().setMode("ace/mode/text");
        }
    }

    public async listfiles(ci: CommandInterface): Promise<string[] | undefined> {
        const root = await ci.fsTree();
        const fileList: string[] = [];
        function traverse(node: FsNode[], parent: string = "") {
            for (const child of node) {
                if (child.nodes === null) {
                    fileList.push(parent + "/" + child.name);
                } else {
                    traverse(child.nodes, parent + "/" + child.name);
                }
            }
        }
        if (root.nodes === null) {
            return;
        }
        traverse(root.nodes);
        return sortStrings(fileList);
    }
}