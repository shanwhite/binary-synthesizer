function convert() {
    var  output=document.getElementById("fileOutput");  
    var input=document.getElementById("fileInput").value;
      output.value = "";
      for (i=0; i < input.length; i++) {
           output.value +=input[i].charCodeAt(0).toString(2) + " ";
      }
  }