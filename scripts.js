// Define available waveforms and set the default
const waveforms = ["sine", "square", "triangle", "sawtooth"];
let currentWaveformIndex = 0;

// Define available note timings and set the default
const noteTimings = ["8n", "16n", "2n", "4n"];
let currentTimingIndex = 0;

// Trigger file input when the button is clicked
document.getElementById("fileInputButton").addEventListener("click", function () {
    document.getElementById("fileInput").click();
});

document.getElementById("fileInput").addEventListener("change", function () {
    const output = document.getElementById("output");
    const message = output.querySelector(".Message");
    if (message) message.remove();
    output.innerHTML = ""; // Clear the output

    if (this.files.length === 0) {
        alert("Please select a file!");
        return;
    }

    const file = this.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const content = event.target.result;

        let binarySequence = "";
        for (let i = 0; i < content.length; i++) {
            const byte = content[i].charCodeAt(0).toString(2).padStart(8, '0');
            binarySequence += byte + " ";  // Add a space to separate bytes for wrapping
        }

        // Wrap the entire sequence in a <pre> tag to maintain formatting and allow wrapping
        output.innerHTML = `<pre>${binarySequence}</pre>`;

        // Store binary sequence for playback
        window.binarySequence = binarySequence.split(' ');
    };

    reader.readAsText(file);
});

document.getElementById("stopAudio").addEventListener("click", function () {
    try {
        if (Tone.Transport.state === "started") {
            // Pause the playback if it's running
            Tone.Transport.pause();
            document.querySelector('.Light').style.background = ""; // Change light color to default
            this.textContent = "Resume";
        } else {
            // Resume the playback if it's paused
            Tone.Transport.start();
            document.querySelector('.Light').style.background = "#50c878";  // Change light color to green
            this.textContent = "Pause";
        }
    } catch (error) {
        console.error("Error toggling playback state:", error);
    }
});

// Change Tempo
document.getElementById("changeTempo").addEventListener("click", function () {
    currentTimingIndex = (currentTimingIndex + 1) % noteTimings.length;
    const currentTiming = noteTimings[currentTimingIndex];
    this.textContent = `${currentTiming}`;
});

// Change Waveform
document.getElementById("changeWaveform").addEventListener("click", function () {
    currentWaveformIndex = (currentWaveformIndex + 1) % waveforms.length;
    const currentWaveform = waveforms[currentWaveformIndex];
    this.textContent = `${currentWaveform}`;
});

document.getElementById("playAudio").addEventListener("click", async function () {
    try {
        if (Tone.context.state !== "running") {
            await Tone.start();
        }

        if (!window.binarySequence || window.binarySequence.length === 0) {
            alert("No binary sequence available! Load a file first.");
            return;
        }

        const binaryArray = window.binarySequence;
        const decimals = binaryArray.map(byte => parseInt(byte, 2)); // Convert binary to decimals
        const outputDiv = document.getElementById("output");

        // Reset the index to start from the beginning
        let index = 0;

        const synth = new Tone.Synth().toDestination();

        // Clear any previous transport or scheduled events
        Tone.Transport.stop();
        Tone.Transport.cancel();

        // Start the playback loop
        Tone.Transport.scheduleRepeat(time => {
            if (index < binaryArray.length) {
                const binaryValue = binaryArray[index];
                const decimalValue = decimals[index];


                //TEMPO CHANGE NOT WORKING YET
                // Handle tempo change based on binary values for 2, 4, 8, 16
                const tempoBinaries = {
                    "00000010": 0, // Binary for 2
                    "00000100": 1, // Binary for 4
                    "00000110": 2, // Binary for 6
                    "00001000": 3  // Binary for 8
                };
                if (tempoBinaries[binaryValue] !== undefined) {
                    const newTimingIndex = tempoBinaries[binaryValue];
                    if (currentTimingIndex !== newTimingIndex) {
                        currentTimingIndex = newTimingIndex;
                        console.log(`Tempo changed to ${noteTimings[currentTimingIndex]} based on binary ${binaryValue}`);
                        document.getElementById("changeTempo").textContent = `${newTimingIndex}`;
        
                        // Stop and re-schedule the playback loop
                        Tone.Transport.cancel();
                        Tone.Transport.scheduleRepeat(playbackLoop, noteTimings[currentTimingIndex]);
                    }
                }

                // Handle waveform change based on binary values for '!', '?', '.', ','
                const waveformBinaries = {
                    "00100001": "sine",     // Binary for '!'
                    "00111111": "square",   // Binary for '?'
                    "00101110": "triangle", // Binary for '.'
                    "00101100": "sawtooth"  // Binary for ','
                };
                if (waveformBinaries[binaryValue]) {
                    const newWaveform = waveformBinaries[binaryValue];
                    if (synth.oscillator.type !== newWaveform) {
                        synth.oscillator.type = newWaveform; // Update the waveform
                        console.log(`Waveform changed to ${newWaveform} based on binary ${binaryValue}`);
                        document.getElementById("changeWaveform").textContent = `${newWaveform}`;
                    }
                }

                // Skip playback for spaces (binary 00100000)
                if (binaryValue === "00100000") {
                    // Do nothing for spaces
                } else {
                    // Check if the decimal value is valid and within range
                    if (!isNaN(decimalValue) && decimalValue >= 21 && decimalValue <= 108) {
                        const note = Tone.Frequency(decimalValue % 88 + 21, "midi").toNote();
                        synth.triggerAttackRelease(note, noteTimings[currentTimingIndex], time);
                    }
                }

                // Highlight the current bit
                const bits = binaryValue.split('');
                const highlightedBit = bits.map((bit, i) => {
                    if (i === 0) {
                        return `<span class="current-bit">${bit}</span>`;
                    } else {
                        return bit;
                    }
                }).join('');

                // Update the output to reflect the bold current bit
                outputDiv.innerHTML = `<pre>${binaryArray.slice(0, index).join(' ')} ${highlightedBit} ${binaryArray.slice(index + 1).join(' ')}</pre>`;

                index++;
            } else {
                // Stop the transport and release the synth to prevent hanging notes
                Tone.Transport.stop();
                Tone.Transport.cancel();
                synth.triggerRelease();
                Tone.Transport.clear();

                console.log("Playback finished and stopped.");
            }
        }, noteTimings[currentTimingIndex]);

        // Start the transport
        Tone.Transport.start();
        document.querySelector('.Light').style.background = "#50c878";  // Change light color to green to indicate audio is playing
        document.getElementById("stopAudio").textContent = "Pause";

    } catch (error) {
        console.error("Error starting playback:", error);
    }
});