document.addEventListener('DOMContentLoaded', function () {
    // Initialize variables
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
                        // Silence ended, add a very short delay before resuming the video
                        console.log('Silence ended at', timestamp);
                        clearTimeout(resumeTimeout);
                        resumeTimeout = setTimeout(() => {
                            if (!isVideoPlaying) {
                                videoPlayer.play().catch((error) => {
                                    console.error('Failed to resume video playback:', error);
                                });
                                isVideoPlaying = true;
                            }
                        }, 100); // Adjust the delay (in milliseconds) as needed
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
