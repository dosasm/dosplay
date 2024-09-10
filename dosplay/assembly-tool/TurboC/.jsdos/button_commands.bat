@REM text
tcc -LC:\tc\ -IC:\tc\ text.c
text.exe
@REM graphics
tcc -Ic:\tc\ -Lc:\tc\ graphic.c c:\tc\graphics.lib
graphic.exe