document.addEventListener('DOMContentLoaded', function () {
    // Initialize variables
    let audioContext;
    let silenceDetectorNode;
    let isVideoPlaying = false;
    let resumeTimeout;

    // Set the threshold for silence duration (in milliseconds)
    const silenceThreshold = 1000; // 1 second

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
                        // Silence started, stop the video only if the duration is greater than the threshold
                        console.log('Silence started at', timestamp);
                        if (isVideoPlaying && performance.now() - timestamp * 1000 > silenceThreshold) {
                            videoPlayer.pause();
                            isVideoPlaying = false;
                        }
                    } else if (type === 1) {
                        // Silence ended, resume the video immediately
                        console.log('Silence ended at', timestamp);
                        clearTimeout(resumeTimeout);
                        resumeTimeout = setTimeout(() => {
                            if (!isVideoPlaying) {
                                videoPlayer.play().catch((error) => {
                                    console.error('Failed to resume video playback:', error);
                                });
                                isVideoPlaying = true;
                            }
                        }, 0); // Set delay to 0 milliseconds
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
