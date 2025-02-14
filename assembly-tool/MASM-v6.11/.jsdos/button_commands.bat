@REM run
masm main.asm;
link main.obj;
main.exe
@REM list
masm /la main.asm;
type main.lst
@REM debug
masm main.asm;
link main.obj;
debug main.exe