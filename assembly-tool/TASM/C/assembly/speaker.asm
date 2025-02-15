CODE SEGMENT
    ASSUME CS:CODE
BEG:
    IN  AL, 61H
    OR  AL, 03H
    OUT 61H,AL    ;接通扬声器🔈
    MOV DX, 12H
    MOV AX, 34DEH ;计数初值
    MOV CX, 800
    DIV CX        
    OUT 42H,AL    ;先写低8位
    MOV AL, AH    ;再写高8位
    OUT 42H,AL
SCAN:
    MOV AH, 1
    INT 16H       ;等待按键
    JZ  SCAN
    IN  AL, 61H
    AND AL, 0FCH
    OUT 61H,AL    ;关闭扬声器🔈
    MOV AH, 4CH
    INT 21H
CODE ENDS
    END BEG