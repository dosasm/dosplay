export const urlObj=new URL(document.location.href);
export const remote_emulator_ws=`ws://${urlObj.hostname}:8091`;


export const jsdos={
    dist:"/dosplay/jsdos/",
    bundles:"/dosplay/jsdos-bundle/"
}

export const bundle_config={
    "TASM":{
        "path":"/code/hello.asm"
    },
    "MASM-v5.00":{
        "path":"/code/hello.asm"
    },
    "MASM-v6.11":{
        "path":"/code/hello.asm"
    },
    "TurboC":{
        "path":"/code/Text.c"
    }
}