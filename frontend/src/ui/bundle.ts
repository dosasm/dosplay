import { CommandInterface } from "emulators"
import * as cache from "./bundle-cache"

const eles = {
    "upload": document.getElementById("bundle-upload") as HTMLInputElement,
    "save": document.getElementById("bundle-save") as HTMLButtonElement,
    "remove": document.getElementById("bundle-remove") as HTMLButtonElement,
    "clear": document.getElementById("bundle-clear") as HTMLButtonElement,
    "version": document.getElementById("bundle-version") as HTMLSelectElement,
    "jsdosbundle": document.getElementById("jsdosbundle") as HTMLInputElement,
}

export const setup_version=async () => {
    eles.version.innerHTML = "<option value='original'>original</option>";
    const versions = await cache.listBundles()
    for (const version of versions) {
        if (version.startsWith(eles.jsdosbundle.value)) 
            eles.version.add(new Option(version.replace(eles.jsdosbundle.value+"_",""), version));
    }
    eles.version.selectedIndex = eles.version.options.length - 1;
}

eles.jsdosbundle.addEventListener(
    "change",
    setup_version
)


class CI{
    constructor(public get_ci:()=>CommandInterface|undefined){
    }
    public get ci(){
        return this.get_ci();
    }
}

export const ci_provider=new CI(()=>undefined);

eles.save.addEventListener(
    "click",
    async () => {
        const ci=ci_provider.ci;
        if (!ci) {
            return;
        }
        const bundle = await ci.persist(false);
        if (!bundle) {
            return;
        }
        const version =new Date().toUTCString();
        cache.cacheBundle(eles.jsdosbundle.value+"_"+ version, bundle);

        eles.version.add(new Option(version, eles.jsdosbundle.value+"_"+version));
        eles.version.value = eles.jsdosbundle.value+"_"+version;

        // save version to localstorage
        const versions = JSON.parse(localStorage.getItem(eles.jsdosbundle.value+"-versions") || "[]");
        localStorage.setItem(eles.jsdosbundle.value+"-versions", JSON.stringify([...versions, version]));
        localStorage.setItem(eles.jsdosbundle.value+"-version-selected", version);
    }
)


eles.clear.addEventListener(
    "click",
    async () => {
        eles.version.innerHTML = "<option value='original'>original</option>";
        cache.clearBundles();
    }
)
// 获取文件输入元素
const fileInput = document.getElementById('fileInput') as HTMLInputElement;

// 为文件输入元素添加 change 事件监听器
eles.upload.addEventListener('change', function (event: Event) {
    const target = event.target as HTMLInputElement;
    // 获取用户选择的文件列表
    const files = target.files;

    // 检查用户是否选择了文件
    if (files && files.length > 0) {
        // 获取第一个文件
        const file = files[0];

        // 创建一个 FileReader 对象
        const reader = new FileReader();

        // 为 FileReader 的 load 事件添加监听器，当文件读取完成时触发
        reader.addEventListener('load', function (loadEvent: ProgressEvent<FileReader>) {
            const target = loadEvent.target;
            if (target && target.result) {
                // 获取读取的文件内容，这里是 ArrayBuffer 类型
                const arrayBuffer = target.result as ArrayBuffer;

                // 将 ArrayBuffer 转换为 Uint8Array
                const uint8Array = new Uint8Array(arrayBuffer);

                cache.cacheBundle("upload", uint8Array);

                // 打印 Uint8Array 的内容
                console.log(uint8Array);
            }
        });

        // 以 ArrayBuffer 格式读取文件
        reader.readAsArrayBuffer(file);
    }
});