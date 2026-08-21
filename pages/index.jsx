import absoluteUrl from "next-absolute-url";
import Head from "next/head";
import React, { useState, useEffect, useRef } from "react";
import { theme, styled, css } from "../stitches.config";
import styles from "../styles/Home.module.css";
import { motion } from "framer-motion";
import SubmittedLetters from "../components/SubmittedLetters";
import ScrambleLetters from "../components/ScrambleLetters";

const ScrambleAnimation = ({ attemptsCount }) => {
  const eggsArray = Array.from({ length: attemptsCount }, (_, i) => i);
  
  // Hand-tuned coordinates relative to the 300x300 container
  // to place them perfectly in the center of the cooking surface of the pan.
  // Rotated center of the pan body inside the 300x300 box is approx (127, 181).
  const eggOffsets = [
    { top: 123, left: 53, rotate: -10 },
    { top: 138, left: 128, rotate: 15 },
    { top: 118, left: 153, rotate: -5 },
    { top: 143, left: 78, rotate: 20 },
    { top: 128, left: 103, rotate: -15 }
  ];

  const eggAnimations = [
    {
      x: [0, 0, 8, -150, -200, -200],
      y: [0, 0, 20, -350, 450, 450],
      rotate: [0, 0, 0, -180, -360, -360]
    },
    {
      x: [0, 0, 0, 0, 0, 0],
      y: [0, 0, 20, -440, 450, 450],
      rotate: [0, 0, 0, 180, 360, 360]
    },
    {
      x: [0, 0, -8, 150, 200, 200],
      y: [0, 0, 20, -350, 450, 450],
      rotate: [0, 0, 0, 180, 360, 360]
    },
    {
      x: [0, 0, 12, -225, -275, -275],
      y: [0, 0, 20, -250, 450, 450],
      rotate: [0, 0, 0, -360, -720, -720]
    },
    {
      x: [0, 0, -12, 225, 275, 275],
      y: [0, 0, 20, -250, 450, 450],
      rotate: [0, 0, 0, 360, 720, 720]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.75)",
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        overflow: "hidden",
        pointerEvents: "all",
        borderRadius: "8px"
      }}
    >
      <div style={{ position: "relative", width: "300px", height: "300px" }}>
        {/* Unified motion.div for both pan and eggs to ensure lockstep entry/shake/exit */}
        <motion.div
          initial={{ x: 350, y: 50, rotate: -15, opacity: 0 }}
          animate={{
            x: [350, 0, 0, 0, 0, -350],
            y: [50, 50, 65, 30, 50, 300],
            rotate: [-15, -15, -5, -30, -15, 30],
            opacity: [0, 1, 1, 1, 1, 0]
          }}
          transition={{
            duration: 1.2,
            times: [0, 0.25, 0.45, 0.6, 0.75, 1.0],
            ease: "easeInOut"
          }}
          style={{ position: "absolute", width: "100%", height: "100%" }}
        >
          {/* Pan Asset - Scaled up significantly */}
          <img src="/img/frying-pan.svg" width="300" height="300" style={{ display: "block" }} />

          {/* Eggs positioned inside the pan container */}
          {eggsArray.map((idx) => {
            const offset = eggOffsets[idx] || { top: 165, left: 125, rotate: 0 };
            const anim = eggAnimations[idx % eggAnimations.length];
            return (
              <motion.div
                key={idx}
                animate={{
                  // Confetti-style exploded trajectories
                  x: anim.x,
                  y: anim.y,
                  rotate: anim.rotate,
                  opacity: [1, 1, 1, 1, 0, 0],
                  scale: [1, 1, 1, 1.3, 0.5, 0]
                }}
                transition={{
                  duration: 1.2,
                  times: [0, 0.25, 0.45, 0.6, 0.8, 1.0],
                  ease: "easeInOut"
                }}
                style={{
                  position: "absolute",
                  left: offset.left,
                  top: offset.top,
                  width: "45px",
                  height: "45px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  transform: `rotate(${offset.rotate}deg)`
                }}
              >
                <>
                  <img src="/img/egg_body.svg" width="36" height="36" style={{ position: "absolute" }} />
                  <img src="/img/egg_feet.svg" width="36" height="36" style={{ position: "absolute", bottom: 0 }} />
                </>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function Home(props) {
  const data = props.data ? { ...props.data } : {};
  const hints = data.hints || [];

  //Game Data & States
  const [Loading, setLoading] = useState(true);
  const [scrambledLetters, setscrambledLetters] = useState(() => {
    if (data.scrambledLetters) {
      return data.scrambledLetters.map((char, index) => ({
        id: index,
        value: char,
      }));
    }
    return [];
  });
  const [Attempts, setAttempts] = useState(5);
  const [GameState, setGameState] = useState("inProgress");
  const [Letters, setLetters] = useState([]);
  const [Answer, setAnswer] = useState(() => {
    if (data.answer) {
      return data.answer.split("").map((char, index) => ({
        id: index,
        value: char,
      }));
    }
    return [];
  });
  const CopyButton = useRef();
  //Files for sound
  const [clickNoise, setClickNoise] = useState(null);
  const [Wrong, setWrongNoise] = useState(null);
  const [ClearSound, setClearSound] = useState(null);
  const [CrackSound, setCrackSound] = useState(null);
  const [WinnerSound, setWinnerSound] = useState(null);
  const [LoserSound, setLoserSound] = useState(null);
  const [deleteSound, setDeleteSound] = useState(null);

  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showStatsDetail, setShowStatsDetail] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    guesses: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
  });

  // Helper date functions
  function isYesterday(dateToCheck, referenceDate = new Date()) {
    const date1 = new Date(dateToCheck);
    const yesterday = new Date(referenceDate);
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date1.getFullYear() === yesterday.getFullYear() &&
      date1.getMonth() === yesterday.getMonth() &&
      date1.getDate() === yesterday.getDate()
    );
  }

  function updateStreakOnWin() {
    const today = new Date();
    const lastStreakUpdate = window.localStorage.getItem("last_streak_update");
    const currentStreak = parseInt(window.localStorage.getItem("egg_streak") || "0", 10);
    const currentMax = parseInt(window.localStorage.getItem("max_egg_streak") || "0", 10);
    
    let newStreak = currentStreak;
    if (lastStreakUpdate) {
      if (datesAreOnSameDay(lastStreakUpdate, today)) {
        // Already updated today, keep current values
        return;
      } else if (isYesterday(lastStreakUpdate, today)) {
        newStreak = currentStreak + 1;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }
    
    const newMax = Math.max(currentMax, newStreak);
    setStreak(newStreak);
    setMaxStreak(newMax);
    window.localStorage.setItem("egg_streak", newStreak.toString());
    window.localStorage.setItem("max_egg_streak", newMax.toString());
    window.localStorage.setItem("last_streak_update", today.toISOString());
  }

  function resetStreakOnLoss() {
    const today = new Date();
    setStreak(0);
    window.localStorage.setItem("egg_streak", "0");
    window.localStorage.setItem("last_streak_update", today.toISOString());
  }

  function updateStatsOnWin(finalAttempts) {
    const savedStats = window.localStorage.getItem("egg_stats");
    let currentStats = savedStats ? JSON.parse(savedStats) : {
      gamesPlayed: 0,
      gamesWon: 0,
      guesses: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
    };
    
    const lastStatsUpdate = window.localStorage.getItem("last_stats_update");
    const today = new Date();
    if (lastStatsUpdate && datesAreOnSameDay(lastStatsUpdate, today)) {
      return;
    }

    currentStats.gamesPlayed += 1;
    currentStats.gamesWon += 1;
    
    const guessIndex = (6 - finalAttempts).toString();
    if (currentStats.guesses[guessIndex] !== undefined) {
      currentStats.guesses[guessIndex] += 1;
    }
    
    setStats(currentStats);
    window.localStorage.setItem("egg_stats", JSON.stringify(currentStats));
    window.localStorage.setItem("last_stats_update", today.toISOString());
  }

  function updateStatsOnLoss() {
    const savedStats = window.localStorage.getItem("egg_stats");
    let currentStats = savedStats ? JSON.parse(savedStats) : {
      gamesPlayed: 0,
      gamesWon: 0,
      guesses: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
    };
    
    const lastStatsUpdate = window.localStorage.getItem("last_stats_update");
    const today = new Date();
    if (lastStatsUpdate && datesAreOnSameDay(lastStatsUpdate, today)) {
      return;
    }

    currentStats.gamesPlayed += 1;
    
    setStats(currentStats);
    window.localStorage.setItem("egg_stats", JSON.stringify(currentStats));
    window.localStorage.setItem("last_stats_update", today.toISOString());
  }

  useEffect(() => {
    try {
      const attempts = window.localStorage.getItem("attempts");
      const lastPlayed = window.localStorage.getItem("lastPlayed");
      const _scrambledLetters = window.localStorage.getItem("letters");
      const _gameState = window.localStorage.getItem("complete");
      SetNoise();

      // Load streak and stats
      const savedStreak = window.localStorage.getItem("egg_streak");
      const savedMaxStreak = window.localStorage.getItem("max_egg_streak");
      const lastStreakUpdate = window.localStorage.getItem("last_streak_update");
      const savedStats = window.localStorage.getItem("egg_stats");
      
      let currentStreak = savedStreak ? parseInt(savedStreak, 10) : 0;
      let currentMaxStreak = savedMaxStreak ? parseInt(savedMaxStreak, 10) : 0;
      const today = new Date();
      
      if (lastStreakUpdate && !datesAreOnSameDay(lastStreakUpdate, today) && !isYesterday(lastStreakUpdate, today)) {
        currentStreak = 0;
        window.localStorage.setItem("egg_streak", "0");
      }
      
      setStreak(currentStreak);
      setMaxStreak(currentMaxStreak);

      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }

      if (lastPlayed == null) {
        window.localStorage.setItem("lastPlayed", new Date("02/20/2022"));
        ResetGame();
      } else {
        if (datesAreOnSameDay(lastPlayed, new Date())) {
          if (attempts && _scrambledLetters && _gameState) {
            if (attempts <= 1) {
              setGameState("GameOver");
            }
            setAttempts(parseInt(attempts, 10));
            if (_gameState == "true") {
              handleComplete(false);
            } else {
              setAttempts(parseInt(attempts, 10));
              let _Deserialize = JSON.parse(_scrambledLetters);
              const mapped = _Deserialize.map((item, index) => {
                if (typeof item === 'object' && item !== null && 'value' in item) {
                  return item;
                }
                return { id: index, value: item };
              });
              setscrambledLetters(mapped);
            }
          } else {
            ResetGame();
          }
        } else {
          window.localStorage.setItem("lastPlayed", new Date());
          ResetGame();
        }
      }
    } catch (e) {
      console.error("Error loading game state:", e);
      ResetGame();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (GameState !== "inProgress" || Loading) return;
      
      const key = event.key;
      
      if (key === "Backspace") {
        handleDelete(Letters.length - 1);
      } else if (key === "Enter") {
        if (Letters.length === 5) {
          CheckAnswer();
        }
      } else if (key === "Escape") {
        handleClear();
      } else if (/^[a-zA-Z]$/.test(key)) {
        const lowerKey = key.toLowerCase();
        const unusedLetter = scrambledLetters.find(letterInfo => {
          if (letterInfo.value.toLowerCase() !== lowerKey) return false;
          const isUsed = Letters.some(usedLetter => usedLetter.id === letterInfo.id);
          return !isUsed;
        });
        
        if (unusedLetter) {
          handleClick(unusedLetter);
        }
      }
    }
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [GameState, Loading, scrambledLetters, Letters]);

  function datesAreOnSameDay(lastPlayed, date2) {
    const date1 = new Date(lastPlayed);
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
  function SetNoise() {
    //Set files and
    const soundForDelete = new Audio("/audio/delete.mp3");
    const clickAudio = new Audio("/audio/click.mp3");
    const wrongAudio = new Audio("/audio/wrong.mp3");
    const clearAudio = new Audio("/audio/clear.mp3");
    const crackAudio = new Audio("/audio/crack.mp3");
    const winnerAudio = new Audio("/audio/winner.mp3");
    const loserAudio = new Audio("/audio/loser.mp3");
    clearAudio.volume = 0.45;
    winnerAudio.volume = 0.5;
    loserAudio.volume = 0.5;
    //Set Noise
    setClickNoise(clickAudio);
    setCrackSound(crackAudio);
    setDeleteSound(soundForDelete);
    setWrongNoise(wrongAudio);
    setClearSound(clearAudio);
    setWinnerSound(winnerAudio);
    setLoserSound(loserAudio);
  }
  function ResetGame() {
    window.localStorage.setItem("complete", false);
    window.localStorage.setItem("attempts", 5);
    setLetters([]);
    const initialScrambled = (data.scrambledLetters || []).map((char, index) => ({
      id: index,
      value: char,
    }));
    setscrambledLetters(initialScrambled);
    setGameState("inProgress");
    window.localStorage.setItem(
      "letters",
      JSON.stringify(initialScrambled)
    );
    window.localStorage.setItem("index", 0);
    setAttempts(5);
    setShowStatsDetail(false);
  }

  //Health Bar Component :TODO Refactor to component
  const HealthBar = () => {
    let Eggs = [1, 2, 3, 4, 5];
    let Yolk = [1, 2, 3, 4, 5];

    for (let i = 0; i < 5; i++) {
      if (i < Attempts) {
        Yolk.pop();
      } else {
        Eggs.pop();
      }
    }
    return (
      <>
        {Eggs.map((i) => {
          return (
            <Container
              key={i}
              css={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <motion.div
                animate="move"
                variants={Rotate}
                transition={{ type: "spring", ease: "easeInOut" }}
                className={ImgContainer()}
              >
                <motion.img alt="Egg body" src="/img/egg_body.svg" />
              </motion.div>
              <motion.img src="/img/egg_feet.svg" />
            </Container>
          );
        })}
        {Yolk.map((i) => {
          return (
            <Container
              key={i}
              css={{
                position: "relative",
                display: "flex",
                height: "100%",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <img src="/img/yolk.svg" />
            </Container>
          );
        })}
      </>
    );
  };

  //Game Functions

  //Game Functions
  const handleDelete = (index) => {
    if (Letters.length > 0) {
      let newLetters = [];
      newLetters = [...Letters];
      if (deleteSound) {
        deleteSound.pause;
        deleteSound.currentTime = 0;
        deleteSound.play();
      }
      if (index > -1) {
        newLetters.splice(index, 1);
        setLetters(newLetters);
      }
    }
  };

  function handleClick(_letter) {
    let newLetters = [];
    newLetters = [...Letters];
    if (clickNoise) {
      clickNoise.pause;
      clickNoise.currentTime = 0;
      clickNoise.play();
    }
    if (!(Letters.length < 5)) return;
    newLetters.push(_letter);
    setLetters(newLetters);
  }

  function handleClear() {
    if (ClearSound) {
      ClearSound.pause;
      ClearSound.currentTime = 0;
      ClearSound.play();
    }
    setLetters([]);
  }

  function handleScramble() {
    if (isScrambling) return;
    
    if (Wrong) {
      try {
        Wrong.pause();
        Wrong.currentTime = 0;
        Wrong.play();
      } catch (e) {
        console.error("Audio play blocked", e);
      }
    }
    
    setIsScrambling(true);
    
    setTimeout(() => {
      let shuffled = [...scrambledLetters];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setscrambledLetters(shuffled);
      window.localStorage.setItem("letters", JSON.stringify(shuffled));
      setIsScrambling(false);
    }, 1200);
  }

  function CheckAnswer() {
    let _stringID = "";
    for (let i = 0; i < Letters.length; i++) {
      _stringID = _stringID + Letters[i].value;
    }
    const _mainID = _stringID == data.answer;
    const isCorrect = _mainID;

    if (isCorrect) {
      handleComplete(true);
    } else {
      handleWrong();
    }
  }

  async function handleWrong() {
    // Step 1: Identify the non-hint letters
    const nonHintLetters = scrambledLetters.filter(
      (letter) => !hints.includes(letter.value)
    );

    let newScramble = [...scrambledLetters];
    if (nonHintLetters.length > 0) {
      // Step 2: Randomly select one non-hint letter to remove
      const randomIndex = Math.floor(Math.random() * nonHintLetters.length);
      const letterToRemove = nonHintLetters[randomIndex];

      // Step 3: Remove the selected letter from the original array
      newScramble = scrambledLetters.filter(
        (letter) => letter.id !== letterToRemove.id
      );

      // Save the updated array to local storage
      window.localStorage.setItem("letters", JSON.stringify(newScramble));

      // Update the scrambled letters state
      setscrambledLetters(newScramble);
    }

    if (Attempts <= 1) {
      setGameState("GameOver");
      updateStatsOnLoss();
      resetStreakOnLoss();
      if (LoserSound) {
        LoserSound.pause;
        LoserSound.currentTime = 0;
        LoserSound.play();
        setscrambledLetters(
          [...hints].sort().map((char, index) => ({ id: `hint-${index}`, value: char }))
        );
      }
    }
    if (Wrong) {
      Wrong.pause;
      Wrong.currentTime = 0;
      Wrong.play();
      setTimeout(() => {
        if (CrackSound) {
          CrackSound.pause;
          CrackSound.currentTime = 0;
          CrackSound.play();
          setAttempts(Attempts - 1);
        }
      }, 500);
      window.localStorage.setItem("attempts", Attempts - 1);
    }
    setTimeout(() => {
      if (GameState == "inProgress") {
        setLetters([]);
      }
    }, 1000);
  }

  function handleComplete(isNewWin = false) {
    setGameState("Winner");
    window.localStorage.setItem("complete", true);
    
    if (isNewWin) {
      updateStreakOnWin();
      updateStatsOnWin(Attempts);
    }
    
    if (WinnerSound) {
      WinnerSound.pause;
      WinnerSound.currentTime = 0;
      WinnerSound.play();
    }
    setscrambledLetters(
      [...hints].sort().map((char, index) => ({ id: `hint-${index}`, value: char }))
    );
  }

  async function handleCopy() {
    let localAttemps = window.localStorage.getItem("attempts");
    console.log(localAttemps);
    let stringEggs = "";
    for (let i = 0; i < 5; i++) {
      if (i > localAttemps - 1) {
        stringEggs = stringEggs + "🍳 ";
      } else {
        stringEggs = stringEggs + "🥚 ";
      }
    }
    const won = GameState === "Winner";
    CopyButton.current.innerText = "Copied!";
    await window.navigator.clipboard.writeText(
      `${stringEggs} I ${
        won ? "" : "did not"
      } unscrambled todays word www.scrambledletters.com`
    );
    setTimeout(() => {
      CopyButton.current.innerText = "Share";
    }, 1000);
  }



  const StatsDashboard = () => {
    const winRate = stats.gamesPlayed ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
    
    let totalWins = stats.gamesWon;
    let totalGuessesUsed = 0;
    Object.entries(stats.guesses).forEach(([guessNum, count]) => {
      totalGuessesUsed += parseInt(guessNum, 10) * count;
    });
    const avgGuesses = totalWins ? (totalGuessesUsed / totalWins).toFixed(1) : 0;
    
    let cheekyComment = "Crack some eggs to get started!";
    if (totalWins > 0) {
      const avg = parseFloat(avgGuesses);
      if (avg <= 2.0) cheekyComment = "Egg-traordinary mind! 🧠";
      else if (avg <= 3.5) cheekyComment = "Solid scrambler. 🍳";
      else cheekyComment = "Living on the edge! ☠️";
    }

    const maxGuessCount = Math.max(...Object.values(stats.guesses), 1);

    if (!showStatsDetail) {
      return (
        <StatsContainer style={{ padding: "10px 16px", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
            <span className="cherry" style={{ color: theme.colors.secondary, fontWeight: "bold" }}>
              Played: {stats.gamesPlayed} | Win: {winRate}% | Streak: {streak}
            </span>
            <button 
              onClick={() => setShowStatsDetail(true)}
              style={{
                background: "none",
                border: "none",
                color: theme.colors.secondary,
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "12px",
                textDecoration: "underline",
                padding: 0
              }}
            >
              Details ▾
            </button>
          </div>
        </StatsContainer>
      );
    }

    return (
      <StatsContainer>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <StatsHeader className="cherry">YOUR PERFORMANCE</StatsHeader>
          <button 
            onClick={() => setShowStatsDetail(false)}
            style={{
              background: "none",
              border: "none",
              color: theme.colors.secondary,
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "12px",
              textDecoration: "underline",
              padding: 0
            }}
          >
            Collapse ▴
          </button>
        </div>
        <StatsGrid>
          <StatBox>
            <StatNumber>{stats.gamesPlayed}</StatNumber>
            <StatLabel>Played</StatLabel>
          </StatBox>
          <StatBox>
            <StatNumber>{winRate}%</StatNumber>
            <StatLabel>Win %</StatLabel>
          </StatBox>
          <StatBox>
            <StatNumber>{streak}</StatNumber>
            <StatLabel>Streak</StatLabel>
          </StatBox>
          <StatBox>
            <StatNumber>{maxStreak}</StatNumber>
            <StatLabel>Max Streak</StatLabel>
          </StatBox>
        </StatsGrid>
        
        <StatsHeader className="cherry" style={{ fontSize: "16px", marginTop: "8px" }}>GUESS DISTRIBUTION</StatsHeader>
        <DistributionContainer>
          {["1", "2", "3", "4", "5"].map((i) => {
            const count = stats.guesses[i] || 0;
            const percentWidth = (count / maxGuessCount) * 100;
            return (
              <DistributionRow key={i}>
                <span style={{ width: "12px", color: theme.colors.secondary, fontWeight: "bold" }}>{i}</span>
                <DistributionBar css={{ 
                  width: `${Math.max(12, percentWidth)}%`, 
                  backgroundColor: count > 0 ? theme.colors.primary : "#dcd0d9",
                  color: count > 0 ? "white" : theme.colors.secondary
                }}>
                  {count}
                </DistributionBar>
              </DistributionRow>
            );
          })}
        </DistributionContainer>
        
        <P style={{ fontSize: "14px", fontStyle: "italic", margin: "8px 0 0 0", textAlign: "center" }}>
          {cheekyComment}
        </P>
      </StatsContainer>
    );
  };

  return (
    <>
      <Head>
        <title>Scrambled Letters</title>
        <meta
          name="description"
          content="Daily word game where you try to guess the word of the day from a set of scrambled letters"
        />
      </Head>

      <Main className={styles.main}>
        {isScrambling && <ScrambleAnimation attemptsCount={Attempts} />}
        {Loading ? (
          <P className="cherry">...Loading Game</P>
        ) : (
          <>
            <motion.div
              initial="hidden"
              animate="reveal"
              variants={FadeIn}
              transition={{ duration: 0.75, ease: "easeInOut", type: "spring" }}
            >
              <BrandHolder>
                <P
                  as="img"
                  css={{ margin: "0 auto" }}
                  width="30%"
                  height="auto"
                  src="/img/eggs.svg"
                />
                <H1
                  css={{
                    marginBottom: 0,
                    lineHeight: 1.1,
                    "@sm": { fontSize: 24 },
                  }}
                  className="cherry"
                >
                  {GameState == "inProgress" && "Scrambled Letters"}
                  {GameState == "GameOver" && "Tough Break you lost"}
                  {GameState == "Winner" && "Eggsellent you win!"}
                </H1>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.75, delay: 0.25 }}
                >
                  {GameState == "inProgress" && (
                    <P> Find todays word from these scrambled letters</P>
                  )}
                  {GameState == "GameOver" && (
                    <P>Come back tomorrow for for a new word or play again</P>
                  )}
                  {GameState == "Winner" && (
                    <P>Copy your stats and challenge your friends.</P>
                  )}
                </motion.div>
              </BrandHolder>
            </motion.div>
            <Container
              css={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {GameState == "inProgress" && <HealthBar />}
            </Container>

            {GameState == "inProgress" && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <SubmittedLetters
                  handleDelete={handleDelete}
                  Letters={Letters}
                />
                <ScrambleLetters
                  handleClick={handleClick}
                  Letters={Letters}
                  scrambledLetters={scrambledLetters}
                />
              </div>
            )}

            <Container>
              {GameState == "inProgress" && (
                <>
                  <Button
                    isdisabled={Letters.length < 1}
                    disabled={Letters.length < 1}
                    onClick={handleClear}
                    variant={"Clear"}
                  >
                    Clear
                  </Button>
                  <Button
                    isdisabled={Letters.length < 5}
                    disabled={Letters.length < 5}
                    onClick={CheckAnswer}
                  >
                    {" "}
                    Submit
                  </Button>
                </>
              )}
              {console.log(GameState)}
              {GameState != "inProgress" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <P
                    as="img"
                    css={{ display: "flex", margin: " auto" }}
                    width="35%"
                    height="auto"
                    src={
                      GameState == "GameOver"
                        ? "/img/gameover.gif"
                        : "/img/winner.gif"
                    }
                  />
                  <ScrambleLetters
                    Letters={[]}
                    scrambledLetters={data.answer.split("")}
                  />
                  
                  <StatsDashboard />

                  <Button onClick={ResetGame}>Reset Game</Button>
                  <Button
                    ref={CopyButton}
                    variant={"Clear"}
                    onClick={handleCopy}
                  >
                    Share
                  </Button>
                </div>
              )}
            </Container>
            
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                marginTop: 24,
                width: "100%",
              }}
            >
              <a href="https://www.buymeacoffee.com/designbaa" style={{ display: "flex", "&:hover": { opacity: 0.75 }, transition: "all .25s" }}>
                <img
                  style={{
                    borderRadius: "8px",
                    border: "1px solid rgba(0,0,0,.5)",
                    height: "38px",
                    width: "auto",
                  }}
                  src="/img/bmc-button.png"
                />
              </a>
              {GameState === "inProgress" && (
                <ScrambleButton onClick={handleScramble}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.78 4.22a1 1 0 0 0-1.41 0L14.5 8.09a7 7 0 1 0 1.41 1.41l3.87-3.87a1 1 0 0 0 0-1.41zM9.5 17.5a4.5 4.5 0 1 1 4.5-4.5 4.5 4.5 0 0 1-4.5 4.5z"/>
                  </svg>
                  <span>Scramble</span>
                </ScrambleButton>
              )}
            </div>
          </>
        )}
      </Main>
    </>
  );
}

Home.getInitialProps = async ({ req }) => {
  const { protocol, host } = absoluteUrl(req);
  const res = await fetch(
    `${protocol}//${host}/api/daily_word?date=${new Date()}`
  );
  const json = await res.json();
  return { ...json };
};

//Styles

const FadeIn = {
  hidden: { opacity: 0, y: "-100%" },
  reveal: { opacity: 1, y: "0%" },
};

const Rotate = {
  move: {
    transition: {
      repeat: Infinity,
      duration: 0.75,
    },
    rotate: [0, -8, 0, 8, 0],
  },
  reset: { rotate: 0 },
};
const Main = styled("main", {
  flex: 1,
  display: " flex",
  maxWidth: 350,
  margin: "0 auto",
  paddingTop: 24,
  flexDirection: "column",
  justifyContent: "center",
  position: "relative",
});
const BrandHolder = styled("div", {
  display: " flex",
  width: "100%",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
});
const H1 = styled("h1", {
  font: "cherry",
  color: theme.colors.secondary,
  width: "100%",
  fontSize: 32,
  marginTop: 0,
  marginBottom: 0,
  textAlign: "center",
  "@sm": {
    fontSize: 36,
  },
});

const Button = styled("button", {
  width: "100%",
  height: 56,
  backgroundColor: theme.colors.secondary,
  fontSize: 28,
  color: "white",
  borderColor: theme.colors.secondary,
  boxShadow: `0px 2px 0px ${theme.colors.secondary}`,
  letterSpacing: ".1em",
  borderRadius: 4,
  cursor: "pointer",
  "@sm": {
    fontSize: 24,
  },
  "&:disabled": {
    cursor: "not-allowed",
    opacity: 1,
    backgroundColor: theme.colors.secondary,
    color: "white",
    borderColor: theme.colors.secondary,
    WebkitTextFillColor: "white",
  },
  variants: {
    isdisabled: {
      true: {
        opacity: 1,
      },
      false: {
        opacity: 1,
      },
    },
    variant: {
      Clear: {
        backgroundColor: "#F2EAEF",
        color: theme.colors.secondary,
        "&:disabled": {
          backgroundColor: "#F2EAEF",
          color: theme.colors.secondary,
          WebkitTextFillColor: theme.colors.secondary,
          opacity: 1,
        }
      },
    },
  },
});



const ScrambleButton = styled("button", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  height: "38px",
  backgroundColor: "#F2EAEF",
  color: theme.colors.secondary,
  border: `1px solid ${theme.colors.secondary}`,
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "bold",
  padding: "0 12px",
  cursor: "pointer",
  boxShadow: `0px 2px 0px ${theme.colors.secondary}`,
  transition: "all 0.15s ease",
  "&:active": {
    boxShadow: `0px 0px 0px ${theme.colors.secondary}`,
    transform: "translateY(2px)",
  },
});

const StatsContainer = styled("div", {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  backgroundColor: "#F9F6F8",
  border: `1px solid ${theme.colors.secondary}`,
  borderRadius: "8px",
  padding: "16px",
  marginTop: "8px",
  marginBottom: "8px",
  gap: "16px",
});

const StatsHeader = styled("h3", {
  fontSize: "20px",
  color: theme.colors.secondary,
  margin: 0,
  textAlign: "center",
});

const StatsGrid = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "8px",
  textAlign: "center",
});

