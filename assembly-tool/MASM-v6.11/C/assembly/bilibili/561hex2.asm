; 5.61十进制转16进制并输出

assume cs:codesg,ds:data,ss:stack
data segmeNT
	str db '00002333','$'
	res db '0000','$'
data ends
stack segment
	db 100 dup (0) 
stack ends
codesg SEgment
	start:	
		mov ax,data
		mov ds,ax
		mov ax,stack
		mov ss,ax		
		mov sp,10
		mov si,4

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
		
;ax=3039
	
		mov cx,4
		l:
			mov dx,ax
			and dx,0FH
			add dx,30H
			cmp dx,3AH
			jb s1
			add dx,7H
;求出3039的ASCII码，push
		s1:
			dec si
			mov ds:res[si],dl
			shr ax,1
			shr ax,1
			shr ax,1
			shr ax,1
			loop l

		;mov dx,offset res
	 	lea  dx,res
		mov ah,9
		int 21H

		mov ah,4cH
		int 21H
codesg ends
end start

