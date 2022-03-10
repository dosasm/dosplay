import { src, dest, series } from "gulp";

import del from "del";
import make from "./cmake";

import * as fs from "fs";
import * as path from "path";

import { error } from "./log";
import getRepoInfo from "git-repo-info";
import md5File from "md5-file";

import { execute } from "./execute"

// eslint-disable-next-line
const MD5 = require("md5.js");
// eslint-disable-next-line
const pjson = require("../package.json");

function clean() {
    return del(["dist/w*"], { force: true });
}

async function makeWasm() {
    return await make(".", "build/wasm",
                      "wlibzip",
                      "wdosbox",
                      "wdosbox.shared");
}

function copyAssets() {
    return src(["build/wasm/w*.js",
                "build/wasm/w*.wasm",
                "build/wasm/w*.symbols"])
        .pipe(dest("dist"));
}

interface FileSize {
    size: number,
    gzSize: number,
}

async function gzip(file: string) {
    await execute("gzip", "-kf9", file);
}

async function generateBuildInfo() {
    const info = getRepoInfo();
    if (info.sha === null) {
        error("Git repo not found, using '<not-a-git-repo>' as sha");
        info.sha = "<not-a-git-repo>";
    }
    const seed = Date.now();
    const md5Version = new MD5().update(pjson.version)
        .update(info.sha);

    const sizes: {[name: string]: FileSize} = {};
    const files = fs.readdirSync("build/wasm");
    for (const next of files) {
        if (!next.endsWith(".wasm")) {
            continue;
        }

        const wasmFile = path.join("build/wasm", next);
        const jsFile = wasmFile.replace(".wasm", ".js");

        const wasmGzPromise = gzip(wasmFile);
        const jsGzPromise = gzip(jsFile);

        await Promise.all([wasmGzPromise, jsGzPromise]);

        md5Version.update(md5File.sync(wasmFile + ".gz"));
        md5Version.update(md5File.sync(jsFile + ".gz"));

        sizes[path.basename(wasmFile)] = {
            size: fs.statSync(wasmFile).size,
            gzSize: fs.statSync(wasmFile + ".gz").size,
        };

        sizes[path.basename(jsFile)] = {
            size: fs.statSync(jsFile).size,
            gzSize: fs.statSync(jsFile + ".gz").size,
        };
    }


    const hex = md5Version
        .update(seed + "")
        .digest("hex");

    const sizesInfo = JSON.stringify(sizes, null, 4);
    fs.writeFileSync("src/build.ts", `
// Autogenerated
// -------------
// gulpfile.ts/wasm.ts --> generateBuildInfo

export const Build = {
    version: "${pjson.version} (${hex})",
    buildSeed: ${seed},${sizesInfo.substr(1, sizesInfo.length - 2)},
};
`);
}

export const wasm = series(clean, makeWasm, copyAssets, generateBuildInfo);