const StatBox = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const StatNumber = styled("div", {
  fontSize: "24px",
  fontWeight: "bold",
  color: theme.colors.secondary,
});

const StatLabel = styled("div", {
  fontSize: "10px",
  color: theme.colors.text,
  textTransform: "uppercase",
  letterSpacing: ".05em",
  marginTop: "4px",
});

const DistributionContainer = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  width: "100%",
});

const DistributionRow = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "12px",
});

const DistributionBar = styled("div", {
  backgroundColor: theme.colors.primary,
  color: "white",
  fontWeight: "bold",
  padding: "2px 8px",
  borderRadius: "4px",
  minWidth: "24px",
  textAlign: "right",
  fontSize: "10px",
  display: "flex",
  justifyContent: "flex-end",
  transition: "width 0.5s ease-in-out",
});
const Container = styled("div", {
  display: "flex",
  width: "100%",
  gap: 16,
});
const P = styled("p", {
  color: theme.colors.secondary,
  textAlign: "center",
  letterSpacing: ".1em",
  fontSize: 16,
  lineHeight: 1.25,
  marginTop: 8,
  marginBottom: 16,
  "@sm": {
    fontSize: 16,
    padding: "0 16px",
    maxWidth: "100%",
  },
});

const ImgContainer = css({
  pointerEvents: "none",
  position: "absolute",
});
