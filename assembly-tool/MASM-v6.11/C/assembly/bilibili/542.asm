; 5.42二重循环把指定矩形转大写

assume cs:codesg,ds:data,ss:stack
data segmeNT
	str db 'aaaaabbbbbccccc '
	db 'aaaaabbbbbccccc '
	db 'aaaaabbbbbccccc '
	db 'aaaaabbbbbccccc ','$'

data ends
stack segment
	db 10 dup (0) 
stack ends
codesg SEgment
	start:	
	mov ax,data
	mov ds,ax
	
	mov bx,0
	mov cx,4
	for:
	      mov dx,cx
		mov si,0
		mov cx,5
		for1:
			mov al,ds:str[bx+si]
			and al,11011111B
			mov ds:str[bx+si],al
		inc si
		loop for1
	     mov cx,dx
	add bx,16
	loop for
		
	lea dx,str		
	mov ah,9
	int 21H

	mov ah,4cH
	int 21H
codesg ends
end start



