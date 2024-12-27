import path from 'path';
import {simple_cli} from './simple_cli';
import yargs from 'yargs/yargs';

const yargs_opt = yargs(process.argv.slice(2)).options({
    log: { type: 'boolean', default: false,help:"log message" },
    inspect: { type: 'boolean', default: false,help:"inspect mode" },
    ws: { type: 'number', default: undefined,help:"serve frames and sound in a web socket" },
    start: { type: 'boolean', default: false,help:"start" },
  });

const jsdos_wasm=path.resolve(__dirname, "../node_modules/emulators/dist/");
const jsdos_bundles={
    "turboC":path.resolve(__dirname, "../../assembly-tool/TurboC.jsdos"),
}

async function main() {
    const argv=await yargs_opt.parse();
    console.log(argv)

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', async (data) => {
        console.log('received: %s', data);
    });

    if (argv.start){
        await simple_cli(jsdos_wasm,jsdos_bundles.turboC,argv.ws);
    }
}

main()