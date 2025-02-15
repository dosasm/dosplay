import { CommandInterface } from "emulators"
import * as cache from "./bundle-cache"

const eles = {
    "upload": document.getElementById("bundle-upload") as HTMLButtonElement,
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

        eles.version.add(new Option(version, version));
        eles.version.value = version;

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