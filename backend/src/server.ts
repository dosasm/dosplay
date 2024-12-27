import * as WebSocket from 'ws';
import * as http from 'http';
import { CommandInterface } from 'emulators';
import * as path from 'path';
import * as fs from 'fs';

export function serve_data_via_ws(ci: CommandInterface,port: number) {
    const server = new WebSocket.Server({ port });

    server.on('connection', function connection(ws:WebSocket.WebSocket) {
        ws.on('message', function incoming(message: any) {
            console.log('received: %s', message);
        });

        ws.send('connected');

        ci.events().onSoundPush((data) => {
            console.trace(data.length)
            ws.send(data)
        }
        )
        ci.events().onFrame((data) => {
            if (data){
                ws.send(data)
            }
        })
    }
    );
    return server;
}

export function serve_ci_via_ws(ci: CommandInterface, port: number) {
    const server = new WebSocket.Server({ port });

    server.on('connection', function connection(ws:WebSocket.WebSocket) {
        ws.on('message', function incoming(message: any) {
            console.log('received: %s', message);
            const data = JSON.parse(message);
            if (data.type === 'keypress') {
                ci.simulateKeyPress(data.key);
            }
            if (data.type === 'shell') {
                ci.shell(data.cmd);
                ci.
            }
        });

        ws.send('connected');

        ci.events().onSoundPush((data) => {
            console.trace(data.length)
            ws.send(data)
        }
        )
        ci.events().onFrame((data) => {
            if (data){
                ws.send(data)
            }
        })
    }
    );
    return server;
}


export function start_http_server(port: number, folder: string) {
    const server = http.createServer((req, res) => {
        let url=req.url;
        if (url==='/') url='/index.html';
        if (url===undefined) url='/index.html';
        
        const filePath = path.join(folder, url);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.write('404 Not Found');
                res.end();
            } else {
                res.writeHead(200, { 'Content-Type': getContentType(filePath) });
                res.write(data);
                res.end();
            }
        });
    });

    server.listen(port, () => {
        console.log(`File server started, listening on port ${port}`);
    });
}

function getContentType(filePath: string): string {
    const extname = path.extname(filePath).toLowerCase();
    switch (extname) {
        case '.html':
            return 'text/html';
        case '.js':
            return 'application/javascript';
        case '.css':
            return 'text/css';
        case '.json':
            return 'application/json';
        case '.png':
            return 'image/png';
        case '.jpg':
            return 'image/jpeg';
        case '.gif':
            return 'image/gif';
        default:
            return 'application/octet-stream';
    }
}