.MODEL SMALL
.STACK 100H

.DATA
    msg1 DB 'Please enter a character: $'
    msg2 DB 'You entered: $'

.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX

    LEA DX, msg1
    MOV AH, 09H
    INT 21H

    MOV AH, 01H
    INT 21H
    MOV BL, AL

    MOV AH, 02H
    MOV DL, 0DH
    INT 21H
    MOV DL, 0AH
    INT 21H

    LEA DX, msg2
    MOV AH, 09H
    INT 21H

    MOV DL, BL
    MOV AH, 02H
    INT 21H

    MOV AH, 4CH
    INT 21H
MAIN ENDP
END MAIN