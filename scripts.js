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
            // Ensure binarySequence is available
            if (!window.binarySequence || window.binarySequence.length === 0) {
                alert("No binary sequence available! Load a file first.");
                return;
            }
        
            const binaryArray = window.binarySequence; // Array of 8-bit binary strings
            console.log(binaryArray);
        
            // Convert each binary string to a decimal number
            const decimals = binaryArray.map(byte => parseInt(byte, 2));
            console.log(decimals); // Outputs
        });
        