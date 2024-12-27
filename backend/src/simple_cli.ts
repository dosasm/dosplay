import { readFile } from "fs/promises";
import { CommandInterface, get_emulators, utils } from "emulators";
import { serve_data_via_ws } from "./server";
import { WebSocketServer } from "ws";

export enum LogType {
    stdout="",
    dosboxMessage="[dosboxMessage]",
    message="[message]",
}

function log(type: LogType, message: string) {
    console.log(type, message);
}


export async function simple_cli(wasm_prefix: string, bundlepath: string) {

    const bundle: Buffer = await readFile(bundlepath, { encoding: null });
    const bundleUint8Array = new Uint8Array(bundle);

    const emulators = get_emulators();
    emulators.pathPrefix = wasm_prefix;
    const ci = await emulators.dosboxDirect(bundleUint8Array);
    // const ci=await emulators.dosboxWorker(bundleUint8Array); Not usable now

    ci.events().onStdout((data: string) => {
        log(LogType.stdout, data);
    });

    ci.events().onMessage((message) => {
        log(LogType.dosboxMessage, message);
    })


    let server:WebSocketServer|null = null;
    process.stdin.on('data', async (data) => {
        const chars = String(data);
        if (chars.startsWith("shell ")) {
            const cmd = chars.substring(6);
            const jsdos = utils.String2jsdosCode(cmd);
            for (let i = 0; i < jsdos.length; i++) {
                for (let j = 0; j < jsdos[i].length; j++) {
                    ci.simulateKeyPress(jsdos[i][j]);
                }
                // wait for 100ms
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        if (chars.startsWith("exit")){
            ci.exit();
            process.exit(0);
        }

        if (chars.startsWith("ws ")) {
            if (server) {
                server.close();
            }
            try{
                const port = parseInt(chars.substring(3));
                server=serve_data_via_ws(ci, port);
            }catch(e){
                if(chars.startsWith("ws close")){

                }else{
                    console.error(e);
                }
            }
        }
    });

    return ci;
}
