/// key code in jsdos https://github.com/caiiiycuk/emulators/ at src/keys.ts
/// key code in html https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/code
const maps: [string, number, string | undefined, string | undefined, string | undefined][] = [
    //keyname in jsdos, keycode in jsdos, keycode in html
    ["KBD_NONE", 0, undefined, undefined, undefined],
    ["KBD_0", 48, "Digit0", "0", undefined],
    ["KBD_1", 49, "Digit1", "1", undefined],
    ["KBD_2", 50, "Digit2", "2", undefined],
    ["KBD_3", 51, "Digit3", "3", undefined],
    ["KBD_4", 52, "Digit4", "4", undefined],
    ["KBD_5", 53, "Digit5", "5", undefined],
    ["KBD_6", 54, "Digit6", "6", undefined],
    ["KBD_7", 55, "Digit7", "7", undefined],
    ["KBD_8", 56, "Digit8", "8", undefined],
    ["KBD_9", 57, "Digit9", "9", undefined],
    ["KBD_a", 65, "KeyA", "a", "A"],
    ["KBD_b", 66, "KeyB", "b", "B"],
    ["KBD_c", 67, "KeyC", "c", "C"],
    ["KBD_d", 68, "KeyD", "d", "D"],
    ["KBD_e", 69, "KeyE", "e", "E"],
    ["KBD_f", 70, "KeyF", "f", "F"],
    ["KBD_g", 71, "KeyG", "g", "G"],
    ["KBD_h", 72, "KeyH", "h", "H"],
    ["KBD_i", 73, "KeyI", "i", "I"],
    ["KBD_j", 74, "KeyJ", "j", "J"],
    ["KBD_k", 75, "KeyK", "k", "K"],
    ["KBD_l", 76, "KeyL", "l", "L"],
    ["KBD_m", 77, "KeyM", "m", "M"],
    ["KBD_n", 78, "KeyN", "n", "N"],
    ["KBD_o", 79, "KeyO", "o", "O"],
    ["KBD_p", 80, "KeyP", "p", "P"],
    ["KBD_q", 81, "KeyQ", "q", "Q"],
    ["KBD_r", 82, "KeyR", "r", "R"],
    ["KBD_s", 83, "KeyS", "s", "S"],
    ["KBD_t", 84, "KeyT", "t", "T"],
    ["KBD_u", 85, "KeyU", "u", "U"],
    ["KBD_v", 86, "KeyV", "v", "V"],
    ["KBD_w", 87, "KeyW", "w", "W"],
    ["KBD_x", 88, "KeyX", "x", "X"],
    ["KBD_y", 89, "KeyY", "y", "Y"],
    ["KBD_z", 90, "KeyZ", "z", "Z"],
    // Function keys  
    ["KBD_f1", 290, "F1", undefined, undefined],
    ["KBD_f2", 291, "F2", undefined, undefined],
    ["KBD_f3", 292, "F3", undefined, undefined],
    ["KBD_f4", 293, "F4", undefined, undefined],
    ["KBD_f5", 294, "F5", undefined, undefined],
    ["KBD_f6", 295, "F6", undefined, undefined],
    ["KBD_f7", 296, "F7", undefined, undefined],
    ["KBD_f8", 297, "F8", undefined, undefined],
    ["KBD_f9", 298, "F9", undefined, undefined],
    ["KBD_f10", 299, "F10", undefined, undefined],
    ["KBD_f11", 300, "F11", undefined, undefined],
    ["KBD_f12", 301, "F12", undefined, undefined],

    /* Now the weirder keys */

    ["KBD_esc", 256, "Escape", undefined, undefined],
    ["KBD_tab", 258, "Tab", undefined, undefined],
    ["KBD_backspace", 259, "Backspace", undefined, undefined],
    ["KBD_enter", 257, "Enter", "\n", undefined],
    ["KBD_space", 32, "Space", " ", undefined],
    ["KBD_leftalt", 342, "AltLeft", undefined, undefined],
    ["KBD_rightalt", 346, "AltRight", undefined, undefined],
    ["KBD_leftctrl", 341, "ControlLeft", undefined, undefined],
    ["KBD_rightctrl", 345, "ControlRight", undefined, undefined],
    ["KBD_leftshift", 340, "ShiftLeft", undefined, undefined],
    ["KBD_rightshift", 344, "ShiftRight", undefined, undefined],
    ["KBD_capslock", 280, "CapsLock", undefined, undefined],
    ["KBD_scrolllock", 281, "ScrollLock", undefined, undefined],
    ["KBD_numlock", 282, "NumLock", undefined, undefined],
    ["KBD_grave", 96, "Backquote", undefined, undefined], // 通常用于 `~ 符号  
    ["KBD_minus", 45, "Minus", "-", undefined],
    ["KBD_equals", 61, "Equal", "=", undefined],
    ["KBD_backslash", 92, "Backslash", "\\", undefined],
    ["KBD_leftbracket", 91, "BracketLeft", undefined, undefined],
    ["KBD_rightbracket", 93, "BracketRight", undefined, undefined],
    ["KBD_semicolon", 59, "Semicolon", ";", ":"],
    ["KBD_quote", 39, "Quote", undefined, undefined],
    ["KBD_period", 46, "Period", ".", undefined],
    ["KBD_comma", 44, "Comma", ",", undefined],
    ["KBD_slash", 47, "Slash", "/", undefined],
    ["KBD_printscreen", 283, "PrintScreen", undefined, undefined],
    ["KBD_pause", 284, "Pause", undefined, undefined],
    ["KBD_insert", 260, "Insert", undefined, undefined],
    ["KBD_home", 268, "Home", undefined, undefined],
    ["KBD_pageup", 266, "PageUp", undefined, undefined],
    ["KBD_delete", 261, "Delete", undefined, undefined], // 注意：这里可能是 "Backspace" 如果是退格键，但根据上下文这里应该是删除键  
    ["KBD_end", 269, "End", undefined, undefined],
    ["KBD_pagedown", 267, "PageDown", undefined, undefined],
    ["KBD_left", 263, "ArrowLeft", undefined, undefined],
    ["KBD_up", 265, "ArrowUp", undefined, undefined],
    ["KBD_down", 264, "ArrowDown", undefined, undefined],
    ["KBD_right", 262, "ArrowRight", undefined, undefined],
    ["KBD_extra_lt_gt", 348, undefined, undefined, undefined], // ???

    // Numeric keypad  
    ["KBD_kp0", 320, "Numpad0", undefined, undefined],
    ["KBD_kp1", 321, "Numpad1", undefined, undefined],
    ["KBD_kp2", 322, "Numpad2", undefined, undefined],
    ["KBD_kp3", 323, "Numpad3", undefined, undefined],
    ["KBD_kp4", 324, "Numpad4", undefined, undefined],
    ["KBD_kp5", 325, "Numpad5", undefined, undefined],
    ["KBD_kp6", 326, "Numpad6", undefined, undefined],
    ["KBD_kp7", 327, "Numpad7", undefined, undefined],
    ["KBD_kp8", 328, "Numpad8", undefined, undefined],
    ["KBD_kp9", 329, "Numpad9", undefined, undefined],

    ["KBD_kpperiod", 330, "NumpadDecimal", ".", undefined],
    ["KBD_kpdivide", 331, "NumpadDivide", "/", undefined],
    ["KBD_kpmultiply", 332, "NumpadMultiply", "*", undefined],
    ["KBD_kpminus", 333, "NumpadSubtract", "-", undefined],
    ["KBD_kpplus", 334, "NumpadPlus", "+", undefined],
    ["KBD_kpenter", 335, "NumpadEnter", undefined, undefined],
]


export function HtmlKeyCode2jsdos(press: string): number | undefined {
    for (const m of maps) {
        if (m[2] == press) {
            return m[1]
        }
    }
    return undefined
}

function charCode2jsdosCode(code: number): number[] {
    for (const m of maps) {
        if (m[3]?.charCodeAt(0) == code) {
            return [m[1]]
        }
        if (m[4]?.charCodeAt(0) == code) {
            return [340, m[1]]
        }
    }
    return []
}

export function String2jsdosCode(command: string, caseSensitive = false, appendEnter = true): number[][] {
    const output = [];
    let isShifted = false;
    for (let i = 0; i < command.length; i++) {
        const code = command.charCodeAt(i)
        const jsdos = charCode2jsdosCode(code)
        output.push(jsdos)
    }
    if (appendEnter) {
        output.push([257])
    }
    console.log(output)
    return output
}