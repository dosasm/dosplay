import { Jsdos } from "./ui/jsdos";
import "./index.css"

var jsdos=new Jsdos();
(window as any).jsdos=jsdos;

const urlParams = new URLSearchParams(window.location.search);
const start= urlParams.get('start');
const emu=urlParams.get('emu');
const bundle=urlParams.get('bundle');
if(bundle){
    jsdos.select_bundle.value=bundle;
}
if(emu){
    jsdos.select_emulators.value=emu;
}
if(start){
    jsdos.button_start.click();
}

let content=urlParams.get('content');
const write=urlParams.get('write');
const base64content=urlParams.get('bc');

if(base64content){
    const decoded=atob(base64content);
    content=decoded;
}
if(content && write){
    jsdos.jsdos_editor.editor.setValue(content);
    jsdos.jsdos_editor.filelist.value=write;
    //!!! automatically start the js-dos for convenience
    jsdos.button_start.click();
    setTimeout(() => {
        if(!jsdos.ci)return;
        jsdos.jsdos_editor.writefile.click();
    }, 2000);
}

jsdos.button_start.click();

