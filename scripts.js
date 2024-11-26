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
      document.getElementById("stopAudio").addEventListener("click", function () {
        try {
            // Stop all currently scheduled or ongoing audio
            Tone.Transport.stop();
            console.log("Playback stopped");
        } catch (error) {
            console.error("Error stopping playback:", error);
        }
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
    
            //playback control
            const synth = new Tone.Synth().toDestination();
            let index = 0;
    
            // Create a Tone.Transport loop to play notes
            Tone.Transport.scheduleRepeat(time => {
                if (index < decimals.length) {
                    const value = decimals[index];
                    const note = Tone.Frequency(value % 88 + 21, "midi").toNote();
                    synth.triggerAttackRelease(note, "8n", time);
                    index++;
                } else {
                    Tone.Transport.stop(); // Stop Transport when done
                }
            }, "8n");
    
            // Start the transport
            Tone.Transport.start();
        } catch (error) {
            console.error("Error starting playback:", error);
        }
    });
    
    