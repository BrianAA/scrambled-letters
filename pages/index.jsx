import Head from "next/head";
import { useRouter } from 'next/router'
import React, { useState, useEffect } from "react";
import absoluteUrl from 'next-absolute-url'
import styles from "../styles/Home.module.css";
import { alphabet } from "../lib/alphabet";
import { theme, styled, css } from "../stitches.config";
import LetterButton from "../components/LetterButton";
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
const ShakeNo = {
  shake: {
    transition: {
      repeat: Infinity,
      duration: randomDuration()
    }, x: [-2, 2]
  },
  default: { x: 0 },
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
  const scrambledLetters = props ? props.data.scrambledLetters : [];
  const hints = props ? props.data.hints : [];
  const Answer = props ? props.data.hashID : null;
  const [Letters, setLetters] = useState([]);
  const [deleteSound, setDeleteSound] = useState(null);
  const [Attempts, setAttempts] = useState(5);
  const [Correct, setCorrect] = useState(false);
  const [clickNoise, setClickNoise] = useState(null);
  const [Wrong, setWrongNoise] = useState(null);
  const [ClearSound, setClearSound] = useState(null)
  const [CrackSound, setCrackSound] = useState(null);
  const [Shake, setShake] = useState(false);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (Shake) {
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
      }
      setTimeout(() => {
        setShake(false);
        setLetters([])
      }, 1000);
    }

  }, [Shake]);

  useEffect(() => {
    if (Attempts == 0) {
      toast(<P><div>🥚</div>Game Over</P>, {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
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
    if (!isCorrect) {
      console.log(_word);
      setShake(true);
      toast(<P><div>🥚</div> Sorry not it. This one a tough one to crack!</P>, {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

    } else {
      setCorrect(true);
      toast(<P><div>🍳</div> Eggsellant! You cracked the code...on to the next one</P>, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClose: props => router.reload(window.location.pathname),
      });
    }
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
              <P>Solve the 5 letter word in 5 attempts using the letters below.</P>
            </motion.div>
          </BrandHolder>
        </motion.div>
        <Container css={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <HealthBar />
        </Container>

        <motion.div
          style={{ width: "100%" }}
          initial="default"
          animate={Shake ? "shake" : "default"}
          transition={{ type: "spring", ease: "easeInOut", duration: 100 }}
          variants={ShakeNo}
        >
          <SubmittedLetters handleDelete={handleDelete} Letters={Letters} />
        </motion.div>
        <ScrambleLetters handleClick={handleClick} Letters={Letters} scrambledLetters={scrambledLetters} />
        <Container>
          {Attempts > 0 ?
            <>
              <Button isdisabled={Letters.length < 1} disabled={Letters.length < 1} onClick={handleClear} variant={'Clear'}>Clear</Button>
              <Button isdisabled={Letters.length < 5} disabled={Letters.length < 5} onClick={Correct ? () => router.reload(window.location.pathname) : CheckAnswer}>{Correct ? "Next" : "Submit"}</Button>
            </>
            :
            <Button onClick={() => router.reload(window.location.pathname)}>New Word</Button>
          }


        </Container>
      </Main>
      <ToastContainer
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

