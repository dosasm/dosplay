@REM default_file:/D/main.asm
@REM supported_ext:asm,ASM
@REM cmd:run
tasm main.asm
tlink main.obj
main.exe
@REM cmd:run-com
tasm main.asm
tlink /t main.obj
main.com
@REM cmd:list
tasm /la main.asm
type main.lst  
@REM cmd:debug
tasm /zi main.asm
tlink /v/3 main.obj
TD main.exe