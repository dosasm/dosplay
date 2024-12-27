import { CommandInterface, CommandInterfaceEvents, DosConfig, MessageType, NetworkType } from "emulators";
import { AsyncifyStats, FsNode } from "emulators/dist/out/protocol/protocol";

class RemoteEvents implements CommandInterfaceEvents {
    private stdoutConsumers: ((message: string) => void)[] = [];
    private frameSizeConsumers: ((width: number, height: number) => void)[] = [];
    private frameConsumers: ((rgb: Uint8Array | null, rgba: Uint8Array | null) => void)[] = [];
    private soundPushConsumers: ((samples: Float32Array) => void)[] = [];
    private exitConsumers: (() => void)[] = [];
    private messageConsumers: ((msgType: MessageType, ...args: any[]) => void)[] = [];
    private networkConnectedConsumers: ((networkType: NetworkType, address: string) => void)[] = [];
    private networkDisconnectedConsumers: ((networkType: NetworkType) => void)[] = [];

    constructor(host:string){
        const socket=new WebSocket(`${host}/frame`);
        socket.binaryType = 'arraybuffer';
        socket.addEventListener('open', () => {
            const float32Array = new Float32Array([1.0, 2.0, 3.0]);
            const buffer = float32Array.buffer;
            socket.send(buffer);
        });
        
        socket.addEventListener('message', (event: MessageEvent) => {
            // console.trace("message",event);
            const receivedBuffer = event.data;
            const receivedArray = new Uint8Array(receivedBuffer);
            console.log('Received response Uint8Array:');
            this.frameConsumers.forEach(consumer => consumer(receivedArray, null));
        });

    }

    onStdout(consumer: (message: string) => void): void {
        this.stdoutConsumers.push(consumer);
    }

    onFrameSize(consumer: (width: number, height: number) => void): void {
        this.frameSizeConsumers.push(consumer);
    }

    onFrame(consumer: (rgb: Uint8Array | null, rgba: Uint8Array | null) => void): void {
        this.frameConsumers.push(consumer);
    }

    onSoundPush(consumer: (samples: Float32Array) => void): void {
        this.soundPushConsumers.push(consumer);
    }

    onExit(consumer: () => void): void {
        this.exitConsumers.push(consumer);
    }

    onMessage(consumer: (msgType: MessageType, ...args: any[]) => void): void {
        this.messageConsumers.push(consumer);
    }

    onNetworkConnected(consumer: (networkType: NetworkType, address: string) => void): void {
        this.networkConnectedConsumers.push(consumer);
    }

    onNetworkDisconnected(consumer: (networkType: NetworkType) => void): void {
        this.networkDisconnectedConsumers.push(consumer);
    }

    triggerStdout(message: string): void {
        this.stdoutConsumers.forEach(consumer => consumer(message));
    }

    triggerFrameSize(width: number, height: number): void {
        this.frameSizeConsumers.forEach(consumer => consumer(width, height));
    }

    triggerFrame(rgb: Uint8Array | null, rgba: Uint8Array | null): void {
        this.frameConsumers.forEach(consumer => consumer(rgb, rgba));
    }

    triggerSoundPush(samples: Float32Array): void {
        this.soundPushConsumers.forEach(consumer => consumer(samples));
    }

    triggerExit(): void {
        this.exitConsumers.forEach(consumer => consumer());
    }

    triggerMessage(msgType: MessageType, ...args: any[]): void {
        this.messageConsumers.forEach(consumer => consumer(msgType, ...args));
    }

    triggerNetworkConnected(networkType: NetworkType, address: string): void {
        this.networkConnectedConsumers.forEach(consumer => consumer(networkType, address));
    }

    triggerNetworkDisconnected(networkType: NetworkType): void {
        this.networkDisconnectedConsumers.forEach(consumer => consumer(networkType));
    }
}
    

export class RemoteCI implements CommandInterface {
    private ws: WebSocket;
    private basic={height:0,width:0,soundFrequency:0};
    private id = 0;
    private listeners: Map<number, (data: any) => void> = new Map();

    private send_command(cmd: string, args: any[]): Promise<any> {
        return new Promise((resolve) => {
            const id = this.id++;
            this.ws.send(JSON.stringify({ id, cmd, args }));
            this.listeners.set(id, (data: any) => {
                resolve(data);
                this.listeners.delete(id);
            });
        });
    }

    private _events: CommandInterfaceEvents;
    public ready:Promise<boolean>=Promise.resolve(false);
    constructor(baseurl:string) {
        this.ws = new WebSocket(baseurl+"/config");
        this.ready=new Promise((resolve)=>{
            this.ws.onopen=()=>{
                Promise.all([this.sync_height(), this.sync_width(), this.sync_soundFrequency()]).then(()=>{
                    resolve(true);
                })
            }
        });
        this._events = new RemoteEvents(baseurl);
        this.ws.onmessage = (event) => {
            if (typeof event.data === "string") {
                const data = JSON.parse(event.data);
                if (typeof data.id=="number") {
                    const func = this.listeners.get(data.id)
                    if (func) func(data.data);
                }
            }
            if (event.data instanceof ArrayBuffer) {
                console.log('Received response ArrayBuffer:', event.data);
            }
        }
    }

    async config(): Promise<DosConfig> {
        return this.send_command("config", []);
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

    async sync_height() {
        this.basic.height=await this.send_command("height", []) as number;
    };

    async sync_width() {
        this.basic.width=await this.send_command("width", []);
    };

    async sync_soundFrequency() {
        this.basic.soundFrequency=await this.send_command("soundFrequency", []);
    };

    async screenshot(): Promise<ImageData> {
        const data = await this.send_command("screenshot", []);
        const imageData = new ImageData(new Uint8ClampedArray(data), this.width(), this.height());
        return imageData;
    };

    pause = (): void => {
        this.send_command("pause", []);
    };

    resume = (): void => {
        this.send_command("resume", []);
    };

    mute = (): void => {
        this.send_command("mute", []);
    };

    unmute = (): void => {
        this.send_command("unmute", []);
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
        this.send_command("mouseSync", []);
    };

    sendBackendEvent = (event: any): void => {
        this.send_command("backendEvent", event);
    };

    persist = async (onlyChanges?: boolean): Promise<Uint8Array | null> => {
        const data = await this.send_command("persist", [ onlyChanges ]);
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
        return this._events;
    }

}