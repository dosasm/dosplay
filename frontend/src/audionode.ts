class SamplesQueue {
    private samplesQueue: number[][] = [];

    push(samples: number[]) {
        this.samplesQueue.push(samples);
    }

    length(): number {
        let total = 0;
        for (let i = 0; i < this.samplesQueue.length; i++) {
            total += this.samplesQueue[i].length;
        }
        return total;
    }

    writeTo(dst: Float32Array, bufferSize: number) {
        let writeIt = 0;
        while (this.samplesQueue.length > 0) {
            let src = this.samplesQueue[0];
            let toRead = Math.min(bufferSize - writeIt, src.length);
            if (toRead === src.length) {
                dst.set(src, writeIt);
                this.samplesQueue.shift();
            } else {
                dst.set(src.slice(0, toRead), writeIt);
                this.samplesQueue[0] = src.slice(toRead);
            }
            writeIt += toRead;
            if (writeIt === bufferSize) {
                break;
            }
        }
        if (writeIt < bufferSize) {
            dst.fill(0, writeIt);
        }
    }
}

export function audioNode(ci: any) {
    const sampleRate = ci.soundFrequency();
    const channels = 1;
    if (sampleRate === 0) {
        console.warn("Can't create audio node with sampleRate === 0, ignoring");
        return;
    }
    let audioContext: AudioContext | null = null;
    if (typeof AudioContext!== "undefined") {
        audioContext = new AudioContext({
            sampleRate: sampleRate,
            latencyHint: "interactive"
        });
    } 
    if (audioContext === null) {
        return;
    }
    const samplesQueue = new SamplesQueue();
    const bufferSize = 2048;
    const preBufferSize = 2048;
    ci.events().onSoundPush((samples: number[]) => {
        if (samplesQueue.length() < bufferSize * 2 + preBufferSize) {
            samplesQueue.push(samples);
        }
    });
    const audioNode = audioContext.createScriptProcessor(bufferSize, 0, channels);
    let started = false;
    let active = 0;
    const onQueueProcess = (event: AudioProcessingEvent) => {
        const numFrames = event.outputBuffer.length;
        const numChannels = event.outputBuffer.numberOfChannels;
        const samplesCount = samplesQueue.length();
        if (!started) {
            started = samplesCount >= preBufferSize;
        }
        if (!started) {
            return;
        }
        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = event.outputBuffer.getChannelData(channel);
            samplesQueue.writeTo(channelData, numFrames);
        }
    };
    audioNode.onaudioprocess = onQueueProcess;
    audioNode.connect(audioContext.destination);
    const resumeWebAudio = () => {
        if (audioContext!== null && audioContext.state === "suspended") {
            audioContext.resume();
        }
    };
    document.addEventListener("click", resumeWebAudio, { once: true });
    document.addEventListener("touchstart", resumeWebAudio, { once: true });
    document.addEventListener("keydown", resumeWebAudio, { once: true });
    ci.events().onExit(() => {
        if (audioContext!== null) {
            audioNode.disconnect();
            audioContext.close();
        }
        document.removeEventListener("click", resumeWebAudio);
        document.removeEventListener("touchstart", resumeWebAudio);
        document.removeEventListener("keydown", resumeWebAudio);
    });
}