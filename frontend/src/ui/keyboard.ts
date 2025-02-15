import { CommandInterface } from "emulators";
import { Keys } from "./keys-map"

const keyboard = document.getElementById('keyboard') as HTMLDivElement;
const keyboard_enable=document.getElementById('keyboard-enable') as HTMLInputElement;
const keyboard_press=document.getElementById("keyboard-press") as HTMLButtonElement;

let pressMode=false;
keyboard_press.addEventListener(
    "click",()=>{
        pressMode=!pressMode;
        if(pressMode){
            keyboard_press.style.backgroundColor="gray"
        }else{
            keyboard_press.style.backgroundColor="white"

        }
    }
)
keyboard_enable.addEventListener(
    "input",()=>{
        keyboard.hidden=!keyboard_enable.checked
    }
)

export function ui_keyboard(_ci:()=>CommandInterface|undefined){

    const buttons=keyboard.getElementsByTagName("button")
    for (let i=0;i<buttons.length;i++){
        const button=buttons[i] as HTMLButtonElement;

        let pressed=false;
        button.addEventListener('click', function () {
            const key = "KBD_"+button.dataset.key;
            const ci=_ci()
            if (key in Keys) {
                const dosCode=(Keys as any)[key];
                console.log(key,dosCode,"left")
                if(ci && pressMode==false){
                    button.style.backgroundColor = 'yellow';
                    ci.sendKeyEvent(dosCode,true)
                    setTimeout(() => {
                        button.style.backgroundColor = 'white';
                        ci.sendKeyEvent(dosCode,false)
                    }, 100); 
                }
                if(ci && pressMode==true){
                    pressed=!pressed;
                    ci.sendKeyEvent(dosCode,pressed)
                }
            }
        });
    }
    
}
