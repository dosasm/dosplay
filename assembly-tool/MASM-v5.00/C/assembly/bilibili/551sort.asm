; 5.51冒泡排序

```assembly
assume cs:codesg,ds:data,ss:stack
data segmeNT
	arr db 0A2H,24H,07H,3AH,1BH,0F1H,3BH,25H,81H

data ends
stack segment
	db 10 dup (0) 
stack ends
codesg SEgment
	start:	
	mov ax,data
	mov ds,ax
	
	
	mov bx,0
	mov cx,8
	for:
	      mov dx,cx
		mov si,8
		mov cx,8
		sub cx,bx
		for1:
			mov ah,ds:arr[si]
			mov al,ds:arr[si-1]
			cmp ah,al
			jnb all
				xchg ah,al
				mov ds:arr[si],ah
				mov ds:arr[si-1],al				
	
			all:
				
		dec si
		loop for1
	     mov cx,dx
	add bx,1
	loop for

	mov ah,4cH
	int 21H
codesg ends
end start



