import path from 'path';
import {simple_cli} from './simple_cli';
import {serve_data_via_ws,start_http_server} from "./server"
import yargs from 'yargs/yargs';
import { help } from 'yargs';

const argvp = yargs(process.argv.slice(2)).options({
    log: { type: 'boolean', default: false,help:"log message" },
    cli: { type: 'boolean', default: false,help:"cli mode" },
    serve: { type: 'boolean', default: false,help:"serve frames and sound" },
    inspect: { type: 'boolean', default: false,help:"inspect mode" },
    start: { type: 'boolean', default: false,help:"start" },
    // b: { type: 'string', demandOption: true },
    // c: { type: 'number', alias: 'chill' },
    // d: { type: 'array' },
    // e: { type: 'count' },
    // f: { choices: ['1', '2', '3'] }
  }).parse();

const jsdos_wasm=path.resolve(__dirname, "../node_modules/emulators/dist/");
const jsdos_bundles={
    "turboC":path.resolve(__dirname, "../../assembly-tool/TurboC.jsdos"),
}

async function main() {
    // console.log(process.argv0)
    // console.log(process.argv)
    // console.log(process.execArgv) 

    const argv=await argvp;

    if (argv.start){
        await simple_cli(jsdos_wasm,jsdos_bundles.turboC);
    }
}

main()