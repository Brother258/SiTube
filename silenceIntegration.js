document.addEventListener('DOMContentLoaded', function () {
    // Initialize variables ok
    let audioContext;
    let silenceDetectorNode;
    let isVideoPlaying = false;
    let resumeTimeout;

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
                        // Silence ended, dynamically adjust the delay before resuming the video
                        console.log('Silence ended at', timestamp);
                        const silenceDuration = performance.now() - timestamp * 1000;
                        const delay = Math.min(silenceDuration, 100); // Maximum delay of 100 milliseconds
                        clearTimeout(resumeTimeout);
                        resumeTimeout = setTimeout(() => {
                            if (!isVideoPlaying) {
                                videoPlayer.play().catch((error) => {
                                    console.error('Failed to resume video playback:', error);
                                });
                                isVideoPlaying = true;
                            }
                        }, delay);
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
});
