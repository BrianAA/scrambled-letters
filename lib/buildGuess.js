const fs = require("fs");
const path = require("path").resolve;
const Web3 = require("web3");
const BN = Web3.utils.BN;
let dictionaryHash = [];
let dictionaryHintHash = [];
let scrambledLetters = [];
let ID;
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
    const _wordToGuess = Math.floor(Math.random(), words.length);
    let _chars = words[_wordToGuess].split("");
    let _stringID = "";
    let _letters = [];
    for (let _char = 0; _char < _chars.length; _char++) {
      _stringID = _stringID + alphabet[_chars[_char]].key;
      _letters.push(alphabet[_chars[_char]].key);
    }
    const _mainID = parseInt(_stringID);
    ID = _mainID;
    const _hashID = Web3.utils.keccak256(new BN(_mainID));
    const _hints = CreateHints(_letters);
    const _scrambledLetters = ScrambleLetters(_letters);
    dictionaryHintHash.push(_hints);
    dictionaryHash.push(_hashID);
    scrambledLetters = _scrambledLetters;
  } catch (error) {
    console.log(error);
  }
}

//Only provides hints to first and last letter and the vowel
function CreateHints(_letters) {
  let _hints = [];
  for (let i = 0; i < _letters.length; i++) {
    if (CheckIfVowel(_letters[i]))
      for (let index = 0; index < _letters.length; index++) {
        let _hint = [0, 0, 0, 0, 0];
        _hint[index] = _letters[i];
        let _hashedHint = Web3.utils.keccak256(new BN(_hint));
        _hints.push(_hashedHint);
      }
  }
  return _hints;
}

function ScrambleLetters(_letters) {
  let _fullLetterSet = [];
  let _extraLetters = [];
  let _index = 0;
  while (_index < 3) {
    let _randomLetter = Math.floor(Math.random() * 26);

    _extraLetters.push(_randomLetter);
    _index++;
  }
  _fullLetterSet = [..._letters, ..._extraLetters];
  _index = _fullLetterSet.length;
  while (_index != 0) {
    const _randomIndex = Math.floor(Math.random() * _fullLetterSet.length);
    _index--;

    [_fullLetterSet[_index], _fullLetterSet[_randomIndex]] = [
      _fullLetterSet[_randomIndex],
      _fullLetterSet[_index],
    ];
  }
  return _fullLetterSet;
}

function CheckIfVowel(_letter) {
  switch (_letter) {
    case 1:
      //A
      return true;
    case 5:
      //E
      return true;
    case 9:
      //I
      return true;
    case 15:
      //O
      return true;
    case 21:
      //U
      return true;
    case 25:
      //Y
      return true;
    default:
      return false;
  }
}

async function writeFile() {
  try {
    console.log("...Creating Guess 🧠");
    await FormatWords();
    const Data = `
    export const ID=${JSON.stringify(ID)};
    export const word=${JSON.stringify(dictionaryHash)};
    export const scrambledLetters=${JSON.stringify(scrambledLetters)};
    export const hints=${JSON.stringify(dictionaryHintHash)};
    `;

    fs.mkdir(path(__dirname, "./src"), (err, data) => {
      fs.writeFile(
        path(__dirname, "./src/guessData.js"),
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
