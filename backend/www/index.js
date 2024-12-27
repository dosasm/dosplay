const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const gl = canvas.getContext('webgl');

const url = new URL(window.location.href);

const ws = new WebSocket(`ws://${url.hostname}:8090`);

ws.onmessage = (event) => {
    const data = event.data;
    console.log('Received data:', data);
    // render(data);
};

function render(data) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Example rendering logic
    // You can replace this with your actual rendering code
    gl.viewport(0, 0, canvas.width, canvas.height);
    // Add your WebGL rendering code here using the data received
}

ws.onopen = () => {
    console.log('Connected to WebSocket server');
};

ws.onclose = () => {
    console.log('Disconnected from WebSocket server');
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};