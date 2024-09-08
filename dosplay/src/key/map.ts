/// key code in jsdos https://github.com/caiiiycuk/emulators/ at src/keys.ts
/// key code in html https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/code
const maps:[string,number,string|undefined][] = [
    //keyname in jsdos, keycode in jsdos, keycode in html
    ["KBD_NONE", 0, undefined],
    ["KBD_0", 48, "Digit0"],
    ["KBD_1", 49, "Digit1"],
    ["KBD_2", 50, "Digit2"],
    ["KBD_3", 51, "Digit3"],
    ["KBD_4", 52, "Digit4"],
    ["KBD_5", 53, "Digit5"],
    ["KBD_6", 54, "Digit6"],
    ["KBD_7", 55, "Digit7"],
    ["KBD_8", 56, "Digit8"],
    ["KBD_9", 57, "Digit9"],
    ["KBD_a", 65, "KeyA"],
    ["KBD_b", 66, "KeyB"],
    ["KBD_c", 67, "KeyC"],
    ["KBD_d", 68, "KeyD"],
    ["KBD_e", 69, "KeyE"],
    ["KBD_f", 70, "KeyF"],
    ["KBD_g", 71, "KeyG"],
    ["KBD_h", 72, "KeyH"],
    ["KBD_i", 73, "KeyI"],
    ["KBD_j", 74, "KeyJ"],
    ["KBD_k", 75, "KeyK"],
    ["KBD_l", 76, "KeyL"],
    ["KBD_m", 77, "KeyM"],
    ["KBD_n", 78, "KeyN"],
    ["KBD_o", 79, "KeyO"],
    ["KBD_p", 80, "KeyP"],
    ["KBD_q", 81, "KeyQ"],
    ["KBD_r", 82, "KeyR"],
    ["KBD_s", 83, "KeyS"],
    ["KBD_t", 84, "KeyT"],
    ["KBD_u", 85, "KeyU"],
    ["KBD_v", 86, "KeyV"],
    ["KBD_w", 87, "KeyW"],
    ["KBD_x", 88, "KeyX"],
    ["KBD_y", 89, "KeyY"],
    ["KBD_z", 90, "KeyZ"],
    // Function keys  
    ["KBD_f1", 290, "F1"],
    ["KBD_f2", 291, "F2"],
    ["KBD_f3", 292, "F3"],
    ["KBD_f4", 293, "F4"],
    ["KBD_f5", 294, "F5"],
    ["KBD_f6", 295, "F6"],
    ["KBD_f7", 296, "F7"],
    ["KBD_f8", 297, "F8"],
    ["KBD_f9", 298, "F9"],
    ["KBD_f10", 299, "F10"],
    ["KBD_f11", 300, "F11"],
    ["KBD_f12", 301, "F12"],

    /* Now the weirder keys */
    // Numeric keypad  
    ["KBD_kp0", 320, "Numpad0"],
    ["KBD_kp1", 321, "Numpad1"],
    ["KBD_kp2", 322, "Numpad2"],
    ["KBD_kp3", 323, "Numpad3"],
    ["KBD_kp4", 324, "Numpad4"],
    ["KBD_kp5", 325, "Numpad5"],
    ["KBD_kp6", 326, "Numpad6"],
    ["KBD_kp7", 327, "Numpad7"],
    ["KBD_kp8", 328, "Numpad8"],
    ["KBD_kp9", 329, "Numpad9"],

    ["KBD_kpperiod", 330, "NumpadDecimal"],
    ["KBD_kpdivide", 331, "NumpadDivide"],
    ["KBD_kpmultiply", 332, "NumpadMultiply"],
    ["KBD_kpminus", 333, "NumpadSubtract"],
    ["KBD_kpplus", 334, "NumpadPlus"],
    ["KBD_kpenter", 335, "NumpadEnter"],

    ["KBD_esc", 256, "Escape"],
    ["KBD_tab", 258, "Tab"],
    ["KBD_backspace", 259, "Backspace"],
    ["KBD_enter", 257, "Enter"],
    ["KBD_space", 32, "Space"],
    ["KBD_leftalt", 342, "AltLeft"],
    ["KBD_rightalt", 346, "AltRight"],
    ["KBD_leftctrl", 341, "ControlLeft"],
    ["KBD_rightctrl", 345, "ControlRight"],
    ["KBD_leftshift", 340, "ShiftLeft"],
    ["KBD_rightshift", 344, "ShiftRight"],
    ["KBD_capslock", 280, "CapsLock"],
    ["KBD_scrolllock", 281, "ScrollLock"],
    ["KBD_numlock", 282, "NumLock"],
    ["KBD_grave", 96, "Backquote"], // 通常用于 `~ 符号  
    ["KBD_minus", 45, "Minus"],
    ["KBD_equals", 61, "Equal"],
    ["KBD_backslash", 92, "Backslash"],
    ["KBD_leftbracket", 91, "BracketLeft"],
    ["KBD_rightbracket", 93, "BracketRight"],
    ["KBD_semicolon", 59, "Semicolon"],
    ["KBD_quote", 39, "Quote"],
    ["KBD_period", 46, "Period"],
    ["KBD_comma", 44, "Comma"],
    ["KBD_slash", 47, "Slash"],
    ["KBD_printscreen", 283, "PrintScreen"],  
    ["KBD_pause", 284, "Pause"],  
    ["KBD_insert", 260, "Insert"],  
    ["KBD_home", 268, "Home"],  
    ["KBD_pageup", 266, "PageUp"],  
    ["KBD_delete", 261, "Delete"], // 注意：这里可能是 "Backspace" 如果是退格键，但根据上下文这里应该是删除键  
    ["KBD_end", 269, "End"],  
    ["KBD_pagedown", 267, "PageDown"],  
    ["KBD_left", 263, "ArrowLeft"],  
    ["KBD_up", 265, "ArrowUp"],  
    ["KBD_down", 264, "ArrowDown"],  
    ["KBD_right", 262, "ArrowRight"],
    ["KBD_extra_lt_gt", 348, undefined], // ???
]


export function HtmlKeyCode2jsdos(press: string): number | undefined {
    for (const m of maps) {
        if (m[2] == press) {
            return m[1]
        }
    }
    return undefined
}