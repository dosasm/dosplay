class DiskBundle{
    valid="showOpenFilePicker" in window;
    uint8Array: Uint8Array|undefined;
    filehandle: any;
    async openFile(){
        try{
// 让用户选择要打开的文件
const [fileHandle] = await (window as any).showOpenFilePicker({
    types: [
        {
            description: 'Binary files',
            accept: {
                'application/octet-stream': ['.jsdos',".zip"] 
            }
        }
    ]
});

// 获取文件内容
const file = await fileHandle.getFile();
const arrayBuffer = await file.arrayBuffer();
this.filehandle = fileHandle;
this.uint8Array = new Uint8Array(arrayBuffer);
        }
        catch(e){
            console.error(e);
        }
        
    }

    async saveFile(newUint8Array: Uint8Array){
        const fileHandle = this.filehandle;
        if (!fileHandle) {
            console.error('文件未打开。');
            return;
        }
        // 以写入模式打开文件
        const writable = await fileHandle.createWritable();
        await writable.write(newUint8Array);
        await writable.close();

        console.log('二进制文件修改并保存成功。');
    }
}

export const diskBundle=new DiskBundle();