# Dosplay: Run old DOS code in your browser

Dosplay is a work-in-progress project to run old DOS code in your browser.
It's 

- a js-dos bundle editor to edit your old dos game and softwares
- a online compiler for Assembly and Turbo C, feel free to add more software in the `assembly-tools` folder.

This project will not work without js-dos's port of dosbox(x) to wasm.
Thanks to [caiiiycuk/js-dos](https://github.com/caiiiycuk/js-dos/).

## Supported Urlparams

- `emu`: the emulation type, can be
    - `dosboxDirect` or `dosboxWorker`
    - `XDirect` or `XWorkder`
- `bundle`: the bundle file name, the site hosted following bundles
    - `MASM-v6.11`: 
    - `MASM-v5.00`: 
    - `TASM`:   Turbo Assembly compiler
    - `TurboC`: A Turbo C compiler
- `start`: start the js-dos emulator

If you specified the following parameter collection, 
the js-dos emulator will be started automatically.
Following two parameters will write the content to the path.
Parameter `content` can be replace to `bc` for a base64 string.

- `content`: the content to write to the editor
- `write`: the path for the content


