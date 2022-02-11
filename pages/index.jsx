import Head from "next/head";
import { useRouter } from 'next/router'
import React, { useState, useEffect } from "react";
import absoluteUrl from 'next-absolute-url'
import styles from "../styles/Home.module.css";
import { alphabet } from "../lib/alphabet";
import { theme, styled } from "../stitches.config";
import LetterButton from "../components/LetterButton";
import { motion } from "framer-motion"
import SubmittedLetter from "../components/SubmittedLetter";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Web3 = require("web3");
const BN = Web3.utils.BN;

const FadeIn = {
  hidden: { opacity: 0, y: "-100%" },
  reveal: { opacity: 1, y: "0%" },
}
const ShakeNo = {
  shake: { x: 1 },
  default: { x: 0 },
}
const Main = styled("main", {
  height: "100vh",
  flex: 1,
  display: " flex",
  maxWidth: 350,
  margin: "0 auto",
  paddingBottom: 150,
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
  marginBottom: 4,
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
    variant: {
      Clear: {
        backgroundColor: "#F2EAEF",
        color: theme.colors.secondary,
      }
    }
  }
})
const P = styled("p", {
  color: theme.colors.secondary,
  textAlign: "center",
  letterSpacing: ".1em",
  fontSize: 18,
  maxWidth: 300,
  lineHeight: 1.25,
  marginBottom: 16,
  "@sm": {
    fontSize: 16,
    padding: "0 16px",
    maxWidth: "100%",
  }
})
const Box = styled("div", {
  width: "100%"
})

const LetterHolder = styled("div", {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  margin: "16px 0px",
  width: "100%",
  minHeight: "auto",
  justifyContent: "space-between"
})

const SubmittedLetters = React.memo(({ Letters, handleDelete }) => {
  let EmptyArray = ["", "", "", "", ""]
  for (let p = 0; p < Letters.length; p++) {
    EmptyArray.pop();
  }
  return (
    <LetterHolder>
      {Letters.map((l, i) => {
        return (
          <motion.div
            initial={FadeIn.hidden}
            animate={FadeIn.reveal}
            transition={{ type: "tween" }}
            key={i}>
            <SubmittedLetter handleDelete={() => handleDelete(i)} >{alphabet[l]}</SubmittedLetter>
          </motion.div>)
      })}
      {EmptyArray.map((l, i) => {
        return (
          <motion.div
            initial={FadeIn.hidden}
            animate={FadeIn.reveal}
            transition={{ type: "tween" }}
            key={i}>
            <SubmittedLetter isEmpty />
          </motion.div>)
      })}
    </LetterHolder>
  )
})


export default function Home(props) {
  const router = useRouter()
  const scrambledLetters = props ? props.data.scrambledLetters : [];
  const hints = props ? props.data.hints : [];
  const Answer = props ? props.data.hashID : null;
  const [Letters, setLetters] = useState([]);
  const [deleteSound, setDeleteSound] = useState(null);
  const [clickNoise, setClickNoise] = useState(null);
  const [Wrong, setWrongNoise] = useState(null);
  const [ClearSound, setClearSound] = useState(null)
  const [Correct, setCorrect] = useState(false);
  const [Shake, setShake] = useState(false);
  const [Time, setTime] = useState(0);
  const [TotalSeconds, setTotalSeconds] = useState(0)
  const [TotalMins, setTotalMin] = useState(0)
  useEffect(() => {
    const soundForDelete = new Audio("/audio/delete.mp3");
    const clickAudio = new Audio("/audio/click.mp3");
    const wrongAudio = new Audio("/audio/wrong.mp3");
    const clearAudio = new Audio("/audio/clear.mp3");
    clearAudio.volume = .45;
    setClickNoise(clickAudio);
    setDeleteSound(soundForDelete);
    setWrongNoise(wrongAudio);
    setClearSound(clearAudio)
    setTimeout(function () { currentTime() }, 1000);
  }, []);

  useEffect(() => {
    if (Shake) {
      if (Wrong) {
        Wrong.pause;
        Wrong.currentTime = 0;
        Wrong.play();
      }
      setTimeout(() => {
        setShake(false);
      }, 100);
    }

  }, [Shake]);

  function currentTime() {
    if (TotalSeconds > 59) {
      setTotalSeconds(0);
      setTotalMin(TotalMins++);
    } else {
      setTotalSeconds(TotalSeconds++)
    }

    let formatMins = "";
    let formatSeconds = "";
    if (TotalMins < 10) {
      formatMins = `0${TotalMins}`
    } else {
      formatMins = `${TotalMins}`
    }
    if (TotalSeconds < 10) {
      formatSeconds = `:0${TotalSeconds}`
    } else {
      formatSeconds = `:${TotalSeconds}`
    }
    setTime(`${formatMins}${formatSeconds}`)
    setTimeout(function () { currentTime() }, 1000);

  }

  function CheckAnswer() {
    let _stringID = "";
    for (let i = 0; i < Letters.length; i++) {
      _stringID = _stringID + Letters[i];
    }
    const _mainID = parseInt(_stringID);

    const isCorrect = (Web3.utils.keccak256(new BN(_mainID)) == Answer);
    if (!isCorrect) {
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
              <P>Unscrambled the 5 letter word</P>

            </motion.div>
          </BrandHolder>
        </motion.div>
        {/* <Box css={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <img src="/img/clock.svg" />
          <Box css={{ paddingTop: 2, marginLeft: 8 }}>{Time}</Box>
        </Box> */}
        <motion.div
          style={{ width: "100%" }}
          initial="default"
          animate={Shake ? "shake" : "default"}
          transition={{ type: "tween" }}
          variants={ShakeNo}
        >
          <SubmittedLetters handleDelete={handleDelete} Letters={Letters} />
        </motion.div>
        <LetterHolder>
          {scrambledLetters && scrambledLetters.map((letter, i) => {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .1, delay: .2 * i }}
              >

                <LetterButton handleClick={handleClick} letter={letter} />
              </motion.div>)
          })}
        </LetterHolder>
        <LetterHolder css={{ maxWidth: 350, position: "absolute", bottom: 32, gridGap: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%" }}>
          <Button onClick={handleClear} variant={'Clear'}>Clear</Button>
          <Button onClick={CheckAnswer}>Submit</Button>
        </LetterHolder>
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

