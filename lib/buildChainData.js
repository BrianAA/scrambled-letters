const fs = require("fs");
const path = require("path").resolve;
const Web3 = require("web3");
const BN = Web3.utils.BN;
let chainDictionary = [];
const words = require("./dictionary");

const alphabet = {
  a: { key: 1, points: 1 },
  b: { key: 2, points: 3 },
  c: { key: 3, points: 3 },
  d: { key: 4, points: 2 },
  e: { key: 5, points: 1 },
  f: { key: 6, points: 4 },
  g: { key: 7, points: 2 },
  h: { key: 8, points: 4 },
  i: { key: 9, points: 1 },
  j: { key: 10, points: 8 },
  k: { key: 11, points: 5 },
  l: { key: 12, points: 1 },
  m: { key: 13, points: 3 },
  n: { key: 14, points: 1 },
  o: { key: 15, points: 1 },
  p: { key: 16, points: 3 },
  q: { key: 17, points: 10 },
  r: { key: 18, points: 1 },
  s: { key: 19, points: 1 },
  t: { key: 20, points: 1 },
  u: { key: 21, points: 1 },
  v: { key: 22, points: 4 },
  w: { key: 23, points: 4 },
  x: { key: 24, points: 8 },
  y: { key: 25, points: 4 },
  z: { key: 26, points: 10 },
};
writeFile();
async function FormatWords() {
  try {
    for (let i = 0; i < words.length; i++) {
      let _chars = words[i].split("");
      let _stringID = "";
      let _letters = [];
      for (let _char = 0; _char < _chars.length; _char++) {
        _stringID = _stringID + alphabet[_chars[_char]].key;
        _letters.push(alphabet[_chars[_char]].key);
      }
      const _mainID = parseInt(_stringID);
      chainDictionary.push(_mainID);
    }
  } catch (error) {
    console.log(error);
  }
}

async function writeFile() {
  try {
    console.log("... 🛠 Building Chain Data");
    await FormatWords();
    const Data = `
    const data=${JSON.stringify(chainDictionary)};

    `;

    fs.mkdir(path(__dirname, "./src"), (err, data) => {
      fs.writeFile(
        path(__dirname, "./src/chainData.js"),
        Data,
        "utf8",
        (err, data) => {
          if (err) {
            console.log(err);
          } else {
            console.log("file created");
          }
        }
      );
    });
  } catch (error) {
    console.log(error);
  }
}
