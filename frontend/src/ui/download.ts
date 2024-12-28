export function download(data: Uint8Array, filename: string) {
    const blob = new Blob([data], { type: 'text/plain' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

export function downloadString(data: string, filename: string) {
    download(new TextEncoder().encode(data), filename);
}