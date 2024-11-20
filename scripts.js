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
      
      document.getElementById("playAudio").addEventListener("click", function () {
          if (!window.binarySequence) {
              alert("Please select and convert a file first!");
              return;
          }
      
          // Synthesize audio from binary sequence
          playBinaryAudio(window.binarySequence);
      });
      
      function playBinaryAudio(binarySequence) {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
          let time = audioCtx.currentTime; // Start time
          const duration = 0.5; // Duration of each tone (seconds)
      
          binarySequence.forEach(bit => {
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
      
              // Map '0' and '1' to frequencies (880 Hz for '1', 220 Hz for '0')
              const frequency = bit === "1" ? 880 : 220;
              oscillator.frequency.setValueAtTime(frequency, time);
      
              // Set up oscillator
              oscillator.type = "sine"; // Sine wave
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
      
              // Start and stop the oscillator
              oscillator.start(time);
              oscillator.stop(time + duration);
      
              // Increment time for the next tone
              time += duration;
          });
      }
      
