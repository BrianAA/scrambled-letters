import absoluteUrl from "next-absolute-url";
import Head from "next/head";
import React, { useState, useEffect, useRef } from "react";
import { theme, styled, css } from "../stitches.config";
import styles from "../styles/Home.module.css";
import { motion } from "framer-motion";
import SubmittedLetters from "../components/SubmittedLetters";
import ScrambleLetters from "../components/ScrambleLetters";
export default function Home(props) {
  const data = { ...props.data };
  const hints = data.hints;

  //Game Data & States
  const [Loading, setLoading] = useState(true);
  const [scrambledLetters, setscrambledLetters] = useState(
    data.scrambledLetters
  );
  const [Attempts, setAttempts] = useState(5);
  const [GameState, setGameState] = useState("inProgress");
  const [Letters, setLetters] = useState([]);
  const [Answer, setAnswer] = useState(() => {
    return data.answer.split("").map((char, index) => ({
      id: index,
      value: char,
    }));
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

  useEffect(async () => {
    const attempts = window.localStorage.getItem("attempts");
    const lastPlayed = window.localStorage.getItem("lastPlayed");
    const _scrambledLetters = window.localStorage.getItem("letters");
    const _gameState = window.localStorage.getItem("complete");
    SetNoise();
    if (lastPlayed == null) {
      window.localStorage.setItem("lastPlayed", new Date("02/20/2022"));
      ResetGame();
    } else {
      if (datesAreOnSameDay(lastPlayed, new Date())) {
        if (attempts && _scrambledLetters && _gameState) {
          if (attempts <= 1) {
            setGameState("GameOver");
          }
          setAttempts(attempts);
          if (_gameState == "true") {
            handleComplete(false);
          } else {
            setAttempts(attempts);
            let _Deserialize = JSON.parse(_scrambledLetters);
            setscrambledLetters(_Deserialize);
          }
        } else {
          ResetGame();
        }
      } else {
        window.localStorage.setItem("lastPlayed", new Date());
        ResetGame();
      }
    }
    setLoading(false);
  }, []);

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
    setscrambledLetters(data.scrambledLetters);
    setGameState("inProgress");
    window.localStorage.setItem(
      "letters",
      JSON.stringify(data.scrambledLetters)
    );
    window.localStorage.setItem("index", 0);
    setAttempts(5);
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
      (letter) => !hints.includes(letter)
    );

    // Step 2: Randomly select one non-hint letter to remove
    const randomIndex = Math.floor(Math.random() * nonHintLetters.length);
    const letterToRemove = nonHintLetters[randomIndex];

    // Step 3: Remove the selected letter from the original array
    const newScramble = scrambledLetters.filter(
      (letter) => letter !== letterToRemove
    );

    // Step 4: Restore the array order with the remaining letters
    // (No changes are needed because filter keeps the original order)

    // Save the updated array to local storage
    window.localStorage.setItem("letters", JSON.stringify(newScramble));

    // Update the scrambled letters state
    setscrambledLetters(newScramble);
    if (Attempts <= 1) {
      setGameState("GameOver");
      if (LoserSound) {
        LoserSound.pause;
        LoserSound.currentTime = 0;
        LoserSound.play();
        setscrambledLetters(hints.sort());
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

  function handleComplete() {
    setGameState("Winner");
    window.localStorage.setItem("complete", true);
    if (WinnerSound) {
      WinnerSound.pause;
      WinnerSound.currentTime = 0;
      WinnerSound.play();
      setscrambledLetters(hints.sort());
    }
  }

  async function handleCopy(won) {
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
            <P
              as="div"
              css={{
                "&:hover": { opacity: 0.75 },
                transition: "all .25s",
                marginTop: 24,
              }}
            >
              <a href="https://www.buymeacoffee.com/designbaa">
                <img
                  style={{
                    borderRadius: "8px",
                    border: "1px solid rgba(0,0,0,.5)",
                  }}
                  src="/img/bmc-button.png"
                  height="auto"
                  width="150"
                />
              </a>
            </P>
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
  "@sm": {
    fontSize: 24,
  },
  variants: {
    isdisabled: {
      true: {
        opacity: 0.75,
      },
      false: {
        opacity: 1,
      },
    },
    variant: {
      Clear: {
        backgroundColor: "#F2EAEF",
        color: theme.colors.secondary,
      },
    },
  },
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
