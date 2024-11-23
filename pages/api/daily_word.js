
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
    let _scrambled=await ScrambleLetters(_letters);
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
    };
  }
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
    _extraLetters.push(alphabet[_randomLetter]);
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
    _FinalLetterSet.push(_fullLetterSet[i]);
  }
  return _FinalLetterSet;
}


