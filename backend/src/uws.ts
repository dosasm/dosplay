import {CommandInterface, CommandInterfaceEvents } from 'emulators';
import uws from 'uWebSockets.js';

export type App = ReturnType<typeof uws.App>;

export function start_websocket(ci:CommandInterface,port:number) {
    const app = uws.App();
    const events=ci.events();

    app.ws('/sound', {
        open: (ws) => {
            console.log('Sound Client connected');
            events.onSoundPush((samples)=>{
                const data=samples;
                try{
                    ws.send(data,true);
                }catch(e){
                    console.error(e);
                }
            });
        },
        message: (ws, message: ArrayBuffer, isBinary: boolean) => {
            if (isBinary) {
                console.log('Received ', message);
            }
            
        },
        close: (ws, code, message) => {
            console.log('Client disconnected');
        }
    });

    app.ws('/frame', {
        open: (ws) => {
            console.log('Frame Client connected');
            events.onFrame((rgb,rgba)=>{
                
                if(rgb){
                    const data=rgb;
                    try{
                        ws.send(data,true);
                    }catch(e){
                        console.error(e);
                    }
                }
            });
        },
        message: (ws, message: ArrayBuffer, isBinary: boolean) => {
            if (isBinary) {
                console.log('Frame Received ', message);
            }
            
        },
        close: (ws, code, message) => {
            console.log('Frame Client disconnected');
        }
    });

    app.ws('/config', {
        open: (ws) => {
            console.log('Client connected');
        },
        message: async (ws, message: ArrayBuffer, isBinary: boolean) => {
            if (isBinary) {
                console.log('Received ', message);
            }else{
                const data:any=Buffer.from(message).toString();
                console.log('Received ', data,isBinary);
                const {id,cmd,args}=JSON.parse(data);
                const r=await (ci as any)[cmd](...args)
                const response=JSON.stringify({id,data:r});
                ws.send(response,false);
            }
            
        },
        close: (ws, code, message) => {
            console.log('Client disconnected');
        }
    });

    app.listen(port, (listenSocket) => {
        console.log('Server started successfully, listening on port ' + port);
        console.log(listenSocket);
    });

    return app;
}
