import { Jsdos } from "./ui/jsdos";
import "./index.css"

const jsdos=new Jsdos();

const urlParams = new URLSearchParams(window.location.search);
const start= urlParams.get('start');
if(start){
    jsdos.button_start.click();
}

