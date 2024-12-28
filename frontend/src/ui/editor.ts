import { CommandInterface } from "emulators";
import ace from "ace-builds"
import { FsNode } from "emulators/dist/out/protocol/protocol";

export class Editor{
    editor=ace.edit("editor");
    constructor(public ci:CommandInterface){
        this.listfiles()
        
        
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
        this.editor.setValue(fileList.join("\n"));
    }
}