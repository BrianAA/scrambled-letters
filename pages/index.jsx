import Head from "next/head";
import { useRouter } from 'next/router'
import React, { useState, useEffect, useRef } from "react";
import absoluteUrl from 'next-absolute-url'
import styles from "../styles/Home.module.css";
import { alphabet } from "../lib/alphabet";
import { theme, styled, css } from "../stitches.config";
import { motion } from "framer-motion"
import SubmittedLetters from "../components/SubmittedLetters";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrambleLetters from "../components/ScrambleLetters";


const Web3 = require("web3");
const BN = Web3.utils.BN;

const randomDuration = () => Math.random() * 0.07 + 0.23;

const FadeIn = {
  hidden: { opacity: 0, y: "-100%" },
  reveal: { opacity: 1, y: "0%" },
}

const Rotate = {
  move: {
    transition: {
      repeat: Infinity,
      duration: .75,
    }, rotate: [0, -8, 0, 8, 0]
  },
  reset: { rotate: 0 },
}
const Main = styled("main", {
  flex: 1,
  display: " flex",
  maxWidth: 350,
  margin: "0 auto",
  paddingTop: 24,
  flexDirection: "column",
  justifyContent: "center",

})
const BrandHolder = styled("div", {
  display: " flex",
  width: "100%",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
})
const H1 = styled("h1", {
  font: "cherry",
  color: theme.colors.secondary,
  width: "100%",
  fontSize: 40,
  marginTop: 0,
  marginBottom: 0,
  textAlign: "center",
  "@sm": {

    fontSize: 36
  }
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
    fontSize: 24
  },
  variants: {
    isdisabled: {
      true: {
        opacity: .75,
      }, false: {
        opacity: 1
      }
    },
    variant: {
      Clear: {
        backgroundColor: "#F2EAEF",
        color: theme.colors.secondary,
      }
    }
  }
})
const Container = styled("div", {
  display: "flex",
  width: "100%",
  gap: 16,
})
const P = styled("p", {
  color: theme.colors.secondary,
  textAlign: "center",
  letterSpacing: ".1em",
  fontSize: 18,
  lineHeight: 1.25,
  marginTop: 8,
  marginBottom: 16,
  "@sm": {
    fontSize: 16,
    padding: "0 16px",
    maxWidth: "100%",
  }
})

const ImgContainer = css({
  pointerEvents: "none",
  position: "absolute"
})






