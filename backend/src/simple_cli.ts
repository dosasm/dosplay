import { readFile } from "fs/promises";
import { CommandInterface, get_emulators,utils } from "emulators";


export async function simple_cli(wasm_prefix:string,bundlepath:string,log_message = true, log_ci = true,plugins:Array<(ci:CommandInterface)=>void> = []) {


    const bundle: Buffer = await readFile(bundlepath, { encoding: null });
    const bundleUint8Array = new Uint8Array(bundle);

    const emulators = get_emulators();
    emulators.pathPrefix = wasm_prefix;
    const ci = await emulators.dosboxDirect(bundleUint8Array);
    // const ci=await emulators.dosboxWorker(bundleUint8Array); Not usable now

    ci.events().onStdout((data: string) => {
        if(log_ci){
            console.log('stdout===', data,"===stdout end");
        }else{
            process.stdout.write(data);
        }
    });
    if (log_message) {
        ci.events().onMessage((message) => {
            console.log('message', message);
        })
    }
    process.stdin.on('data', async (data) => {
        
        const chars = String(data);
        const jsdos = utils.String2jsdosCode(chars);
        if(log_ci){
            console.log('data', data,jsdos);
        }
        for (let i = 0; i < jsdos.length; i++) {
            for (let j = 0; j < jsdos[i].length; j++) {
                ci.simulateKeyPress(jsdos[i][j]);
            }
            // wait for 100ms
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    });

    plugins.forEach(plugin=>{
        plugin(ci);
    })


    return new Promise<void>((resolve, reject) => {
        ci.events().onExit(() => {
            resolve();
            console.log('exit');
        });
    })
}
