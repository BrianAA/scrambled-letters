// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const Web3 = require("web3");
const BN = Web3.utils.BN;
const words = require("../../lib/scrambledDictionary");

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

async function GenerateWord(index) {
  try {
    if (index > words.length && index >= 0) throw Error;
    let _chars = words[index].split("");
    let _stringID = "";
    let _letters = [];
    for (let _char = 0; _char < _chars.length; _char++) {
      _stringID = _stringID + alphabet[_chars[_char]].key;
      _letters.push(alphabet[_chars[_char]].key);
    }
    const _mainID = parseInt(_stringID);
    const _hashID = Web3.utils.keccak256(new BN(_mainID));
    const _hints = [];

    for (let i = 0; i < _letters.length; i++) {
      _hints.push({ id: i + 1, letter: _letters[i] });
    }
    return {
      success: true,
      hashID: _stringID,
      hashHints: _hints,
      scrambledLetters: await ScrambleLetters(_letters),
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: error,
    };
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

async function ScrambleLetters(_letters) {
  let _fullLetterSet = [];
  let _extraLetters = [];
  let _FinalLetterSet = [];
  let _index = 0;

  while (_index < 5) {
    let _randomLetter = Math.floor(Math.random() * 26);
    while (_letters.includes(_randomLetter) || _randomLetter == 0) {
      _randomLetter = Math.floor(Math.random() * 26);
    }
    _extraLetters.push(_randomLetter);
    _index++;
  }
  _fullLetterSet = [..._letters, ..._extraLetters];
  _index = _fullLetterSet.length;
  while (_index != 0) {
    const _randomIndex = Math.floor(Math.random() * _fullLetterSet.length);
    if (_fullLetterSet[_randomIndex] != _fullLetterSet[_index]) {
      _index--;
    }

    [_fullLetterSet[_index], _fullLetterSet[_randomIndex]] = [
      _fullLetterSet[_randomIndex],
      _fullLetterSet[_index],
    ];
  }
  for (let i = 0; i < _fullLetterSet.length; i++) {
    _FinalLetterSet.push({ id: i + 1, letter: _fullLetterSet[i] });
  }
  return _FinalLetterSet;
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

export default async function handler(req, res) {
  console.log(req.query.date);
  const date1 = new Date("Sunday, February 21, 2022 12:00:01 AM");
  const date2 = new Date(req.query.date);
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  console.log(diffDays + " days");
  const index = diffDays - 1;
  const datesAreOnSameDay = () =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const word1 = await GenerateWord(index);
  // const word2 = await GenerateWord(index + 1);
  // const word3 = await GenerateWord(index + 2);
  // const word4 = await GenerateWord(index + 3);
  // const word5 = await GenerateWord(index + 4);
  // const word6 = await GenerateWord(index + 5);
  // const word7 = await GenerateWord(index + 6);
  // const word8 = await GenerateWord(index + 7);
  // const word9 = await GenerateWord(index + 8);
  // const word10 = await GenerateWord(index + 9);

  const words = [];

  words.push(word1);

  if (words.length) {
    res.status(200).json({ new_date: datesAreOnSameDay, words: words });
  } else {
    res.status(500).json({ success: false });
  }
}
