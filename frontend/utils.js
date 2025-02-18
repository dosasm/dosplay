const fs = require("fs")
const path = require("path")

function redirect_html(url, description) {
    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="0;url=${url}">
    <title>Redirect to ${description}</title>
</head>

<body>
    If you are not redirected automatically, 
    follow <a href="${url}">this link</a>.
    <footer>
    ${new Date()}
    </footer>
</body>

</html>`
}


function shims(isProduction, outdir = "shims") {
    const outputdir = path.resolve(__dirname, outdir)
    if (!fs.existsSync(outputdir)) {
        fs.mkdirSync(outputdir)
    }
    const url = isProduction ? "http://dosasm.github.io/dosplay/":"http://localhost:8080/";

    const result = []
    const urlObj = new URL(url)
    const params = urlObj.searchParams;
    params.set("emu", "xDirect")
    params.set("bundle", "TASM")
    params.set("open", "/C/assembly/LeiJun/run.bat")
    params.set("run_cmd", "batch")

    const u = urlObj.toString()
    result.push(u)
    const html = redirect_html(u, "LeiJun's RAMinit")
    if(isProduction){
        fs.writeFileSync(path.resolve(outputdir, "RAMinit.html"), html)
    }else{
        console.log(u)
    }
}

module.exports = {
    shims
}


