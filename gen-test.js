const urls=[
    "http://localhost:8080/"
]

const urlObj=new URL(urls[0])
const params=urlObj.searchParams;
params.set("emu","dosboxWorker")
params.set("bundle","TASM")
params.set("open","/C/assembly/leijun.asm")
params.set("run_cmd","run")


console.log(urlObj.toString())