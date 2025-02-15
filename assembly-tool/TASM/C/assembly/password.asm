.MODEL SMALL
.STACK 100H

.DATA
    ; 提示信息
    prompt_msg DB 'Please enter the password: $'
    success_msg DB 'Password correct! Access granted.$'
    error_msg DB 'Password incorrect! Try again.$'
    limit_msg DB 'You have exceeded the maximum number of attempts. Access denied.$'
    ; 预设密码
    password DB 'Secret123', 0
    ; 用户输入缓冲区
    input_buffer DB 20,?, 20 DUP('$')
    ; 尝试次数计数器
    attempts DB 0

.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX

; 开始循环，最多允许 3 次尝试
TRY_LOOP:
    ; 显示提示信息
    MOV AH, 09H
    LEA DX, prompt_msg
    INT 21H

    ; 读取用户输入
    MOV AH, 0AH
    LEA DX, input_buffer
    INT 21H

    ; 换行
    MOV AH, 02H
    MOV DL, 0DH
    INT 21H
    MOV DL, 0AH
    INT 21H

    ; 获取用户输入的实际长度
    MOV SI, offset input_buffer + 1
    MOV CL, [SI]
    MOV CH, 0

    ; 比较用户输入和预设密码
    MOV SI, offset input_buffer + 2
    MOV DI, offset password
    MOV CX, 9 ; 预设密码长度
    CLD
    REPE CMPSB
    JZ PASSWORD_CORRECT ; 如果相等，跳转到成功处理

    ; 密码错误处理
    MOV AH, 09H
    LEA DX, error_msg
    INT 21H

    ; 换行
    MOV AH, 02H
    MOV DL, 0DH
    INT 21H
    MOV DL, 0AH
    INT 21H

    ; 增加尝试次数
    INC attempts
    CMP attempts, 3
    JGE ACCESS_DENIED ; 如果尝试次数达到 3 次，跳转到拒绝访问处理
    JMP TRY_LOOP ; 否则继续尝试

PASSWORD_CORRECT:
    ; 密码正确处理
    MOV AH, 09H
    LEA DX, success_msg
    INT 21H
    JMP EXIT_PROGRAM

ACCESS_DENIED:
    ; 拒绝访问处理
    MOV AH, 09H
    LEA DX, limit_msg
    INT 21H

EXIT_PROGRAM:
    ; 退出程序
    MOV AH, 4CH
    INT 21H

MAIN ENDP
END MAIN