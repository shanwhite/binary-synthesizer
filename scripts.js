function convertToBinaryApproach2(input) {
    let binaryResult = '';

    for (const char of input) {
        const codePoint = char.codePointAt(0);
        const binaryValue = codePoint.toString(2);
        binaryResult += 
            binaryValue.padStart(8, '0') + ' ';
    }

    return binaryResult.trim();
}

const inputString = "GFG";
const binaryRepresentation = 
      convertToBinaryApproach2(inputString);
console.log(binaryRepresentation);