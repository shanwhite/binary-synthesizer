          document.getElementById("fileInput").addEventListener("change", function () {
          const output = document.getElementById("output");
          output.value = "";
      
          //no input handler
          if (this.files.length === 0) {
              alert("Please select a file!");
              return;
          }
      
          const file = this.files[0];
          const reader = new FileReader();
      
          // Event handler for file read
          reader.onload = function (event) {
              const content = event.target.result; // File content as a string
      
              // Convert content to binary
              let binarySequence = "";
              for (let i = 0; i < content.length; i++) {
                  binarySequence += content[i].charCodeAt(0).toString(2).padStart(8, '0') + " ";
              }
              output.value = binarySequence.trim();
      
              // Store binary sequence for audio synthesis
              window.binarySequence = binarySequence.trim().split(" ");
          };
      
          // Read the file as text
          reader.readAsText(file);
      });
      document.getElementById("playAudio").addEventListener("click", async function () {
        try {
            // Ensure the AudioContext is resumed on user gesture
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
    
            // Example audio synthesis using Tone.js
            const synth = new Tone.Synth().toDestination();
    
            // Play a sequence of notes based on the decimal values
            let time = 0;
            decimals.forEach(value => {
                const note = Tone.Frequency(value % 88 + 21, "midi").toNote(); // Map decimals to MIDI range
                synth.triggerAttackRelease(note, "8n", Tone.now() + time);
                time += 0.5; // Increment time for the next note
            });
        } catch (error) {
            console.error("Error starting the AudioContext:", error);
        }
    });
    