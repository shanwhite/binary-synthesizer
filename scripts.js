// Define available waveforms and set the default
const waveforms = ["sine", "square", "triangle", "sawtooth"];
let currentWaveformIndex = 0;

// Define available note timings and set the default
const noteTimings = ["8n", "16n", "4n", "2n"];
let currentTimingIndex = 0;

document.getElementById("fileInput").addEventListener("change", function () {
    const output = document.getElementById("output");
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
            binarySequence += content[i].charCodeAt(0).toString(2).padStart(8, '0') + " ";
        }

        // Display binary sequence as plain text initially
        output.innerHTML = binarySequence.trim();

        // Store binary sequence for playback
        window.binarySequence = binarySequence.trim().split(" ");
    };

    reader.readAsText(file);
});

document.getElementById("stopAudio").addEventListener("click", function () {
    try {
        if (Tone.Transport.state === "started") {
            // Pause the playback if it's running
            Tone.Transport.pause();
            this.textContent = "Resume";
            console.log("Playback paused");
        } else {
            // Resume the playback if it's paused
            Tone.Transport.start();
            this.textContent = "Pause";
            console.log("Playback resumed");
        }
    } catch (error) {
        console.error("Error toggling playback state:", error);
    }
});

//tempo swap logic
document.getElementById("changeTempo").addEventListener("click", function () {
    currentTimingIndex = (currentTimingIndex + 1) % noteTimings.length;
    const currentTiming = noteTimings[currentTimingIndex];
    this.textContent = `Tempo: ${currentTiming}`;
});

//waveform swap logic
document.getElementById("changeWaveform").addEventListener("click", function () {
    currentWaveformIndex = (currentWaveformIndex + 1) % waveforms.length;
    const currentWaveform = waveforms[currentWaveformIndex];
    this.textContent = `Waveform: ${currentWaveform}`;
});

document.getElementById("playAudio").addEventListener("click", async function () {
    try {
        if (Tone.context.state !== "running") {
            await Tone.start();
            console.log("AudioContext started");
        }

        if (!window.binarySequence || window.binarySequence.length === 0) {
            alert("No binary sequence available! Load a file first.");
            return;
        }

        const binaryArray = window.binarySequence;
        const decimals = binaryArray.map(byte => parseInt(byte, 2));
        const outputDiv = document.getElementById("output");

        // Reset the index to start from the beginning
        let index = 0;

        const currentWaveform = waveforms[currentWaveformIndex];
        const synth = new Tone.Synth({
            oscillator: {
                type: currentWaveform
            }
        }).toDestination();

        const currentTiming = noteTimings[currentTimingIndex];

        // Clear any previous transport or scheduled events
        Tone.Transport.stop();
        Tone.Transport.cancel();

        // Start the playback loop
        Tone.Transport.scheduleRepeat(time => {
            if (index < decimals.length) {
                const value = decimals[index];
                const note = Tone.Frequency(value % 88 + 21, "midi").toNote();
                synth.triggerAttackRelease(note, currentTiming, time);

                // Highlight the current bit in the output div
                const highlightedOutput = binaryArray.map((bit, i) => {
                    return i === index ? `<b>${bit}</b>` : bit;
                }).join(" ");
                outputDiv.innerHTML = highlightedOutput;

                index++;
            } else {
                Tone.Transport.stop();
            }
        }, currentTiming);

        // Start the transport
        Tone.Transport.start();
    } catch (error) {
        console.error("Error starting playback:", error);
    }
});