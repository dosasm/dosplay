const fs = require('fs');
const JSZip = require('jszip');
const path = require('path');

// 递归函数，用于将文件夹添加到zip  
function addFolderToZip(zip, folderPath, base = '') {
    // 读取文件夹内容  
    fs.readdirSync(folderPath).forEach(function (filename) {
        const filePath = path.join(folderPath, filename);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // 如果是目录，则递归添加  
            addFolderToZip(zip, filePath, path.join(base, filename) + '/');
        } else {
            // 如果是文件，则添加到zip
            const ext=path.extname(filePath).toLocaleLowerCase()
            const isTextFile=[".conf",".asm",".bat",".c"].some(x=>x==ext)
            if (isTextFile) {
                let text = fs.readFileSync(filePath, { encoding: 'utf-8' });
                // 检查LF和CRLF的数量  
                let lfCount = (text.match(/\n/g) || []).length;
                let crlfCount = (text.match(/\r\n/g) || []).length;

                // 根据数量判断主要换行符  
                if (lfCount > crlfCount + 1) {
                    text = text.replace(/\n/g, '\r\n')
                    console.log("lf replaced to crlf",filePath)
                }
                zip.file(path.join(base, filename), text);

            } else {
                let data = fs.readFileSync(filePath);
                zip.file(path.join(base, filename), data);
            }

        }
    });
}

function zipfoloder(folderPath) {
    // 创建JSZip实例  
    const zip = new JSZip();

    // 将文件夹添加到zip  
    addFolderToZip(zip, folderPath);

    // if(zip.files[".jsdos"] && zip.files[".jsdos/dosbox.conf"]){

    // }else{
    //     zip.file(".jsdos/dosbox.conf","")
    // }

    // 生成ZIP文件  
    const outputPath = path.resolve(__dirname, path.basename(folderPath) + '.jsdos');

    // 使用JSZip的generateAsync方法（返回Promise）来生成ZIP文件  
    zip.generateAsync({ type: 'nodebuffer' })
        .then(function (content) {
            // 将生成的ZIP内容写入文件  
            fs.writeFileSync(outputPath, content);
            console.log('ZIP文件已生成:', outputPath);
        })
        .catch(function (err) {
            console.error('生成ZIP文件时出错:', err);
        });

}

zipfoloder(path.resolve(__dirname, "TASM"))
zipfoloder(path.resolve(__dirname, "MASM-v5.00"))
zipfoloder(path.resolve(__dirname, "MASM-v6.11"))
zipfoloder(path.resolve(__dirname, "TurboC"))
