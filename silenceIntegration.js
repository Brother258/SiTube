document.addEventListener('DOMContentLoaded', function () {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Check if the SilenceDetectorProcessor.js module is available
    if ('audioWorklet' in audioContext) {
        audioContext.audioWorklet.addModule('SilenceDetectorProcessor.js').then(() => {
            const silenceDetectorNode = new AudioWorkletNode(audioContext, 'SilenceDetectorProcessor');
            const source = audioContext.createMediaElementSource(videoPlayer);
            source.connect(silenceDetectorNode).connect(audioContext.destination);

            let isVideoPlaying = false; // Track video playback state

            silenceDetectorNode.port.onmessage = (event) => {
                const [type, timestamp] = event.data;
                if (type === 0) {
                    // Silence started, stop the video immediately
                    console.log('Silence started at', timestamp);
                    if (isVideoPlaying) {
                        videoPlayer.pause();
                        isVideoPlaying = false;
                    }
                } else if (type === 1) {
                    // Silence ended, resume the video immediately
                    console.log('Silence ended at', timestamp);
                    if (!isVideoPlaying) {
                        videoPlayer.play();
                        isVideoPlaying = true;
                    }
                }
            };
        });
    }
});
