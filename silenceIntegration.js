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
                        // Silence started, stop the video if the duration is more than 1 second
                        console.log('Silence started at', timestamp);
                        if (isVideoPlaying) {
                            clearTimeout(resumeTimeout);
                            resumeTimeout = setTimeout(() => {
                                videoPlayer.pause();
                                isVideoPlaying = false;
                            }, 1000); // Pause if silence duration is more than 1 second
                        }
                    } else if (type === 1) {
                        // Silence ended, resume the video immediately
                        console.log('Silence ended at', timestamp);
                        clearTimeout(resumeTimeout);
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
});
