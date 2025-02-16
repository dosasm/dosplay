@REM cmd:run;ext:asm,ASM;fallback:/D/main.asm
masm main.asm;
link main.obj;
main.exe

@REM cmd:list;ext:asm,ASM;fallback:/D/main.asm
masm /la main.asm;
type main.lst

@REM cmd:debug;ext:asm,ASM;fallback:/D/main.asm
masm main.asm;
link main.obj;
debug main.exe