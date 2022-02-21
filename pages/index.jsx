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
  height: "100vh",
  flex: 1,
  display: " flex",
  maxWidth: 350,
  margin: "0 auto",

  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
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
  const [Loading, setLoading] = useState(true);
  const [CurrentWord, setCurrentWord] = useState(null)
  const [scrambledLetters, setscrambledLetters] = useState([])
  const [Answer, setAnswer] = useState(null)
  const [Letters, setLetters] = useState([]);
  const [deleteSound, setDeleteSound] = useState(null);
  const [Attempts, setAttempts] = useState(5);
  const [Correct, setCorrect] = useState(false);
  const [GameState, setGameState] = useState("inProgress");
  const [clickNoise, setClickNoise] = useState(null);
  const [Wrong, setWrongNoise] = useState(null);
  const [ClearSound, setClearSound] = useState(null)
  const [CrackSound, setCrackSound] = useState(null);
  const [Copied, setCopied] = useState(false)
  const CopyButton = useRef();
  const FinishedToast = () => {
    return (<P as="div" css={{ textAlign: "center" }}>
      <P as="img" css={{ margin: "0 auto" }} width="60%" height="auto" src="/img/winner.gif" />
      <P as="div" css={{ margin: "0 auto", fontSize: 20, width: "90%" }} className="cherry">You unscrambled today{`'s`} set of words</P>
      <P as="div" css={{ fontSize: 16, width: "100%" }} >Come back tomorrow for a new set of scrambled words</P>
      <Button ref={CopyButton} css={{ fontSize: 16 }} onClick={handleCopy}>Share</Button>
      <P as="div" css={{ "&:hover": { opacity: .75 }, transition: "all .25s", marginTop: 24, }}>
        <a href="https://www.buymeacoffee.com/designbaa">
          <img src="/img/bmc-button.png" height="auto" width="150" />
        </a>
      </P>
    </P>)
  }
  const GameOverToast = () => {
    return (<P as="div" css={{ textAlign: "center" }}>
      <P as="img" css={{ margin: "0 auto" }} width="50%" height="auto" src="/img/gameover.gif" />
      <P as="div" css={{ margin: "0 auto", fontSize: 24, width: "90%" }} className="cherry">Game over</P>
      <P as="div" css={{ fontSize: 16, width: "100%" }} >Come back tomorrow for some fresh eggs and new words</P>
      <Button ref={CopyButton} css={{ fontSize: 16 }} onClick={handleCopy}>Share</Button>
      <P as="div" css={{ "&:hover": { opacity: .75 }, transition: "all .25s", marginTop: 24, }}>
        <a href="https://www.buymeacoffee.com/designbaa">
          <img src="/img/bmc-button.png" height="auto" width="150" />
        </a>
      </P>
    </P>)
  }
  const correctToast = () => {
    return (<P as="div" css={{ textAlign: "center" }}>
      <P as="img" css={{ margin: "0 auto" }} width="50%" height="auto" src="/img/winner2.gif" />
      <P as="div" css={{ margin: "0 auto", width: "90%" }} className="cherry">Eggsellent...on to the next word</P>
    </P>)
  }
  useEffect(async () => {
    const attempts = window.localStorage.getItem("attempts");
    const localIndex = window.localStorage.getItem("index");
    const lastPlayed = window.localStorage.getItem("lastPlayed");
    const soundForDelete = new Audio("/audio/delete.mp3");
    const clickAudio = new Audio("/audio/click.mp3");
    const wrongAudio = new Audio("/audio/wrong.mp3");
    const clearAudio = new Audio("/audio/clear.mp3");
    const crackAudio = new Audio("/audio/crack.mp3");
    clearAudio.volume = .45;

    setClickNoise(clickAudio);
    setCrackSound(crackAudio);
    setDeleteSound(soundForDelete);
    setWrongNoise(wrongAudio);
    setClearSound(clearAudio)

    if (lastPlayed == null) {
      window.localStorage.setItem("lastPlayed", new Date("02/20/2022"));
      ResetGame();
    } else {
      if (datesAreOnSameDay(lastPlayed, new Date())) {
        if (attempts && localIndex) {
          setAttempts(attempts)
          setCurrentWord(parseInt(localIndex));
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
    window.localStorage.setItem("attempts", Attempts);
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
  useEffect(() => {
    console.log(CurrentWord);
    if (GameState != "isDone") {
      if (CurrentWord != null && CurrentWord < props.data.words.length) {
        setscrambledLetters(props ? props.data.words[CurrentWord].scrambledLetters : [])
        setAnswer(props ? props.data.words[CurrentWord].hashID : [])
      }
      if (CurrentWord == props.data.words.length) {
        setGameState("isDone")
        setscrambledLetters([])
        setAnswer(null)
        toast(FinishedToast, {
          position: "top-center",
          autoClose: false,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          onClose: () => {
            setCurrentWord(3);
          }
        });
      }
    }
  }, [CurrentWord])

  async function handleCopy() {
    let stringEggs = "";
    for (let i = 0; i < 5; i++) {
      if (i > Attempts - 1) {
        stringEggs = stringEggs + "🍳 "
      } else {
        stringEggs = stringEggs + "🥚 "
      }
    }
    console.log(CopyButton.current);
    console.log("Copied");
    CopyButton.current.innerText = "Copied!"
    await window.navigator.clipboard.writeText(`${stringEggs} I unscrambled ${CurrentWord}/${props.data.words.length} words today www.scrambledletters.com`)
    setTimeout(() => {
      CopyButton.current.innerText = "Share"
    }, 1000);
  }

  useEffect(() => {
    if (Correct) {
      window.localStorage.setItem("index", CurrentWord);
      setTimeout(() => {
        setCorrect(false);
        setLetters([]);
      }, 100);
    }
  }, [Correct])


  useEffect(() => {
    if (Attempts == 0) {
      setGameState("isDone")
      setLetters([]);
      toast(GameOverToast, {
        position: "top-center",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
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
    const isCorrect = (Web3.utils.keccak256(new BN(_mainID)) == Answer);
    if (isCorrect) {
      if (CurrentWord < props.data.words.length) {
        toast(correctToast, {
          position: "top-center",
          autoClose: 1500,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          onClose: () => {
            let index = CurrentWord + 1;
            setCurrentWord(index);
            setCorrect(true);
          }
        });
      } else {
        setGameState("isDone")

      }
    } else {
      handleWrong();
    }
  }

  function handleWrong() {
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
  function handleClear(playSound) {
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
    console.log(_letter);
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
        <meta name="description" content="Daily word game where you try to solve the unscrambled words. There are 2 letters that do no belong in the word. Can you figure it out?" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {
        Loading ?
          <P className="cherry">...Loading Game</P>
          :
          <Main className={styles.main}>
            <motion.div
              initial="hidden"
              animate="reveal"
              variants={FadeIn}
              transition={{ duration: .75, ease: "easeInOut", type: "spring" }}
            >
              <BrandHolder>
                <img src="/img/eggs.svg" />
                <H1 className="cherry">Scrambled Letters</H1>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: .75, delay: .25 }}
                >
                  {GameState == "inProgress" ?
                    <P>Unscramble the {props.data.words.length} words. Guess the wrong word and you break an egg.</P>
                    :
                    <P>
                      Come back tomorrow for a new set of words
                    </P>}
                  {CurrentWord > 0 ? <P css={{ fontWeight: "bold" }}>{CurrentWord}/{props.data.words.length} words</P> : <P css={{ fontWeight: "bold" }}>0/{props.data.words.length} words</P>}
                </motion.div>
              </BrandHolder>
            </motion.div>
            <Container css={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <HealthBar />
            </Container>

            <SubmittedLetters handleDelete={handleDelete} Letters={Letters} />
            {Attempts > 0 &&
              <ScrambleLetters handleClick={handleClick} Letters={Letters} scrambledLetters={scrambledLetters} />
            }
            <Container>
              {GameState == "inProgress" &&
                <>
                  <Button isdisabled={Letters.length < 1} disabled={Letters.length < 1} onClick={handleClear} variant={'Clear'}>Clear</Button>
                  <Button isdisabled={Letters.length < 5} disabled={Letters.length < 5} onClick={CheckAnswer}> Submit</Button>
                </>
              }
            </Container>
          </Main>
      }

      <ToastContainer closeButton={false} autoClose={GameState == "isDone"} limit={1}
      />
    </>
  );
}

Home.getInitialProps = async ({ req }) => {
  const { protocol, host } = absoluteUrl(req)
  const res = await fetch(`${protocol}//${host}/api/daily_word`)
  const json = await res.json()
  return { data: json }
}

