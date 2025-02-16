@REM cmd:text;ext:c;fallback:/D/text.c
tcc -LC:\tc\ -IC:\tc\ main.c
main.exe
@REM cmd:graphics;ext:c;fallback:/D/Graphic.c
tcc -Ic:\tc\ -Lc:\tc\ main.c c:\tc\graphics.lib
main.exe