@REM run
masm hello.asm;
link hello.obj;
hello.exe
@REM list
masm /la hello.asm;
type hello.lst
@REM debug
masm hello.asm;
link hello.obj;
debug hello.exe