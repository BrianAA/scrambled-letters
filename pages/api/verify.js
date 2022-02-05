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

function GetAnswer() {
  let _chars = words[0].split("");
  let _stringID = "";
  let _letters = [];
  for (let _char = 0; _char < _chars.length; _char++) {
    _stringID = _stringID + alphabet[_chars[_char]].key;
    _letters.push(alphabet[_chars[_char]].key);
  }
  const _mainID = parseInt(_stringID);
  return Web3.utils.keccak256(new BN(_mainID));
}

export default async function handler(req, res) {
  const { method, body } = req;
  const currentGame = body.gameID;

  try {
    const _answer = GetAnswer();
    const _guess = body.guess;

    if (_answer == _guess) {
      res.status(200).json({ success: true, answer: true });
    } else {
      return res.status(200).json({ success: true, answer: false });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
}
