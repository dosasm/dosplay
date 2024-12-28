import { CommandInterface } from "emulators";

// 顶点着色器源码，这里定义为字符串类型常量
const vsSource: string = `
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

varying highp vec2 vTextureCoord;

void main(void) {
  gl_Position = aVertexPosition;
  vTextureCoord = aTextureCoord;
}
`;
// 片元着色器源码，同样定义为字符串类型常量
const fsSource: string = `
varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;


void main(void) {
  highp vec4 color = texture2D(uSampler, vTextureCoord);
  gl_FragColor = vec4(color.r, color.g, color.b, 1.0);
}
`;

// webGl函数接受特定类型的参数，并返回void（无返回值）
export function webGl(canvas: HTMLCanvasElement, ci: CommandInterface, stats: Stats): void {
    // 获取canvas元素，并断言其不为null（因为后续要使用其方法）
    const layers=canvas.parentElement as HTMLDivElement;
    if (!canvas) {
        throw new Error("Canvas element not found in layers object");
    }
    // 获取WebGL上下文，类型为WebGLRenderingContext | null，这里也进行了null判断
    const gl = canvas.getContext("webgl");
    if (gl === null) {
        throw new Error("Unable to create webgl context on given canvas");
    }
    // 初始化着色器程序，传入的参数类型明确为WebGLRenderingContext、字符串类型的源码
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    // 获取顶点位置属性位置，返回值为GLint类型
    const vertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    // 获取纹理坐标属性位置，返回值为GLint类型
    const textureCoord = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    // 获取uniform变量位置，返回值为WebGLUniformLocation | null类型
    const uSampler = gl.getUniformLocation(shaderProgram, "uSampler");
    // 初始化缓冲区，传入相应的WebGL上下文及属性位置参数
    initBuffers(gl, vertexPosition, textureCoord);
    // 创建纹理对象
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const pixel = new Uint8Array([0, 0, 0]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, pixel);
    gl.useProgram(shaderProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(uSampler, 0);
    // 获取容器宽度，类型为number
    let containerWidth = layers.clientWidth;
    // 获取容器高度，类型为number
    let containerHeight = layers.clientHeight;
    // 帧宽度，初始化为0，类型为number
    let frameWidth = 0;
    // 帧高度，初始化为0，类型为number
    let frameHeight = 0;
    const onResize = () => {
        const aspect = frameWidth / frameHeight;
        let width = containerWidth;
        let height = containerWidth / aspect;
        if (height > containerHeight) {
            height = containerHeight;
            width = containerHeight * aspect;
        }
        canvas.style.position = "relative";
        canvas.style.top = (containerHeight - height) / 2 + "px";
        canvas.style.left = (containerWidth - width) / 2 + "px";
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
    };
    const onResizeLayer = (event:UIEvent) => {
        const w = layers.clientWidth;
        const h = layers.clientHeight;
        containerWidth = w;
        containerHeight = h;
        onResize();
    };
    window.addEventListener('resize', onResizeLayer);
    const onResizeFrame = (w: number, h: number) => {
        frameWidth = w;
        frameHeight = h;
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        gl.viewport(0, 0, frameWidth, frameHeight);
        onResize();
    };
    ci.events().onFrameSize(onResizeFrame);
    onResizeFrame(ci.width(), ci.height());
    let requestAnimationFrameId: number | null = null;
    let frame: Uint8Array | null = null;
    let frameFormat: number = 0;
    stats.begin();
    ci.events().onFrame((rgb: Uint8Array | null, rgba: Uint8Array | null) => {
        stats.end();
        stats.begin();
        frame = rgb!= null? rgb : rgba;
        frameFormat = rgb!= null? gl.RGB : gl.RGBA;
        if (requestAnimationFrameId === null) {
            requestAnimationFrameId = requestAnimationFrame(updateTexture);
        }
    });
    const updateTexture = () => {
        gl.texImage2D(gl.TEXTURE_2D, 0, frameFormat, frameWidth, frameHeight, 0, frameFormat, gl.UNSIGNED_BYTE, frame);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrameId = null;
        frame = null;
    };
    ci.events().onExit(() => {
        layers.removeEventListener("resize",onResizeLayer);
    });
}
// 将webGl函数添加到exports对象上，以便外部使用（在符合相应模块规范的场景下）
exports.webGl = webGl;

// 初始化着色器程序的函数，参数和返回值都有明确类型标注
function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string): WebGLProgram {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    if (!shaderProgram) throw new Error("sha")
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram));
    }
    return shaderProgram;
}

// 加载着色器的函数，参数和返回值也都有对应类型标注
function loadShader(gl: WebGLRenderingContext, shaderType: number, source: string): WebGLShader {
    const shader = gl.createShader(shaderType);
    if(!shader) throw new Error("no shader found")
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error("An error occurred compiling the shaders: " + info);
    }
    return shader;
}

// 初始化缓冲区的函数，传入合适类型的参数
function initBuffers(gl: WebGLRenderingContext, vertexPosition: GLint, textureCoord: GLint): void {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
        1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    const textureCoordinates = [
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
    gl.vertexAttribPointer(textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(textureCoord);
}