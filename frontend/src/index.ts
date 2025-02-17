import { Jsdos } from "./ui/jsdos";
import "./index.css"
import "./keyboard.css"
import { setup_version } from "./ui/bundle";
import { sleep } from "./utils";

let jsdos = new Jsdos();
(window as any).jsdos = jsdos;

function searchIndex(want: string, options: HTMLOptionsCollection) {
    for (let i = 0; i < options.length; i++) {
        if (options[i].value === want) {
            return i
        }
    }
}

function select_setup(select: HTMLSelectElement, id: string, urlParams: URLSearchParams, default_value?: string) {
    let idx = 0;
    let values = [
        urlParams.get(id),
        localStorage.getItem(id),
        default_value
    ]
    for (const value of values) {
        if (!value) continue;
        const idx0 = searchIndex(value as string, select.options)
        if (idx0 !== undefined && idx0 !== -1) {
            idx = idx0;
            break;
        }
    }
    select.selectedIndex = idx;
    select.addEventListener("change", () => {
        localStorage.setItem(id, select.value);
    })
}

async function setup() {
    await jsdos.ready;
    const urlParams = new URLSearchParams(window.location.search);
    let start = true;
    if (urlParams.has('start') && urlParams.get('start') === "false") {
        start = false
    }

    select_setup(jsdos.select_bundle, "bundle", urlParams, "MASM-v6.11");
    select_setup(jsdos.select_emulators, "emu", urlParams, "dosboxWorker");
    await setup_version();

    if (start) {
        setTimeout(() => {
            if (jsdos.select_bundle.value == "disk") return
            jsdos.button_start.click();
        }, 1000);
    }

    const openfile = urlParams.get('open');
    if (openfile) {
        jsdos.button_start.click();
        await jsdos.ready_ci
        await sleep(100);
        await jsdos.jsdos_editor.open_file(openfile);
        jsdos.jsdos_editor.filelist.dispatchEvent(new Event("input"))

        let content = urlParams.get('content');
        const base64content = urlParams.get('bc');
        if (base64content) {
            const decoded = atob(base64content);
            content = decoded;
        }

        await sleep(1000);

        if (content) {
            jsdos.jsdos_editor.editor.setValue(content);
            if (jsdos.ci) 
                jsdos.jsdos_editor.writefile.click();
        }

        const run= urlParams.get('run_cmd');
        if (jsdos.ci && run) {
            await sleep(1000);
            const cmd=jsdos.buttons_command.find(b => b.textContent === run)
            if (cmd) {
                cmd.click();
            }
        }
    }
}

setup()
