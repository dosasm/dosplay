const urls=[
    "http://localhost:8080/"
]

const urlObj=new URL(urls[0])
const params=urlObj.searchParams;
// params.set("start",1)
params.set("emu","dosboxWorker")
params.set("bundle","MASM-v6.11")
// params.set("content","%hello")
params.set("write","/code/hello.asm")
params.set("bc",btoa("%hello"))


console.log(urlObj.toString())