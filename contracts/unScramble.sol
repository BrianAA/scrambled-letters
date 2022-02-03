// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Scrambled {
    enum GameStates {
        Over,
        Started
    }
    uint256 gameDuration;
    uint256 joinWindow;
    uint256 entryTicket = 3 ether;
    uint256 fee = 1 ether;
    struct Word {
        uint256[] letters;
        bool valid;
    }
    mapping(uint256 => Word) dictionary;
    struct Player {
        uint256 total;
        uint256[] submittedWords;
    }
    struct Game {
        GameStates State;
        uint256 startTime;
        uint256 endTime;
        mapping(address => Player) players;
        uint256[] scrambledLetters;
        mapping(uint256 => bool) lookUpScrambledLetters;
        uint256 leadingTotal;
        address leader;
        uint256 prizeMoney;
    }
    mapping(uint256 => Game) public Games;
    mapping(uint256 => uint256) public alphabet;
    uint256 currentGame = 0;
    address payable owner;
    address payable leader;
    uint256 totalPayout;

    //set the owner
    constructor() {
        owner = payable(msg.sender);
        gameDuration = 1 minutes;
        joinWindow = 15 seconds;
        alphabet[0] = 0;
        alphabet[1] = 1;
        alphabet[2] = 3;
        alphabet[3] = 3;
        alphabet[4] = 2;
        alphabet[5] = 1;
        alphabet[6] = 4;
        alphabet[7] = 2;
        alphabet[8] = 4;
        alphabet[9] = 1;
        alphabet[10] = 8;
        alphabet[11] = 5;
        alphabet[12] = 1;
        alphabet[13] = 3;
        alphabet[14] = 1;
        alphabet[15] = 1;
        alphabet[16] = 3;
        alphabet[17] = 10;
        alphabet[18] = 1;
        alphabet[19] = 1;
        alphabet[20] = 1;
        alphabet[21] = 1;
        alphabet[22] = 4;
        alphabet[23] = 4;
        alphabet[24] = 8;
        alphabet[25] = 4;
        alphabet[26] = 10;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }
    modifier onlyPlayers() {
        require(msg.sender != owner, "You are the owner you can't play");
        _;
    }

    //Ensures game is in progress
    modifier gameOver() {
        require(
            block.timestamp > Games[currentGame].endTime,
            "Game is not over"
        );
        Games[currentGame].State = GameStates.Over;
        _;
    }
    //Ensures game is in progress
    modifier gameInProgress() {
        require(block.timestamp < Games[currentGame].endTime, "Game is over");
        _;
    }
    //Ensures game is in progress
    modifier ableToJoin() {
        require(
            (Games[currentGame].endTime - block.timestamp) > joinWindow,
            "No time to join wait til next round"
        );
        _;
    }

    //Change Game duration
    function ChangegameDuration(uint256 _newDuration) public onlyOwner {
        gameDuration = _newDuration;
    }

    //Add words to dictionary with the individual letters must be valid letters
    function AddToDictionary(
        uint256[] memory _wordIDs,
        uint256[][] memory _letters
    ) public onlyOwner {
        require(
            _wordIDs.length == _letters.length,
            "Both list must have same length"
        );
        for (uint256 i = 0; i < _wordIDs.length; i++) {
            require(
                dictionary[_wordIDs[i]].valid != true,
                "Word already exist"
            );
            for (uint256 l = 0; l < _letters[i].length; l++) {
                require(
                    _letters[i][l] > 0 && _letters[i][l] < 27,
                    "Not a valid letter"
                );
            }
            dictionary[_wordIDs[i]].letters = _letters[i];
            dictionary[_wordIDs[i]].valid = true;
        }
    }

    //Anyone can start a game must submit an array of 8 unique letters
    function Start(uint256[8] memory _letterSet) public gameOver {
        require(_letterSet.length == 8, "Require more letters");
        //Ensures only valid letters are used
        uint256 _previousLetterID = 0;
        for (uint256 i = 0; i < _letterSet.length; i++) {
            require(
                _letterSet[i] > 0 && _letterSet[i] < 27,
                "Not a valid letter"
            );
            require(
                _previousLetterID != _letterSet[i],
                "Set should have no duplicates"
            );
            _previousLetterID = _letterSet[i];
        }
        currentGame++; //set next game
        for (uint256 i = 0; i < _letterSet.length; i++) {
            Games[currentGame].lookUpScrambledLetters[_letterSet[i]] = true;
        }
        Games[currentGame].scrambledLetters = _letterSet;
        Games[currentGame].startTime = block.timestamp;
        Games[currentGame].endTime = block.timestamp + gameDuration;
        Games[currentGame].State = GameStates.Started;
    }

    //Only the winner can collect
    function CollectPrize(uint256 _gameID) public payable {
        require(
            block.timestamp > Games[_gameID].endTime,
            "Game is not over for this game id"
        );
        require(
            Games[_gameID].leader == msg.sender,
            "Nice try but you are not the winner"
        );
        uint256 winnings = Games[_gameID].prizeMoney;
        address payable winner = payable(Games[_gameID].leader);
        winner.transfer(winnings);
    }

    //Look up current prize of a game
    function returnGamePrize(uint256 _gameID)
        public
        view
        returns (uint256 _currentPrize)
    {
        return _currentPrize = Games[_gameID].prizeMoney;
    }

    //Total balance of contract
    function returnBalance() public view returns (uint256 balance) {
        return balance = address(this).balance;
    }

    //Only others can join not the owner
    function JoinGame() public payable ableToJoin onlyPlayers {
        require(msg.value == entryTicket, "Exact Entry fee required");
        require(
            Games[currentGame].players[msg.sender].total == 0,
            "Looks like you already paid"
        );
        owner.transfer(fee); //Send fee to owner to help with hosting this site
        uint256 _currentPrizeAmonut = Games[currentGame].prizeMoney;
        uint256 _newPrizeAmount = _currentPrizeAmonut + (msg.value - fee); //Set remaining prize;
        Games[currentGame].prizeMoney = _newPrizeAmount; //build Jackpot;
        Games[currentGame].players[msg.sender].total = 1;
    }

    //Players can submit if they join a game and game is in progress
    function SubmitWord(uint256 _word) public gameInProgress {
        require(
            Games[currentGame].players[msg.sender].total != 0,
            "Need to join game first & pay fee"
        );
        require(dictionary[_word].valid, "Not a word on our dictionary");
        //Get letters
        uint256[] memory _letters = dictionary[_word].letters;
        for (uint256 l = 0; l < _letters.length; l++) {
            require(
                Games[currentGame].lookUpScrambledLetters[_letters[l]],
                "This letter is not in the scrambled set"
            );
        }
        uint256 _currentScore = Games[currentGame].players[msg.sender].total;

        uint256 _value = 0;
        //calculate letter value
        for (uint256 i = 0; i < _letters.length; i++) {
            _value = _value + alphabet[_letters[i]];
        }
        //set usernew score
        uint256 _newScore = _currentScore + _value;
        Games[currentGame].players[msg.sender].total = _newScore;
        if (
            Games[currentGame].players[msg.sender].total >
            Games[currentGame].leadingTotal
        ) {
            Games[currentGame].leadingTotal = _newScore;
            Games[currentGame].leader = msg.sender;
        }
    }
}
