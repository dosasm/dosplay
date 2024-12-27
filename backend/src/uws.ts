import {CommandInterface, CommandInterfaceEvents } from 'emulators';
import uws from 'uWebSockets.js';

export type App = ReturnType<typeof uws.App>;

export function start_websocket(ci:CommandInterface,port:number) {
    const app = uws.App();
    const events=ci.events();

    app.ws('/sound', {
        open: (ws) => {
            console.log('Client connected');
            events.onSoundPush((samples)=>{
                const data=samples;
                ws.send(data,true);
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
            console.log('Client connected');
            events.onFrame((rgb,rgba)=>{
                if(rgb){
                    const data=rgb;
                    ws.send(data,true);
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

    app.listen(port, (listenSocket) => {
        console.log('Server started successfully, listening on port ' + port);
        console.log(listenSocket);
    });

    return app;
}
