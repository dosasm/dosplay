# Dosplay: Run old DOS code in your browser

Dosplay is a work-in-progress project to run old DOS code in your browser.
It's 

- a js-dos bundle editor to edit your old dos game and softwares
- a online compiler for Assembly and Turbo C, feel free to add more software in the `assembly-tools` folder.

This project will not work without js-dos's port of dosbox(x) to wasm.
Thanks to [caiiiycuk/js-dos](https://github.com/caiiiycuk/js-dos/).

- [ ] hide the emscripten FS and only expose the DOSBox FS
- [x] use indexdb to store history

## Supported Urlparams

TO run assembly quickly we have parameter as follows.
A intuitive example is run famous Lei Jun's RAMinit(RI) with
 <http://dosasm.github.io/dosplay/RAMinit>.
(Note must use dosboxX. Dosbox may cause problem)

- `emu`: the emulation type, can be
    - `dosboxDirect` or `dosboxWorker`
    - `xDirect` or `xWorkder`
- `bundle`: the bundle file name, the site hosted following bundles
    - `MASM-v6.11`: 
    - `MASM-v5.00`: 
    - `TASM`:   Turbo Assembly compiler
    - `TurboC`: A Turbo C compiler
- `start`: start the js-dos emulator, specify `false` to disable auto start

Also, we have paramenters about editor.

- `open`: the path to open in the editor
- `content`: the content to write to the editor
-  `bc`: the base64 content to write to the editor
- `run_cmd`: the command to run

## supported commands

We use `/.jsdos/button_commands.bat` to define the commands to run.
If the current editor's file is ends with `supported_ext`.
we will run the editor's editing code, otherwise `default_file` is used.
The webapp first change directory to the file's parent folder and run the code
with `main` replaced to the basename.




