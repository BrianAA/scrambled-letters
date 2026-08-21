
const dictionary = require("../../lib/scrambledDictionary");
const alphabet = [
  "a", 
  "b", 
  "c", 
  "d", 
  "e", 
  "f", 
  "g", 
  "h", 
  "i", 
  "j", 
  "k", 
  "l", 
  "m", 
  "n", 
  "o", 
  "p", 
  "q", 
  "r", 
  "s", 
  "t", 
  "u", 
  "v", 
  "w", 
  "x", 
  "y", 
  "z", 
];



//Gets word based on date

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

  const gameData = await GenerateWord(index);

  if (gameData) {
    res.status(200).json({ new_date: datesAreOnSameDay, data: gameData });
  } else {
    res.status(500).json({ success: false });
  }
}


async function GenerateWord(index) {
  try {
    //If its the same day return nothing
    if (index == 0) throw Error;
    let _stringID=dictionary[index];
    let _letters = dictionary[index].split("");
    let _scrambled=await ScrambleLetters(_letters, index);
    console.log(_scrambled)
    return {
      success: true,
      answer: _stringID,
      hints:_letters,
      scrambledLetters: _scrambled,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: error,
      details: error.message
    };
  }
}


function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

function getSeed(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  }
  return (h ^ (h >>> 16)) >>> 0;
}

async function ScrambleLetters(_letters, index) {
  const seedString = `${index}-${_letters.join("")}`;
  const seedVal = getSeed(seedString);
  const rand = mulberry32(seedVal);

  let _fullLetterSet = [];
  let _extraLetters = [];
  let _index = 0;

  while (_index < 5) {
    let _randomLetter = Math.floor(rand() * 26);
    let letter = alphabet[_randomLetter];
    while (_letters.includes(letter) || _extraLetters.includes(letter) || _randomLetter === 0) {
      _randomLetter = Math.floor(rand() * 26);
      letter = alphabet[_randomLetter];
    }
    _extraLetters.push(letter);
    _index++;
  }
  _fullLetterSet = [..._letters, ..._extraLetters];
  
  // Seeded Fisher-Yates Shuffle
  let m = _fullLetterSet.length;
  while (m) {
    const i = Math.floor(rand() * m--);
    const t = _fullLetterSet[m];
    _fullLetterSet[m] = _fullLetterSet[i];
    _fullLetterSet[i] = t;
  }
  
  return _fullLetterSet;
}



