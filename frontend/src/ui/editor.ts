import { CommandInterface } from "emulators";
import ace from "ace-builds"
import { FsNode } from "emulators/dist/out/protocol/protocol";

export class Editor{
    editor=ace.edit("editor");
    button_open_file=document.getElementById("editor-open-file") as HTMLButtonElement;
    select_open_file=document.getElementById("editor-open-filelist") as HTMLSelectElement;
    input_filepath=document.getElementById("editor-file-path") as HTMLInputElement;

    button_write_file=document.getElementById("editor-write-file") as HTMLButtonElement;
    constructor(public ci:CommandInterface){
        this.button_open_file.addEventListener(
            "click",
            async ()=>{
                this.select_open_file.disabled=false;
                this.select_open_file.hidden=false;
                const list=await this.listfiles();
                if(list){
                    for(const file of list){
                        const option=document.createElement("option");
                        option.value=file;
                        option.innerText=file;
                        this.select_open_file.appendChild(option);
                    }
                }
            }
        )
        this.select_open_file.addEventListener(
            "change",
            async ()=>{
                const filename=this.select_open_file.value;
                const data=await this.ci.fsReadFile(filename);
                const decoder=new TextDecoder("utf-8");
                const text=decoder.decode(data);
                this.editor.setValue(text);
                this.select_open_file.hidden=true;
                this.input_filepath.value=filename;
            }
        )
        
        this.button_write_file.addEventListener(
            "click",
            async ()=>{
                const filename=this.input_filepath.value;
                const text=this.editor.getValue();
                const encoder=new TextEncoder();
                const data=encoder.encode(text);
                await this.ci.fsWriteFile(filename,data);
            })
    }

    public async listfiles(){
        const root=await this.ci.fsTree();
        const fileList:string[]=[];
        function traverse(node:FsNode[],parent:string=""){
            for(const child of node){
                if(child.nodes===null){
                    fileList.push(parent+"/"+child.name);
                }else{
                    traverse(child.nodes,parent+"/"+child.name);
                }
            }
        }
        if(root.nodes===null){
            return;
        }
        traverse(root.nodes);
        return fileList;
    }
}