@REM run
tasm hello.asm
tlink hello.obj
hello.exe
@REM list
tasm /la hello.asm
type hello.lst  
@REM debug
tasm /zi hello.asm
tlink /v/3 hello.obj
TD hello.exe