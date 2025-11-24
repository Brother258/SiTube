/**
 * Skip Logic Module
 * * Implements "Skip Silence" functionality for HTML5 Video elements.
 * * Usage: 
 * 1. Include this script in your page.
 * 2. Play a video.
 * 3. Press Alt+S to open the settings dialog.
 */

(function() {
    // --- Configuration State ---
    const state = {
        isEnabled: false,
        threshold: 15,          // Volume threshold (0-100)
        silenceSpeed: 2.5,      // Speed when silent
        normalSpeed: 1.0,       // Speed when sound is detected
        sampleThreshold: 10,    // How many frames to wait before switching (prevents jitter)
        
        // Internal
        audioContext: null,
        analyser: null,
        source: null,
        mediaElement: null,
        isSetup: false,
        silenceCounter: 0,
        soundCounter: 0,
        currentVolume: 0,
        loopId: null
    };

    // --- UI Construction ---
    let uiContainer = null;

    function createUI() {
        if (document.getElementById('skip-silence-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'skip-silence-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background: rgba(20, 20, 20, 0.95);
            color: white;
            padding: 20px;
            border-radius: 12px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            z-index: 99999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            border: 1px solid #333;
            display: none;
        `;

        const title = document.createElement('h3');
        title.innerText = 'Skip Silence Settings';
        title.style.margin = '0 0 15px 0';
        title.style.fontSize = '16px';
        title.style.borderBottom = '1px solid #444';
        title.style.paddingBottom = '10px';

        // --- Controls ---
        
        // 1. Enable Toggle
        const toggleRow = createControlRow('Enable Skipping');
        const toggleBtn = document.createElement('button');
        toggleBtn.innerText = state.isEnabled ? 'ON' : 'OFF';
        toggleBtn.style.cssText = `
            background: ${state.isEnabled ? '#28a745' : '#dc3545'};
            color: white;
            border: none;
            padding: 5px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        `;
        toggleBtn.onclick = () => {
            state.isEnabled = !state.isEnabled;
            toggleBtn.innerText = state.isEnabled ? 'ON' : 'OFF';
            toggleBtn.style.background = state.isEnabled ? '#28a745' : '#dc3545';
            if (state.isEnabled) startProcessing();
        };
        toggleRow.appendChild(toggleBtn);

        // 2. Volume Threshold Slider
        const threshRow = createControlRow('Volume Threshold');
        const threshInput = document.createElement('input');
        threshInput.type = 'range';
        threshInput.min = '1';
        threshInput.max = '100';
        threshInput.value = state.threshold;
        threshInput.style.width = '100%';
        threshInput.oninput = (e) => {
            state.threshold = parseInt(e.target.value);
            threshVal.innerText = state.threshold + '%';
        };
        const threshVal = document.createElement('span');
        threshVal.innerText = state.threshold + '%';
        threshVal.style.fontSize = '12px';
        threshVal.style.color = '#aaa';
        threshRow.appendChild(threshInput);
        threshRow.appendChild(threshVal);

        // 3. Silence Speed Input
        const speedRow = createControlRow('Silence Speed (x)');
        const speedInput = document.createElement('input');
        speedInput.type = 'number';
        speedInput.step = '0.1';
        speedInput.min = '1.0';
        speedInput.value = state.silenceSpeed;
        speedInput.style.cssText = 'width: 60px; background: #333; border: 1px solid #555; color: white; padding: 4px; border-radius: 4px;';
        speedInput.onchange = (e) => state.silenceSpeed = parseFloat(e.target.value);
        speedRow.appendChild(speedInput);

        // 4. VU Meter (Visualizer)
        const meterContainer = document.createElement('div');
        meterContainer.style.cssText = 'margin-top: 15px; height: 10px; background: #333; border-radius: 5px; overflow: hidden; position: relative;';
        const meterBar = document.createElement('div');
        meterBar.id = 'skip-silence-meter';
        meterBar.style.cssText = 'height: 100%; width: 0%; background: #007bff; transition: width 0.1s;';
        
        // Threshold Marker
        const marker = document.createElement('div');
        marker.id = 'skip-silence-marker';
        marker.style.cssText = `position: absolute; top: 0; bottom: 0; width: 2px; background: red; left: ${state.threshold}%;`;
        
        meterContainer.appendChild(meterBar);
        meterContainer.appendChild(marker);

        // Current Status Text
        const statusText = document.createElement('div');
        statusText.id = 'skip-silence-status';
        statusText.innerText = 'Status: Idle';
        statusText.style.cssText = 'margin-top: 10px; font-size: 12px; color: #888; text-align: right;';

        // Append all
        overlay.appendChild(title);
        overlay.appendChild(toggleRow);
        overlay.appendChild(threshRow);
        overlay.appendChild(speedRow);
        overlay.appendChild(meterContainer);
        overlay.appendChild(statusText);

        document.body.appendChild(overlay);
        uiContainer = overlay;

        // Listener to update marker position when threshold changes
        threshInput.addEventListener('input', () => {
             marker.style.left = state.threshold + '%';
        });
    }

    function createControlRow(label) {
        const div = document.createElement('div');
        div.style.marginBottom = '10px';
        const lbl = document.createElement('div');
        lbl.innerText = label;
        lbl.style.fontSize = '13px';
        lbl.style.marginBottom = '4px';
        lbl.style.color = '#ccc';
        div.appendChild(lbl);
        return div;
    }

    // --- Audio Logic ---

    function attachToVideo() {
        if (state.isSetup) return true;

        const video = document.querySelector('video');
        if (!video) return false;

        // Try to prevent CORS issues if the video is from a CDN
        try {
            if (!video.crossOrigin) video.crossOrigin = "anonymous";
        } catch (e) {
            console.warn("Skip Silence: Could not set crossOrigin. Audio analysis might fail if video is external.");
        }

        // Initialize Audio Context
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            state.audioContext = new AudioContext();
            state.analyser = state.audioContext.createAnalyser();
            state.analyser.fftSize = 256; // Small FFT size for performance

            // Create source from video
            state.source = state.audioContext.createMediaElementSource(video);
            
            // Connect: Source -> Analyser -> Destination (Speakers)
            state.source.connect(state.analyser);
            state.analyser.connect(state.audioContext.destination);

            state.mediaElement = video;
            state.isSetup = true;
            return true;
        } catch (err) {
            console.error("Skip Silence Error:", err);
            return false;
        }
    }

    function calculateVolume(buffer) {
        let sum = 0;
        // RMS (Root Mean Square) calculation
        for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i] * buffer[i];
        }
        return Math.sqrt(sum / buffer.length);
    }

    function updateLogic() {
        if (!state.isEnabled || !state.isSetup) return;

        // Ensure Context is running (browsers suspend it sometimes)
        if (state.audioContext.state === 'suspended') {
            state.audioContext.resume();
        }

        const bufferLength = state.analyser.fftSize;
        const dataArray = new Float32Array(bufferLength);
        state.analyser.getFloatTimeDomainData(dataArray);

        // Get volume (0.0 to 1.0 approx)
        let vol = calculateVolume(dataArray);
        
        // Convert to percentage (0-100) and boost slightly for better detection
        let volPercent = vol * 200; 
        if (volPercent > 100) volPercent = 100;
        
        state.currentVolume = volPercent;

        // Update UI Meter
        const meter = document.getElementById('skip-silence-meter');
        if (meter) meter.style.width = volPercent + '%';

        const status = document.getElementById('skip-silence-status');

        // Logic with Hysteresis
        if (volPercent < state.threshold) {
            // Potential Silence
            state.silenceCounter++;
            state.soundCounter = 0;

            if (state.silenceCounter > state.sampleThreshold) {
                // Confirmed Silence
                if (state.mediaElement.playbackRate !== state.silenceSpeed) {
                    state.mediaElement.playbackRate = state.silenceSpeed;
                    if (status) {
                        status.innerText = `Skipping Silence (${state.silenceSpeed}x)`;
                        status.style.color = '#28a745';
                    }
                }
            }
        } else {
            // Potential Sound
            state.soundCounter++;
            state.silenceCounter = 0;

            if (state.soundCounter > 2) { // Recover faster than we skip
                // Confirmed Sound
                if (state.mediaElement.playbackRate !== state.normalSpeed) {
                    state.mediaElement.playbackRate = state.normalSpeed;
                    if (status) {
                        status.innerText = `Normal Playback (${state.normalSpeed}x)`;
                        status.style.color = '#fff';
                    }
                }
            }
        }

        state.loopId = requestAnimationFrame(updateLogic);
    }

    function startProcessing() {
        if (!state.isSetup) {
            const success = attachToVideo();
            if (!success) {
                alert("No video element found on this page.");
                state.isEnabled = false;
                return;
            }
        }
        
        if (state.loopId) cancelAnimationFrame(state.loopId);
        updateLogic();
    }

    // --- Key Listener ---
    document.addEventListener('keydown', (e) => {
        // Alt + S
        if (e.altKey && (e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            createUI();
            
            if (uiContainer.style.display === 'none') {
                uiContainer.style.display = 'block';
                // Initialize audio context on user gesture if needed
                if (!state.isSetup) attachToVideo();
            } else {
                uiContainer.style.display = 'none';
            }
        }
    });

    console.log("Skip Logic Loaded. Press Alt+S to configure.");

})();