export default function Home(props) {
  const router = useRouter()
  const hints = props.data ? props.data.words[0].hashHints : null;
  const [Loading, setLoading] = useState(true);
  const [CurrentWord, setCurrentWord] = useState(null)
  const [scrambledLetters, setscrambledLetters] = useState([])
  const [Answer, setAnswer] = useState(props.data ? props.data.words[0].hashID : null)
  const [Letters, setLetters] = useState([]);
  const [deleteSound, setDeleteSound] = useState(null);
  const [Attempts, setAttempts] = useState(5);
  const [Streaks, setStreaks] = useState(0);
  const [PrevGame, setPrevGame] = useState(false);
  const [Best, setBest] = useState(0);
  const [GameState, setGameState] = useState("inProgress");
  const [clickNoise, setClickNoise] = useState(null);
  const [Wrong, setWrongNoise] = useState(null);
  const [ClearSound, setClearSound] = useState(null)
  const [CrackSound, setCrackSound] = useState(null);
  const [WinnerSound, setWinnerSound] = useState(null);
  const [LoserSound, setLoserSound] = useState(null);
  const [SameDay, setSameDay] = useState(false);
  const CopyButton = useRef();

  let FinishedToast = (ResetGame, toastID) => {
    return (<P as="div" css={{ textAlign: "center" }}>
      <P as="img" css={{ pointerEvents: "none", margin: "0 auto" }} width="60%" height="auto" src="/img/winner.gif" />
      <P as="div" css={{ margin: "0 auto", fontSize: 18, width: "100%" }} className="cherry">You unscrambled today{`'s`} word</P>
      <P as="div" css={{ fontSize: 16, width: "100%" }} >Come back tomorrow for a new word to unscramble</P>
      <Button ref={CopyButton} css={{ fontSize: 16 }} onClick={handleCopy}>Share</Button>
      <P as="div" css={{ "&:hover": { opacity: .75 }, transition: "all .25s", marginTop: 24, }}>
        <a href="https://www.buymeacoffee.com/designbaa">
          <img src="/img/bmc-button.png" height="auto" width="150" />
        </a>
      </P>
      <P as="button" css={{ textDecoration: "underline", userSelect: "none", border: "none", background: "transparent" }}
        onClick={() => { ResetGame(); toast.dismiss(toastID) }}>Close</P>
    </P>)
  }
  const GameOverToast = (ResetGame, toastID) => {
    return (<P as="div" css={{ pointerEvents: "none", textAlign: "center" }}>
      <P as="img" css={{ margin: "0 auto" }} width="50%" height="auto" src="/img/gameover.gif" />
      <P as="div" css={{ margin: "0 auto", fontSize: 24, width: "90%" }} className="cherry">Game over</P>
      <P as="div" css={{ fontSize: 16, width: "100%" }} >Come back tomorrow for some fresh eggs and a new word</P>
      <Button ref={CopyButton} css={{ fontSize: 16 }} onClick={() => handleCopy(false)}>Share</Button>
      <P as="div" css={{ "&:hover": { opacity: .75 }, transition: "all .25s", marginTop: 24, }}>
        <a href="https://www.buymeacoffee.com/designbaa">
          <img src="/img/bmc-button.png" height="auto" width="150" />
        </a>
      </P>
      <P as="button" css={{ textDecoration: "underline", userSelect: "none", border: "none", background: "transparent" }}
        onClick={() => { ResetGame(); toast.dismiss(toastID) }}>Close</P>
    </P>)
  }

  useEffect(async () => {
    const attempts = window.localStorage.getItem("attempts");
    const lastPlayed = window.localStorage.getItem("lastPlayed");
    const _scrambledLetters = window.localStorage.getItem("letters");
    const _gameState = window.localStorage.getItem("complete");
    const soundForDelete = new Audio("/audio/delete.mp3");
    const clickAudio = new Audio("/audio/click.mp3");
    const wrongAudio = new Audio("/audio/wrong.mp3");
    const clearAudio = new Audio("/audio/clear.mp3");
    const crackAudio = new Audio("/audio/crack.mp3");
    const winnerAudio = new Audio("/audio/winner.mp3");
    const loserAudio = new Audio("/audio/loser.mp3");
    clearAudio.volume = .45;
    winnerAudio.volume = .5;
    loserAudio.volume = .5;

    setClickNoise(clickAudio);
    setCrackSound(crackAudio);
    setDeleteSound(soundForDelete);
    setWrongNoise(wrongAudio);
    setClearSound(clearAudio)
    setWinnerSound(winnerAudio);
    setLoserSound(loserAudio)


    if (lastPlayed == null) {
      window.localStorage.setItem("lastPlayed", new Date("02/20/2022"));
      ResetGame();
    } else {
      let isSameDay = datesAreOnSameDay(lastPlayed, new Date());
      if (isSameDay) {
        setSameDay(true);
        if (attempts && _scrambledLetters && _gameState) {
          setAttempts(attempts)
          if (_gameState == "true") {
            handleComplete(false);
          } else {
            setAttempts(attempts)
            let _Deserialize = JSON.parse(_scrambledLetters);
            setscrambledLetters(_Deserialize)
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

  function ResetGame() {
    window.localStorage.setItem("complete", false);
    window.localStorage.setItem("attempts", Attempts);
    setscrambledLetters(props ? props.data.words[0].scrambledLetters : []);
    window.localStorage.setItem("letters", JSON.stringify(props.data.words[0].scrambledLetters));
    window.localStorage.setItem("index", 0);
    setAttempts(5);
    setCurrentWord(0);
  }

  function datesAreOnSameDay(lastPlayed, date2) {
    const date1 = new Date(lastPlayed)
    return (date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate())
  }


  async function handleCopy(won) {
    let localAttemps = window.localStorage.getItem("attempts");
    let stringEggs = "";
    for (let i = 0; i < 5; i++) {
      if (i > localAttemps - 1) {
        stringEggs = stringEggs + "🍳 "
      } else {
        stringEggs = stringEggs + "🥚 "
      }
    }
    CopyButton.current.innerText = "Copied!"
    await window.navigator.clipboard.writeText(`${stringEggs} I ${won ? "" : "did not"} unscrambled today's word www.scrambledletters.com`)
    setTimeout(() => {
      CopyButton.current.innerText = "Share"
    }, 1000);
  }




  useEffect(() => {
    if (Attempts == 0) {
      setGameState("isLoser")
      setLetters([]);
      const failedToast = (GameOverToast(ResetGame, failedToast), {
        position: "top-center",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        onOpen: () => {
          if (LoserSound) {
            LoserSound.pause;
            LoserSound.currentTime = 0;
            LoserSound.play();
            if (!SameDay) {
              setscrambledLetters(hints.sort())
            } else {
              setscrambledLetters([]);
            }
          }
        }
      });
    }
  }, [Attempts])


  function CheckAnswer() {
    let _stringID = "";
    let _word = "";
    for (let i = 0; i < Letters.length; i++) {
      _stringID = _stringID + Letters[i].letter;
      _word = _word + alphabet[Letters[i].letter];
    }
    const _mainID = parseInt(_stringID);
    const isCorrect = _mainID == Answer;

    if (isCorrect) {

      handleComplete(true);

    } else {
      handleWrong();
    }
  }
  function handleComplete(addStreaks) {
    toast.clearWaitingQueue();
    setGameState("isWinner")
    window.localStorage.setItem("complete", true);
    setTimeout(() => {
      const completeToast = toast(FinishedToast(ResetGame, completeToast), {
        position: "top-center",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        onOpen: () => {
          if (WinnerSound) {
            WinnerSound.pause;
            WinnerSound.currentTime = 0;
            WinnerSound.play();
            if (!SameDay) {
              setscrambledLetters(hints.sort())
            } else {
              setscrambledLetters([]);
            }
          }
        }
      });
    }, 500);
  }
  async function handleWrong() {
    toast.clearWaitingQueue();
    let newScramble = [];
    newScramble = [...scrambledLetters];
    let spliceAtIndex;
    let hint = Math.floor(Math.random() * newScramble.length);
    let testHint = newScramble[hint];

    let test = hints.find(elem => elem.letter == testHint.letter);

    while (test) {
      hint = Math.floor(Math.random() * newScramble.length);
      testHint = newScramble[hint];
      test = hints.find(elem => elem.letter == testHint.letter);
    }

    spliceAtIndex = newScramble.findIndex(elem => elem == testHint)
    newScramble.splice(spliceAtIndex, 1);
    const data = JSON.stringify(newScramble)
    window.localStorage.setItem("letters", data);
    setscrambledLetters(newScramble);

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
      setLetters([])
    }, 1000);
  }


  const handleDelete = (index) => {
    if (Letters.length > 0) {
      let newLetters = [];
      newLetters = [...Letters]
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
  }
  function handleClear() {
    if (ClearSound) {
      ClearSound.pause;
      ClearSound.currentTime = 0;
      ClearSound.play();
    }
    setLetters([])
  }

  function handleClick(_letter) {
    let newLetters = [];
    newLetters = [...Letters]
    if (clickNoise) {
      clickNoise.pause;
      clickNoise.currentTime = 0;
      clickNoise.play();
    }
    if (!(Letters.length < 5)) return;
    newLetters.push(_letter);
    setLetters(newLetters);
  }

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
            <Container key={i} css={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <motion.div
                animate="move"
                variants={Rotate}
                transition={{ type: "spring", ease: "easeInOut" }}
                className={ImgContainer()}>
                <motion.img alt="Egg body" src="/img/egg_body.svg" />
              </motion.div>
              <motion.img src="/img/egg_feet.svg" />
            </Container>)
        })}
        {Yolk.map((i) => {
          return (
            <Container key={i} css={{ position: "relative", display: "flex", height: "100%", alignItems: "flex-end", justifyContent: "center" }}>
              <img src="/img/yolk.svg" />
            </Container>)
        })}
      </>
    )


  }

  return (
    <>
      <Head>
        <title>Scrambled Letters</title>
        <meta name="description" content="Daily word game where you try to guess the word of the day from a set of scrambled letters" />
      </Head>

      <Main className={styles.main}>
        {
          Loading ?
            <P className="cherry">...Loading Game</P>
            :
            <>
              <motion.div
                initial="hidden"
                animate="reveal"
                variants={FadeIn}
                transition={{ duration: .75, ease: "easeInOut", type: "spring" }}
              >
                <BrandHolder>
                  <P as="img" css={{ margin: "0 auto" }} width="40%" height="auto" src="/img/eggs.svg" />
                  <H1 css={{ marginBottom: 0, lineHeight: 1.1, "@sm": { fontSize: 28 } }} className="cherry">Scrambled Letters</H1>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: .75, delay: .25 }}
                  >
                    {GameState == "inProgress" ?
                      <P>Find today{`'s`} word from these scrambled letters</P>
                      :
                      <P>
                        Come back tomorrow for for a new word
                      </P>}
                  </motion.div>
                </BrandHolder>
              </motion.div>
              <Container css={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <HealthBar />
              </Container>

              <SubmittedLetters handleDelete={handleDelete} Letters={Letters} />

              <ScrambleLetters handleClick={handleClick} Letters={Letters} scrambledLetters={scrambledLetters} />

              <Container>
                {GameState == "inProgress" &&
                  <>
                    <Button isdisabled={Letters.length < 1} disabled={Letters.length < 1} onClick={handleClear} variant={'Clear'}>Clear</Button>
                    <Button isdisabled={Letters.length < 5} disabled={Letters.length < 5} onClick={CheckAnswer}> Submit</Button>
                  </>
                }
              </Container>
              <P as="a" onClick={() => {
                toast(<P as="div">
                  <P as="img" width="60%" height="auto" css={{ margin: "0 auto" }} src="/img/winner2.gif" />
                  <P>
                    Use the letters below to guess the word of the day. For each wrong guess a letter will be removed from the scrambled set. You have a total of 5 attempts before the word is revealed and it is game over.
                  </P>
                </P>, {
                  position: "top-center",
                  autoClose: false,
                  closeButton: true,
                })
              }} css={{ cursor: "pointer", textDecoration: "underline", marginTop: 24 }}>How to play</P>
            </>
        }

      </Main>
      <ToastContainer closeButton={false} autoClose={GameState != "inProgress"} limit={1}
      />
    </>
  );
}

Home.getInitialProps = async ({ req }) => {
  const { protocol, host } = absoluteUrl(req)
  const res = await fetch(`${protocol}//${host}/api/daily_word?date=${new Date()}`)
  const json = await res.json()
  return { data: json }
}

