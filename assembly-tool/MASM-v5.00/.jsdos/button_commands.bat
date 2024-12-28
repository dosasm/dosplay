@REM run
masm %1.asm;
link %1.obj;
%1.exe
@REM list
masm /la %1.asm;
type %1.lst
@REM debug
masm %1.asm;
link %1.obj;
debug %1.exe