import { Jsdos } from "./ui/jsdos";
import "./index.css"
import { setup_version } from "./ui/bundle";

var jsdos=new Jsdos();
(window as any).jsdos=jsdos;

function searchIndex(want:string,options:HTMLOptionsCollection){
    for (let i = 0; i < options.length; i++) {
        if(options[i].value===want){
            return i
        }
    }}

function select_setup(select:HTMLSelectElement,id:string,urlParams:URLSearchParams,default_value?:string){
    let idx=0;
    let values=[
        urlParams.get(id),
        localStorage.getItem(id),
        default_value
    ]
    for (const value of values){
        if (!value)continue;
        const idx0=searchIndex(value as string,select.options)
        if(idx0 && idx0!==-1){
            idx=idx0;
            break;
        }
    }
    select.selectedIndex=idx;
    select.addEventListener("change",()=>{
        localStorage.setItem(id,select.value);
    })
}

async function setup(){
    const urlParams = new URLSearchParams(window.location.search);
    let start= true;
    if (urlParams.has('start') && urlParams.get('start')==="false") {
        start=false
    }

    select_setup(jsdos.select_bundle,"bundle",urlParams,"MASM-v6.11");
    select_setup(jsdos.select_emulators,"emu",urlParams,"dosboxWorker");
    await setup_version();
    
    if(start){
        setTimeout(() => {
            if (jsdos.select_bundle.value=="disk") return
            jsdos.button_start.click();
        }, 1000);
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
}

jsdos.ready.then(setup)



