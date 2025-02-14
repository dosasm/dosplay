@REM default_file:/D/main.asm
@REM supported_ext:asm,ASM
@REM cmd:run
masm main.asm;
link main.obj;
main.exe
@REM cmd:list
masm /la main.asm;
type main.lst
@REM cmd:debug
masm main.asm;
link main.obj;
debug main.exe