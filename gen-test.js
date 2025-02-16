const urls=[
    "http://localhost:8080/",
    "http://dosasm.github.io/dosplay/",
]

for (const url of urls){
    const urlObj=new URL(url)
const params=urlObj.searchParams;
params.set("emu","xWorker")
params.set("bundle","TASM")
params.set("open","/C/assembly/LeiJun/run.bat")
params.set("run_cmd","batch")


console.log(urlObj.toString())

}
