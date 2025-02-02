const fontkit = require("fontkit");
const path = require("path");

/**
 * Generate correct character widths for a font
 * @param {string} fontPath - Path to the font file
 * @param {Object} charWidths - Object containing characters and their placeholder widths
 * @returns {Promise<Object>} - A promise that resolves to the correct character widths
 */
async function generateCharWidths(fontPath, charWidths) {
  return new Promise((resolve, reject) => {
    // Load the font file
    const font = fontkit.openSync(fontPath);

    const updatedWidths = {};
    const unitsPerEm = font.unitsPerEm; // Get font's units per EM

    // Process each character in the input object
    Object.keys(charWidths).forEach((char) => {
      const glyph = font.glyphForCodePoint(char.codePointAt(0));
      const pixelWidth = (glyph.advanceWidth / unitsPerEm) * 1000; // Convert to pixels
      updatedWidths[char] = parseFloat(pixelWidth.toFixed(2)); // Round to 2 decimals
    });

    resolve(updatedWidths);
  });
}

// Example usage
(async () => {
  const fontPath = path.join(__dirname, "Helvetica-Light-05 (1).ttf"); // Path to your font file
  const helveticaCharWidths = {
    a: 7.37,
    b: 8.19,
    c: 7.01,
    d: 8.19,
    e: 7.87,
    f: 4.65,
    g: 8.19,
    h: 8.19,
    i: 3.73,
    j: 3.73,
    k: 7.01,
    l: 3.73,
    m: 11.28,
    n: 8.19,
    o: 8.19,
    p: 8.19,
    q: 8.19,
    r: 4.65,
    s: 6.54,
    t: 4.65,
    u: 8.19,
    v: 7.01,
    w: 10.46,
    x: 7.01,
    y: 7.01,
    z: 6.54,
    A: 9.33,
    B: 9.33,
    C: 10.46,
    D: 10.46,
    E: 9.33,
    F: 8.19,
    G: 11.28,
    H: 10.46,
    I: 3.73,
    J: 7.01,
    K: 9.33,
    L: 8.19,
    M: 12.73,
    N: 10.46,
    O: 11.28,
    P: 9.33,
    Q: 11.28,
    R: 9.33,
    S: 8.19,
    T: 8.19,
    U: 10.46,
    V: 9.33,
    W: 12.73,
    X: 9.33,
    Y: 9.33,
    Z: 8.19,
    " ": 3.73,
    ".": 3.73,
    ",": 3.73,
    "!": 3.73,
    "?": 7.01,
    "-": 4.65,
    _: 7.01,
    ":": 3.73,
    ";": 3.73,
    "'": 2.36,
    '"': 4.65,
    "(": 4.65,
    ")": 4.65,
    "[": 4.65,
    "]": 4.65,
    "{": 4.65,
    "}": 4.65,
    "/": 4.65,
    "\\": 4.65,
    "|": 3.73,
    "+": 7.01,
    "=": 7.01,
    "<": 7.01,
    ">": 7.01,
    "@": 12.73,
    "#": 7.01,
    $: 7.01,
    "%": 11.28,
    "^": 4.65,
    "&": 10.46,
    "*": 5.83,
    "`": 3.73,
    "~": 7.01,
    0: 4.25,
    1: 4.65,
    2: 4.65,
    3: 4.65,
    4: 4.65,
    5: 4.65,
    6: 4.65,
    7: 4.65,
    8: 4.65,
    9: 4.65,
    " ": 4,
  };

  try {
    const correctedWidths = await generateCharWidths(
      fontPath,
      helveticaCharWidths
    );
    console.log("Corrected Character Widths:", correctedWidths);
  } catch (err) {
    console.error("Error generating character widths:", err);
  }
})();
