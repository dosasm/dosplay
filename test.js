const text=`
@REM run
C:\\masm\\script\\Run.bat
@REM list
C:\\masm\\script\\List.bat  
@REM debug
C:\\masm\\script\\Debug.bat

`

const cmds=text.split("@REM").map((val,idex)=>{
    const lines=val.split("\n")
    const name=lines[0].trim();
    const cmd=lines.slice(1).join("\n").trim()
    return {name,cmd}
}).filter(x=>x.name && x.cmd);

console.log(cmds)