export const urlObj=new URL(document.location.href);
export const remote_emulator_ws=`ws://${urlObj.hostname}:8091`;


export const jsdos={
    dist:"/dosplay/jsdos/",
    bundles:"/dosplay/jsdos/bundle/"
}