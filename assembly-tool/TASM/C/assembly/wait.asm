.MODEL SMALL
.STACK 100H

.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX

WAIT_FOR_Q:
    ; 调用 DOS 功能调用，等待用户按键输入
    MOV AH, 01H
    INT 21H

    ; 将输入的字符与 'q'（ASCII 码为 71H 或 51H，分别对应大写和小写）进行比较
    CMP AL, 'q'
    JE END_PROGRAM
    CMP AL, 'Q'
    JE END_PROGRAM

    ; 如果不是 'q' 或 'Q'，则继续等待按键
    JMP WAIT_FOR_Q

END_PROGRAM:
    ; 调用 DOS 功能调用，结束程序
    MOV AH, 4CH
    INT 21H

MAIN ENDP
END MAIN