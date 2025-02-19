export type Action={
    fileext?: Array<string>;
    filematch?:Array<string>
    cmd: Array<string>;
}

export type Actions = {
    open: string|undefined;
    actions: {[id:string]:Action|Array<Action>}
};

export type BundleInfo={
    build_time:number
    bundles:Array<{name:string,filepath:string,hash:string,dosplay?:Actions}>
}