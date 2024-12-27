import * as WebSocket from 'ws';
import * as http from 'http';
import { CommandInterface } from 'emulators';

export function serve_data_via_ws(ci: CommandInterface) {
    const server = new WebSocket.Server({ port: 8090 });

    server.on('connection', function connection(ws:any) {
        ws.on('message', function incoming(message: any) {
            console.log('received: %s', message);
        });

        ws.send('something');

        ci.events().onSoundPush((data) => {
            ws.send(data)
        }
        )
        ci.events().onFrame((data) => {
            if (data)
                ws.send(data)
        })
    }
    );
}

export function start_http_server(port: number) {
    const server = http.createServer((req, res) => {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.write('<html><body><h1>欢迎访问这个简单的HTTP服务器！</h1></body></html>');

        res.end();
    });


    server.listen(port, () => {
        console.log(`服务器已启动，正在监听端口 ${port}`);
    });

}