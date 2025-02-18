import { CommandInterface } from "emulators";
import { utils } from "emulators"

const keyboard = document.getElementById('keyboard') as HTMLDivElement;
const keyboard_enable = document.getElementById('keyboard-enable') as HTMLInputElement;
const keyboard_press = document.getElementById("keyboard-press") as HTMLButtonElement;

let pressHold = 0;
keyboard_press.addEventListener(
    "click", () => {
        pressHold += 1;
        keyboard_press.innerText = pressHold + " keys to hold"
    }
)
keyboard_enable.addEventListener(
    "input", () => {
        keyboard.hidden = !keyboard_enable.checked
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
        event.preventDefault()
        // 获取触摸点的位置
        const touch = event.touches[0];
        // 根据触摸点的位置和偏移量更新 div 的位置
        keyboard.style.left = (touch.clientX - offsetX) + 'px';
        keyboard.style.top = (touch.clientY - offsetY) + 'px';
    }
},{ passive: false });

// 监听触摸结束事件
document.addEventListener('touchend', function () {
    // 标记拖动结束
    isDragging = false;
});

export function ui_keyboard(_ci: () => CommandInterface | undefined) {

    const buttons = keyboard.getElementsByTagName("button")
    let pressed: { keyCode: number, buttonIdx: number }[] = [];
    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i] as HTMLButtonElement;

        function press(i:number,keyCode:number,pressed:boolean){
            console.log("press",keyCode,"pressed:",pressed)
            const ci = _ci()
            if(ci)
                ci.sendKeyEvent(keyCode, pressed)
            if(pressed){
                buttons[i].style.backgroundColor = 'yellow';
            }else{
                buttons[i].style.backgroundColor = 'white';
            }
        }

        button.addEventListener('click', function () {
            const key = "KBD_" + button.dataset.key;
            if (key in utils.Keys) {
                const dosCode = (utils.Keys as any)[key];
                console.log(key, dosCode)
 
                    if (pressHold === 0 && pressed.length > 0) {
                        button.style.backgroundColor = 'yellow';
                        press(i,dosCode,true)
                        setTimeout(() => {
                            press(i,dosCode,false)
                            button.style.backgroundColor = 'white';
                        }, 200);

                        setTimeout(async () => {
                            for (const p of pressed) {
                                press(p.buttonIdx,p.keyCode, false)
                                await new Promise(resolve=>setTimeout(resolve,100))
                                pressed = []
                                keyboard_press.innerText = "Hold Key Press"
                            }
                        }, 200);
                    } else {
                        button.style.backgroundColor = 'yellow';
                        press(i,dosCode, true)
                        if (pressHold === 0) {
                            press(i,dosCode, false)
                            button.style.backgroundColor = 'white';
                        } else {
                            pressed.push({
                                keyCode: dosCode,
                                buttonIdx: i
                            })
                            pressHold--
                            keyboard_press.innerText = pressHold + " keys to hold"
                        }
                    }
            }
        });
    }

}
