; 5.61十进制转16进制


assume cs:codesg,ds:data,ss:stack
data segmeNT
	str db '00012345','$'
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
		mov ax,0
		s:
			mov dx,ax
			shl ax,1
			shl ax,1	
			shl ax,1
			shl dx,1
			add ax,dx
;乘10

			add al,str[bx]
			adc ah,0
			sub ax,30H		
		
			inc bx 
			loop s
	



		mov ah,4cH
		int 21H
codesg ends
end start
