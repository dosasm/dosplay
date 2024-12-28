; detect the shift code

.MODEL SMALL
.STACK 100h

.DATA
    left_shift_message DB 'Left Shift key was pressed.$'
    right_shift_message DB 'Right Shift key was pressed.$'
    no_shift_message DB 'No Shift key was pressed.$'

.CODE
MAIN PROC
    MOV AX, @DATA       ; 初始化数据段
    MOV DS, AX

    ; 读取键盘状态
    MOV AH, 02h         ; 调用 BIOS 功能 02h 获取键盘状态
    INT 16h

    ; 检查 Shift 键状态
    TEST AL, 01h        ; 检查右 Shift 键状态（位 0）
    JNZ RIGHT_SHIFT
    TEST AL, 02h        ; 检查左 Shift 键状态（位 1）
    JNZ LEFT_SHIFT
    ; 没有 Shift 键按下
    LEA DX, no_shift_message
    JMP DISPLAY_MESSAGE

LEFT_SHIFT:
    LEA DX, left_shift_message
    JMP DISPLAY_MESSAGE

RIGHT_SHIFT:
    LEA DX, right_shift_message

DISPLAY_MESSAGE:
    ; 显示相应的消息
    MOV AH, 09h         ; 调用 DOS 功能 09h 显示字符串
    INT 21h

    ; 结束程序
    MOV AH, 4Ch        ; 调用 DOS 功能 4Ch 结束程序
    INT 21h
MAIN ENDP
END MAIN