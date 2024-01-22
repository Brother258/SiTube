(() => {
    "use strict";

    class SilenceDetectorProcessor extends AudioWorkletProcessor {
        constructor(...args) {
            super(...args);
            this.keepAlive = true;
            this.port.onmessage = (event) => {
                if (event.data === "destroy") {
                    this.keepAlive = false;
                }
            };
        }

        static get parameterDescriptors() {
            return [
                { name: "volumeThreshold", defaultValue: 1000, minValue: 0, maxValue: 1, automationRate: "k-rate" },
                { name: "durationThreshold", minValue: 1000, automationRate: "k-rate" }
            ];
        }

        isPastDurationThreshold(duration) {
            return currentTime >= this._lastLoudSampleTime + duration;
        }

        process(inputs, outputs, parameters) {
            const volumeThreshold = parameters.volumeThreshold[0];
            const audioData = inputs[0][0];

            if (audioData.length === 0) {
                this._lastLoudSampleTime = currentTime;
                return this.keepAlive;
            }

            const samples = audioData.length;

            for (let sampleIndex = 0; sampleIndex < samples; sampleIndex++) {
                const sampleValue = audioData[sampleIndex];

                if (sampleValue >= volumeThreshold) {
                    this._lastLoudSampleTime = currentTime;

                    if (this._lastTimePostedSilenceStart) {
                        // Silence ended, send a message
                        const message = [1, currentTime];
                        this.port.postMessage(message);
                        this._lastTimePostedSilenceStart = false;
                    }
                } else if (!this._lastTimePostedSilenceStart && this.isPastDurationThreshold(parameters.durationThreshold[0])) {
                    // Silence started, send a message
                    const message = [0, currentTime];
                    this.port.postMessage(message);
                    this._lastTimePostedSilenceStart = true;
                }
            }

            return this.keepAlive;
        }
    }

    registerProcessor("SilenceDetectorProcessor", SilenceDetectorProcessor);
})();
