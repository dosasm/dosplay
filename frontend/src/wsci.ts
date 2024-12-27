import { CommandInterface, CommandInterfaceEvents, DosConfig, NetworkType } from "emulators";
import { AsyncifyStats, FsNode } from "emulators/dist/out/protocol/protocol";

class RemoteCI implements CommandInterface {
    private ws: WebSocket;
    private basic = { height: 600, width: 800, soundFrequency: 44100 };
    private id = 0;
    private listeners: Map<string, (data: any) => void> = new Map();

    private send_command(type: string, data: any): Promise<any> {
        return new Promise((resolve) => {
            const id = this.id++;
            this.ws.send(JSON.stringify({ id, type, data }));
            this.listeners.set(id.toString(), (data: any) => {
                resolve(data);
                this.listeners.delete(id.toString());
            });
        });
    }

    private sync_basic() {
        this.send_command("basic", {}).then((data) => {
            this.basic = data;
        });
    }

    constructor(ws: WebSocket) {
        this.ws = ws;
        this.ws.onmessage = (event) => {
            if (typeof event.data === "string") {
                const data = JSON.parse(event.data);
                if (data.id) {
                    const func = this.listeners.get(data.id)
                    if (func) func(data.data);
                }
            }
            if (event.data instanceof ArrayBuffer) {
                const data = new Uint8Array(event.data);
                const id = data[0];
                const func = this.listeners.get(id.toString());
                if (func) func(data);
            }
        }
        this.sync_basic();
    }

    async config(): Promise<DosConfig> {
        const data = this.send_command("config", {});
        return data;
    };

    height(): number {
        return this.basic.height;
    };

    width(): number {
        return this.basic.width;
    };

    soundFrequency(): number {
        return this.basic.soundFrequency;
    };

    async screenshot(): Promise<ImageData> {
        const data = await this.send_command("screenshot", {});
        const imageData = new ImageData(new Uint8ClampedArray(data), this.width(), this.height());
        return imageData;
    };

    pause = (): void => {
        this.send_command("pause", {});
    };

    resume = (): void => {
        this.send_command("resume", {});
    };

    mute = (): void => {
        this.send_command("mute", {});
    };

    unmute = (): void => {
        this.send_command("unmute", {});
    };

    sendKeyEvent = (keyCode: number, pressed: boolean): void => {
        this.send_command("keyEvent", [keyCode, pressed]);
    };

    sendMouseMotion = (x: number, y: number): void => {
        this.send_command("mouseMotion", [x, y]);
    };

    sendMouseRelativeMotion = (x: number, y: number): void => {
        this.send_command("mouseRelativeMotion", [x, y]);
    };

    sendMouseButton = (button: number, pressed: boolean): void => {
        this.send_command("mouseButton", [button, pressed]);
    };

    sendMouseSync = (): void => {
        this.send_command("mouseSync", {});
    };

    sendBackendEvent = (event: any): void => {
        this.send_command("backendEvent", event);
    };

    persist = async (onlyChanges?: boolean): Promise<Uint8Array | null> => {
        const data = await this.send_command("persist", { onlyChanges });
        return new Uint8Array(data);
    };

    networkConnect = async (networkType: NetworkType, address: string): Promise<void> => {
        this.ws.send(JSON.stringify({ type: "networkConnect", networkType, address }));
        return new Promise((resolve) => {
            this.ws.onmessage = () => {
                resolve();
            };
        });
    };

    networkDisconnect = async (networkType: NetworkType): Promise<void> => {
        this.ws.send(JSON.stringify({ type: "networkDisconnect", networkType }));
        return new Promise((resolve) => {
            this.ws.onmessage = () => {
                resolve();
            };
        });
    };

    asyncifyStats = async (): Promise<AsyncifyStats> => {
        this.ws.send(JSON.stringify({ type: "asyncifyStats" }));
        return new Promise((resolve) => {
            this.ws.onmessage = (event) => {
                resolve(JSON.parse(event.data));
            };
        });
    };

    fsTree = async (): Promise<FsNode> => {
        this.ws.send(JSON.stringify({ type: "fsTree" }));
        return new Promise((resolve) => {
            this.ws.onmessage = (event) => {
                resolve(JSON.parse(event.data));
            };
        });
    };

    fsReadFile = async (file: string): Promise<Uint8Array> => {
        this.ws.send(JSON.stringify({ type: "fsReadFile", file }));
        return new Promise((resolve) => {
            this.ws.onmessage = (event) => {
                resolve(new Uint8Array(event.data));
            };
        });
    };

    fsWriteFile = async (file: string, contents: ReadableStream<Uint8Array> | Uint8Array): Promise<void> => {
        this.ws.send(JSON.stringify({ type: "fsWriteFile", file, contents }));
        return new Promise((resolve) => {
            this.ws.onmessage = () => {
                resolve();
            };
        });
    };

    fsDeleteFile = async (file: string): Promise<void> => {
        this.ws.send(JSON.stringify({ type: "fsDeleteFile", file }));
        return new Promise((resolve) => {
            this.ws.onmessage = () => {
                resolve();
            };
        });
    };

    simulateKeyPress = (...keyCodes: number[]): void => {
        this.ws.send(JSON.stringify({ type: "keypress", keyCodes }));
    };


    exit = async (): Promise<void> => {
        this.ws.send(JSON.stringify({ type: "exit" }));
    };

    public events(): CommandInterfaceEvents {
        throw new Error("Method not implemented.");
    }

}