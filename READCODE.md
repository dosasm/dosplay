# 源码阅读

## 编译代码

see [.github/workflows/build.js.yml](.github/workflows/build.js.yml), [Dockerfile](./Dockerfile)

```bash
sudo apt install ninja-build

mkdir -p ~/sys
cd ~/sys
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk 

## emsdk install 这一步开代理会快一些，不开的话就玄学了，可能无法下载
url=http://192.168.1.167:7899
export http_proxy=$url;
export https_proxy=$url
./emsdk install 3.1.61
./emsdk activate 3.1.61
# 安装作者的优化器
wget https://github.com/caiiiycuk/binaryen-fwasm-exceptions/releases/download/version_117_e/binaryen-version_117_e-x86_64-linux.tar.gz
tar xfv binaryen-version_117_e-x86_64-linux.tar.gz
cp -v binaryen-version_117_e/bin/wasm-opt ./upstream/bin/wasm-opt

source ./emsdk/emsdk_env.sh 
yarn config set registry https://registry.npmmirror.com/

npm install -g http-server yarn

# 子模块编译
cd native/sockdrive/js 
yarn
yarn run webpack 
cd ../../..

# 主程序编译
yarn run tsc --noemit
yarn run gulp production


#来自docker的命令
cd -
yarn
yarn run gulp wasm
yarn run gulp 

#测试
http-server dist
#http://127.0.0.1:8080
```