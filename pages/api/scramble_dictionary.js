const dictionary = require("../../lib/dictionary");
function ScrambleDictionary() {
  let _newDictionary = dictionary;
  let _index = 0;
  _index = _newDictionary.length;
  while (_index != 0) {
    const _randomIndex = Math.floor(Math.random() * _newDictionary.length);
    _index--;

    [_newDictionary[_index], _newDictionary[_randomIndex]] = [
      _newDictionary[_randomIndex],
      _newDictionary[_index],
    ];
  }
  return { _newDictionary };
}
export default async function handler(req, res) {
  const _newDictionary = ScrambleDictionary();
  try {
    res.status(200).json(_newDictionary);
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
}
