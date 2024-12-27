import path from 'path';
import {simple_cli} from './simple_cli';
import {serve_data_via_ws,start_http_server} from "./server"

const jsdos_wasm=path.resolve(__dirname, "../node_modules/emulators/dist/");
const jsdos_bundles={
    "turboC":path.resolve(__dirname, "../../assembly-tool/TurboC.jsdos"),
}

async function main() {
    console.log(process.argv0)
    console.log(process.argv)
    console.log(process.execArgv) 

    let log=false;
    if (process.argv.includes('--inspect')) {
        console.log('inspect mode');
       log=true;
    }

    let plugins=[]
    if (process.argv.includes('--serve')) {
        start_http_server(8091,path.resolve(__dirname, "../www/"))
        plugins.push(serve_data_via_ws)
    }

    await simple_cli(jsdos_wasm,jsdos_bundles.turboC,log,log,plugins);
}

main()