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

// 标记是否正在拖动
let isDragging = false;
// 记录手指按下时相对于 div 左上角的偏移量
let offsetX = 0;
let offsetY = 0;

// 监听触摸开始事件
keyboard.addEventListener('touchstart', function (event) {
    // 标记开始拖动
    isDragging = true;
    // 获取触摸点的位置
    const touch = event.touches[0];
    // 计算手指相对于 div 左上角的偏移量
    offsetX = touch.clientX - keyboard.offsetLeft;
    offsetY = touch.clientY - keyboard.offsetTop;
});

// 监听触摸移动事件
document.addEventListener('touchmove', function (event) {
    if (isDragging) {
        // 阻止默认的滚动行为
        event.stopPropagation();
        // 获取触摸点的位置
        const touch = event.touches[0];
        // 根据触摸点的位置和偏移量更新 div 的位置
        keyboard.style.left = (touch.clientX - offsetX) + 'px';
        keyboard.style.top = (touch.clientY - offsetY) + 'px';
    }
});

// 监听触摸结束事件
document.addEventListener('touchend', function () {
    // 标记拖动结束
    isDragging = false;
});

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
