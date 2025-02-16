@REM cmd:run;ext:asm,ASM;fallback:/D/main.asm
tasm main.asm
tlink main.obj
main.exe

@REM cmd:run-com;ext:asm,ASM;fallback:/D/main.asm
tasm main.asm
tlink /t main.obj
main.com

@REM cmd:list;;ext:asm,ASM;fallback:/D/main.asm
tasm /la main.asm
type main.lst

@REM cmd:debug;;ext:asm,ASM;fallback:/D/main.asm
tasm /zi main.asm
tlink /v/3 main.obj
TD main.exe