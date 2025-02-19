const fs = require('fs/promises');
const fs0 = require('fs')
const JSZip = require('jszip');
const path = require('path');
const crypto = require('crypto');

function compute_hash(content){
    const hash=crypto.createHash("md5")
    hash.update(content);
    const md5Hash = hash.digest('hex');
    return md5Hash
}

function sort_obj_by_key(originalObj){
    const sortedKeys = Object.keys(originalObj).sort();

    const sortedObj = {};
    sortedKeys.forEach(key => {
        sortedObj[key] = originalObj[key];
    });
    return sortedObj
}

async function zipfoloder(folderPath) {
    const zip = new JSZip();
    const base='';
    const files={}
    let extra=undefined;

    const items=await fs.readdir(folderPath,{recursive:true})
    for (const _rel of items){
        const rel=_rel.replace(/\\/g,"/")
        const filePath = path.join(folderPath, _rel);
        const stat = await fs.stat(filePath);

        if(rel===".jsdos/dosplay.json"){
            const text=await fs.readFile(filePath,"utf-8");
            extra=JSON.parse(text)
            continue
        }

        if (stat.isDirectory()) {
            //
        } else {
            const ext=path.extname(filePath).toLocaleLowerCase()
            const isTextFile=[".conf",".asm",".bat",".c",".h",".map"].some(x=>x==ext)
            if (isTextFile) {
                let text =  await fs.readFile(filePath, { encoding: 'utf-8' });
                // 检查LF和CRLF的数量  
                let lfCount = (text.match(/\n/g) || []).length;
                let crlfCount = (text.match(/\r\n/g) || []).length;

                // 根据数量判断主要换行符  
                if (lfCount > crlfCount + 1) {
                    text = text.replace(/\n/g, '\r\n')
                    if (process.argv.includes("-v")){
                        console.log("lf replaced to crlf",filePath)
                    }
                }
                zip.file(path.posix.join(base, rel), text);
                files[rel]=compute_hash(text)

            } else {
                let data = await fs.readFile(filePath);
                zip.file(path.posix.join(base, rel), data);
                files[rel]=compute_hash(data)
            }

        }
    }

    const bin=await zip.generateAsync({ type: 'nodebuffer' })

    const jsonhashs = JSON.stringify(sort_obj_by_key(files));
    const hash=compute_hash(jsonhashs)

    return {bin,hash,files,extra}
}


const bundles_list=[
    "TASM",
    "MASM-v5.00",
    "MASM-v6.11",
    "TurboC",
    "digger"
]
const OUTPUT_DIR=path.resolve(__dirname, "./build");

if(!fs0.existsSync(OUTPUT_DIR)){
    fs0.mkdirSync(OUTPUT_DIR)
}

async function main(){
    const info={
        version:"1.0",
        homepage:"https://github.com/dosasm/dosplay",
        build_time:Date.now(),
        bundles:[]
    }
    const info_path=path.resolve(OUTPUT_DIR,"info.json");
    let info_old=undefined
    if(fs0.existsSync(info_path)&&!process.argv.includes("--force")){
        const info_old_text=await fs.readFile(info_path,"utf-8")
        info_old=JSON.parse(info_old_text)
    }
    for (const bundle_name of bundles_list){
        const folderPath=path.resolve(__dirname,bundle_name)
        const zip=await zipfoloder(folderPath)
        const filepath=bundle_name+"_"+zip.hash.slice(0,6)+".jsdos.zip";
        info.bundles.push({
            name:bundle_name,
            filepath,
            hash:zip.hash,
            dosplay:zip.extra
        })
        const outpath=path.resolve(OUTPUT_DIR,filepath)
        const finded=info_old?info_old.bundles.find(b=>b.name==bundle_name):undefined
        if(finded && finded.hash===zip.hash){
            console.log("keeped",bundle_name,zip.hash)
        }else{
            await fs.writeFile(outpath,zip.bin)
            console.log("bundled",bundle_name,"to",outpath)
        }
    }
    await fs.writeFile(info_path,JSON.stringify(info,null,4))
}

main()
