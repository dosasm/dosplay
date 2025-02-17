; 5.32动态规划求斐波那契数列

assume cs:code,ds:data,ss:stack
data segment 
	arr dw 1H,1H,100 dup (0)
	res db 800 dup (0)
data ends

stack segment 
	db 100 dup (0)
stack ends

code segment 
	start:
		mov ax,data
		mov ds,ax
		mov ax,stack
		mov ss,ax
		
		mov bx,4
		mov cx,30
		for :
			mov dx,0
			add dx,ds:arr[bx-2]
			add dx,ds:arr[bx-4]
			mov ds:arr[bx],dx
		add bx,2
		loop for
			
		mov ax,4c00H
		int 21
code ends
end start



