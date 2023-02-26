import { Build } from "../build";
import { Emulators, CommandInterface, BackendOptions, DosConfig } from "../emulators";

import { IWasmModules, WasmModulesImpl } from "./modules";

import DosBundle from "../dos/bundle/dos-bundle";
import { dosDirect } from "../dos/dosbox/ts/direct";
import { dosWorker } from "../dos/dosbox/ts/worker";

import { TransportLayer, CommandInterfaceOverTransportLayer } from "../protocol/protocol";
import LibZip from "../libzip/libzip";

class EmulatorsImpl implements Emulators {
    pathPrefix = "";
    version = Build.version;
    wdosboxJs = "wdosbox.js";
    wdosboxxJs = "wdosbox-x.js";

    private wasmModulesPromise?: Promise<IWasmModules>;

    async bundle(): Promise<DosBundle> {
        const modules = await this.wasmModules();
        const libzipWasm = await modules.libzip();
        return new DosBundle(libzipWasm);
    }

    async bundleConfig(bundle: Uint8Array): Promise<DosConfig | null> {
        const modules = await this.wasmModules();
        const libzipWasm = await modules.libzip();

        const module = {};
        await libzipWasm.instantiate(module);
        const libzip = new LibZip(module);

        try {
            libzip.zipToFs(bundle, "/", ".jsdos/");
            try {
                const dosboxConf = (await libzip.readFile(".jsdos/dosbox.conf")) as string;
                try {
                    const jsdosConf = (await libzip.readFile(".jsdos/jsdos.json")) as string;
                    return {
                        dosboxConf,
                        jsdosConf: JSON.parse(jsdosConf),
                    };
                } catch (e) {
                    // ignore
                }
                return {
                    dosboxConf,
                    jsdosConf: {
                        version: Build.version,
                    },
                };
            } catch (e) {
                // ignore
            }
            return null;
        } finally {
            libzip.destroy();
        }
    }

    async bundleUpdateConfig(bundle: Uint8Array, config: DosConfig): Promise<Uint8Array> {
        const modules = await this.wasmModules();
        const libzipWasm = await modules.libzip();

        const module = {};
        await libzipWasm.instantiate(module);
        const libzip = new LibZip(module);

        try {
            await libzip.writeFile("bundle.zip", bundle);
            await libzip.writeFile(".jsdos/dosbox.conf", config.dosboxConf);
            await libzip.writeFile(".jsdos/jsdos.json", JSON.stringify(config.jsdosConf));
            await libzip.zipAddFile("bundle.zip", ".jsdos/jsdos.json");
            await libzip.zipAddFile("bundle.zip", ".jsdos/dosbox.conf");
            return (await libzip.readFile("bundle.zip", "binary")) as Uint8Array;
        } finally {
            libzip.destroy();
        }
    }

    async dosboxNode(bundle: Uint8Array | Uint8Array[], options?: BackendOptions): Promise<CommandInterface> {
        return this.dosboxDirect(bundle, options);
    }

    async dosboxDirect(bundle: Uint8Array | Uint8Array[], options?: BackendOptions): Promise<CommandInterface> {
        const modules = await this.wasmModules();
        const dosboxWasm = await modules.dosbox();
        const transportLayer = await dosDirect(dosboxWasm, "session-" + Date.now());
        return this.backend(bundle, transportLayer, options);
    }

    async dosboxWorker(bundle: Uint8Array | Uint8Array[], options?: BackendOptions): Promise<CommandInterface> {
        const modules = await this.wasmModules();
        const dosboxWasm = await modules.dosbox();
        const transportLayer = await dosWorker(this.pathPrefix + this.wdosboxJs, dosboxWasm, "session-" + Date.now());
        return this.backend(bundle, transportLayer, options);
    }

    async dosboxXNode(bundle: Uint8Array | Uint8Array[], options?: BackendOptions): Promise<CommandInterface> {
        return this.dosboxXDirect(bundle, options);
    }

    async dosboxXDirect(bundle: Uint8Array | Uint8Array[], options?: BackendOptions): Promise<CommandInterface> {
        const modules = await this.wasmModules();
        const dosboxxWasm = await modules.dosboxx();
        const transportLayer = await dosDirect(dosboxxWasm, "session-" + Date.now());
        return this.backend(bundle, transportLayer, options);
    }

    async dosboxXWorker(bundle: Uint8Array | Uint8Array[], options?: BackendOptions): Promise<CommandInterface> {
        const modules = await this.wasmModules();
        const dosboxxWasm = await modules.dosboxx();
        const transportLayer = await dosWorker(this.pathPrefix + this.wdosboxxJs, dosboxxWasm, "session-" + Date.now());
        return this.backend(bundle, transportLayer, options);
    }

    async backend(bundle: Uint8Array | Uint8Array[], transportLayer: TransportLayer,
        options?: BackendOptions): Promise<CommandInterface> {
        return new Promise<CommandInterface>((resolve, reject) => {
            const ci = new CommandInterfaceOverTransportLayer(
                Array.isArray(bundle) ? bundle : [bundle],
                transportLayer,
                (err) => {
                    if (err !== null) {
                        reject(err);
                    } else {
                        // can be called from ctor, without timeout can be undefined
                        setTimeout(() => resolve(ci), 4);
                    }
                },
                options || {},
            );
        });
    }

    wasmModules(): Promise<IWasmModules> {
        if (this.wasmModulesPromise !== undefined) {
            return this.wasmModulesPromise;
        }

        const make = async () => {
            return new WasmModulesImpl(this.pathPrefix, this.wdosboxJs, this.wdosboxxJs);
        };

        this.wasmModulesPromise = make();
        return this.wasmModulesPromise;
    }

    async dosDirect(bundle: Uint8Array | Uint8Array[]): Promise<CommandInterface> {
        return this.dosboxDirect(bundle);
    }

    async dosWorker(bundle: Uint8Array | Uint8Array[]): Promise<CommandInterface> {
        return this.dosboxWorker(bundle);
    }
}

const emulators = new EmulatorsImpl();

export default emulators;
