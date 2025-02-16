; the system is blocked when executing main program
; can be solved by RI
 .386
DATA SEGMENT USE16
	MESG DB 'hello tasm',0DH,0AH,'$'
DATA ENDS
CODE SEGMENT USE16
	     ASSUME CS:CODE,DS:DATA
	BEG:  	MOV    AX,DATA
	       	MOV    DS, AX
			MOV    CX,8
	PRINT:  MOV    AH,9
	        MOV    DX, OFFSET MESG
	        INT    21H
	        LOOP   PRINT
	CHECK_LOOP:
    		CMP CX, 10000
    		JG  RESET_CX
    		INC CX
    		JMP CHECK_LOOP

	RESET_CX:
			MOV	CX, 0
			JMP CHECK_LOOP

			MOV AH,4CH
			INT 21H            	;BACK TO DOS
CODE ENDS
END  BEG