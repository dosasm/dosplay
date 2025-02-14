import { CommandInterface } from "emulators";
import ace from "ace-builds"
import { FsNode } from "emulators/dist/out/protocol/protocol";
import { download } from "./download";

export class Editor{
    editor=ace.edit("editor");
    button_open_file=document.getElementById("editor-open-file") as HTMLButtonElement;
    select_open_file=document.getElementById("editor-open-filelist") as HTMLSelectElement;
    input_filepath=document.getElementById("editor-file-path") as HTMLInputElement;

    button_write_file=document.getElementById("editor-write-file") as HTMLButtonElement;
    button_download_file=document.getElementById("editor-download-file") as HTMLButtonElement;
    button_download_bundle = document.getElementById("editor-download-bundle") as HTMLButtonElement
    
    constructor(public ci:CommandInterface|undefined){
        this.button_open_file.addEventListener(
            "click",
            async ()=>{
                if(!this.ci){
                    return;
                }
                this.select_open_file.disabled=false;
                this.select_open_file.hidden=false;
                this.select_open_file.innerHTML="";
                const list=await this.listfiles(this.ci);
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
                if(!this.ci){
                    return;
                }
                const filename=this.select_open_file.value;
                this.open_file(filename,true);
            }
        )
        
        this.button_write_file.addEventListener(
            "click",
            async ()=>{
                if(!this.ci){
                    return;
                }
                const filename=this.input_filepath.value;
                const text=this.editor.getValue();
                const encoder=new TextEncoder();
                const data=encoder.encode(text);
                await this.ci.fsWriteFile(filename,data);
            })

        this.button_download_file.addEventListener(
            "click",
            async ()=>{
                if(!this.ci){
                    return;
                }
                const filename=this.input_filepath.value;
                const data=await this.ci.fsReadFile(filename);
                download(data,filename);
            })

        this.button_download_bundle.addEventListener(
            "click",
            async ()=>{
                if(!this.ci){
                    return;
                }
                const bundle=await this.ci.persist(false);
                if(!bundle){
                    return;
                }
                download(bundle,"bundle.jsdos");
            })
    }

    public async open_file(filename:string,force=false){
        if(!this.ci){
            return;
        }
        if(force==false && this.input_filepath.value){
            return
        }
        this.input_filepath.value=filename;
        const data=await this.ci.fsReadFile(filename);
        
        const decoder=new TextDecoder("utf-8");
        const text=decoder.decode(data);
        this.editor.setValue(text);
        if(filename.endsWith(".c")){
            this.editor.getSession().setMode("ace/mode/c_cpp");
        }else if(filename.endsWith(".h")){
            this.editor.getSession().setMode("ace/mode/c_cpp");
        }else if(filename.endsWith(".asm")){
            this.editor.getSession().setMode("ace/mode/assembly_x86");
        }else{
            this.editor.getSession().setMode("ace/mode/text");
        }
        this.select_open_file.hidden=true;
        this.input_filepath.value=filename;
    }

    public async listfiles(ci:CommandInterface):Promise<string[]|undefined>{
        const root=await ci.fsTree();
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