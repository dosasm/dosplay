import { CommandInterface, DosConfig, NetworkType } from "emulators";
import { AsyncifyStats, FsNode } from "emulators/dist/out/protocol/protocol";

class RemoteCI implements CommandInterface {
    private ws: WebSocket;

    constructor(ws: WebSocket) {
        this.ws = ws;
    }

    config = async (): Promise<DosConfig> => {
        this.ws.send(JSON.stringify({ type: "config" }));
        return new Promise((resolve) => {
            this.ws.onmessage = (event) => {
                resolve(JSON.parse(event.data));
            };
        });
    };

    height = (): number => {
        // Implement the logic to get height
        return 600; // Example value
    };

    width = (): number => {
        // Implement the logic to get width
        return 800; // Example value
    };

    soundFrequency = (): number => {
        // Implement the logic to get sound frequency
        return 44100; // Example value
    };

    screenshot = async (): Promise<ImageData> => {
        this.ws.send(JSON.stringify({ type: "screenshot" }));
        return new Promise((resolve) => {
            this.ws.onmessage = (event) => {
                const imageData = new ImageData(new Uint8ClampedArray(event.data), this.width(), this.height());
                resolve(imageData);
            };
        });
    };

    pause = (): void => {
        this.ws.send(JSON.stringify({ type: "pause" }));
    };

    resume = (): void => {
        this.ws.send(JSON.stringify({ type: "resume" }));
    };

    mute = (): void => {
        this.ws.send(JSON.stringify({ type: "mute" }));
    };

    unmute = (): void => {
        this.ws.send(JSON.stringify({ type: "unmute" }));
    };

    sendKeyEvent = (keyCode: number, pressed: boolean): void => {
        this.ws.send(JSON.stringify({ type: "keyEvent", keyCode, pressed }));
    };

    sendMouseMotion = (x: number, y: number): void => {
        this.ws.send(JSON.stringify({ type: "mouseMotion", x, y }));
    };

    sendMouseRelativeMotion = (x: number, y: number): void => {
        this.ws.send(JSON.stringify({ type: "mouseRelativeMotion", x, y }));
    };

    sendMouseButton = (button: number, pressed: boolean): void => {
        this.ws.send(JSON.stringify({ type: "mouseButton", button, pressed }));
    };

    sendMouseSync = (): void => {
        this.ws.send(JSON.stringify({ type: "mouseSync" }));
    };

    sendBackendEvent = (event: any): void => {
        this.ws.send(JSON.stringify({ type: "backendEvent", event }));
    };

    persist = async (onlyChanges?: boolean): Promise<Uint8Array | null> => {
        this.ws.send(JSON.stringify({ type: "persist", onlyChanges }));
        return new Promise((resolve) => {
            this.ws.onmessage = (event) => {
                resolve(new Uint8Array(event.data));
            };
        });
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

    shell = (cmd: string): void => {
        this.ws.send(JSON.stringify({ type: "shell", cmd }));
    };

    exit = async (): Promise<void> => {
        this.ws.send(JSON.stringify({ type: "exit" }));
    };

    events = (): any => {
        throw new Error("Method not implemented.");
    };
}
    width: () => number;
    soundFrequency: () => number;
    screenshot: () => Promise<ImageData>;
    pause: () => void;
    resume: () => void;
    mute: () => void;
    unmute: () => void;
    sendKeyEvent: (keyCode: number, pressed: boolean) => void;
    sendMouseMotion: (x: number, y: number) => void;
    sendMouseRelativeMotion: (x: number, y: number) => void;
    sendMouseButton: (button: number, pressed: boolean) => void;
    sendMouseSync: () => void;
    sendBackendEvent: (event: any) => void;
    persist(onlyChanges?: boolean): Promise<Uint8Array | null> {
        throw new Error("Method not implemented.");
    }
    networkConnect(networkType: NetworkType, address: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    networkDisconnect(networkType: NetworkType): Promise<void> {
        throw new Error("Method not implemented.");
    }
    asyncifyStats(): Promise<AsyncifyStats> {
        throw new Error("Method not implemented.");
    }
    fsTree(): Promise<FsNode> {
        throw new Error("Method not implemented.");
    }
    fsReadFile(file: string): Promise<Uint8Array> {
        throw new Error("Method not implemented.");
    }
    fsWriteFile(file: string, contents: ReadableStream<Uint8Array> | Uint8Array): Promise<void> {
        throw new Error("Method not implemented.");
    }
    fsDeleteFile(file: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    simulateKeyPress(...keyCodes: number[]): void {
        this.ws.send(JSON.stringify({type:"keypress", keyCodes: keyCodes}));
    }
    shell(cmd: string): void {
        this.ws.send(JSON.stringify({type:"shell",cmd:cmd}));
    }
    async exit(): Promise<void> {
        this.ws.send(JSON.stringify({type:"exit"}));
    }
    events(): any {
        throw new Error("Method not implemented.");
    }
}