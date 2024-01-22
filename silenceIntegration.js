document.addEventListener('DOMContentLoaded', function () {
    // Initialize variables
    let audioContext;
    let silenceDetectorNode;
    let isVideoPlaying = false;
    let audioBuffer = null;

    // Function to create AudioContext and set up SilenceDetectorNode
    function initializeAudioContext() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Check if the SilenceDetectorProcessor.js module is available
        if ('audioWorklet' in audioContext) {
            audioContext.audioWorklet.addModule('SilenceDetectorProcessor.js').then(() => {
                silenceDetectorNode = new AudioWorkletNode(audioContext, 'SilenceDetectorProcessor');
                const source = audioContext.createMediaElementSource(videoPlayer);
                source.connect(silenceDetectorNode).connect(audioContext.destination);

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
                        // Silence ended, play back buffered audio
                        console.log('Silence ended at', timestamp);
                        if (audioBuffer) {
                            const audioBufferSource = audioContext.createBufferSource();
                            audioBufferSource.buffer = audioBuffer;
                            audioBufferSource.connect(audioContext.destination);
                            audioBufferSource.start();
                        }
                        // Reset the buffer
                        audioBuffer = null;

                        // Resume the video
                        if (!isVideoPlaying) {
                            videoPlayer.play().catch((error) => {
                                console.error('Failed to resume video playback:', error);
                            });
                            isVideoPlaying = true;
                        }
                    }
                };
            });
        }
    }

    // Check if the user interacts with the page
    document.addEventListener('click', () => {
        // If the AudioContext is not created, initialize it
        if (!audioContext) {
            initializeAudioContext();
        }
    });

    // Buffer audio when video is loaded
    videoPlayer.addEventListener('loadeddata', () => {
        const duration = 1; // Adjust the duration of the audio buffer as needed
        const audioData = videoPlayer.captureStream().getAudioTracks()[0].applyConstraints({ sampleSize: 16 }).onended;
        const offlineAudioContext = new OfflineAudioContext(1, audioData.length, audioContext.sampleRate);
        const bufferSource = offlineAudioContext.createBufferSource();
        bufferSource.buffer = offlineAudioContext.createBuffer(1, audioData.length, audioContext.sampleRate);
        bufferSource.buffer.copyToChannel(new Float32Array(audioData), 0);
        bufferSource.connect(offlineAudioContext.destination);
        bufferSource.start();
        offlineAudioContext.startRendering().then((renderedBuffer) => {
            audioBuffer = renderedBuffer;
        });
    });
});
