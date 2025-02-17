; 5.23用si，di翻转数组

assume cs:code,ds:data,ss:stack
data segment 
	arr db 1,2,3,4,10,20,30,40
	res db 8 dup (0)
data ends

stack segment 
	
	db 100 dup (0)
stack ends

code segment 
	start:
		mov ax,data
		mov ds,ax
		
		mov si,0
		mov di,7
		mov cx,8
		for:
			mov al,arr[si]
			mov ds:res[di],al
			inc si
			dec di
		loop for
			
		mov ax,4c00H
		int 21
code ends
end start


