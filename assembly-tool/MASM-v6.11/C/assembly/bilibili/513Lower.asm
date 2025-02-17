; 5.13字符串转小写

 assume cs:codesg,ds:data,ss:stack
 data segmeNT
 	str db 'hello world','$'
 data ends
 stack segment
 	db 10 dup (0) 
 stack ends
 codesg SEgment
 	start:	
 	mov ax,data
 	mov ds,ax
 	
 	mov bx,0
 	mov cx,11
 	s:
 		mov al,[bx]
 		or al,0100000B
 		mov [bx],al
 		inc bx
 		loop s
 		
 		;mov dx,offset str
 		lea dx,str		
 		mov ah,9
 		int 21H
 
 		mov ah,4cH
 		int 21H
 codesg ends
 end start


