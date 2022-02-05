import Head from "next/head";
import { useState, useEffect } from "react";
import absoluteUrl from 'next-absolute-url'
import styles from "../styles/Home.module.css";
import { alphabet } from "../lib/alphabet";
import { theme, styled } from "../stitches.config";
import LetterButton from "../components/LetterButton";
import { motion } from "framer-motion"
import SubmittedLetter from "../components/SubmittedLetter";
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
  padding: "5rem 0",
  flex: 1,
  display: " flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  "@sm": {
    padding: "3rem 0"
  }
})
const BrandHolder = styled("div", {
  display: " flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
})
const H1 = styled("h1", {
  font: "cherry",
  color: theme.colors.secondary,
  fontSize: 48,
  width: 250,
  marginTop: 0,
  marginBottom: 4,
  textAlign: "center",
  "@sm": {
    width: "100%",
    fontSize: 36
  }
});

const Button = styled("button", {
  width: 200,
  height: 80,
  marginTop: 16,
  backgroundColor: theme.colors.secondary,
  fontSize: 32,
  color: "white",
  borderColor: theme.colors.secondary,
  boxShadow: `0px 2px 0px ${theme.colors.secondary}`,
  letterSpacing: ".1em",
  borderRadius: 4,
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

const LetterHolder = styled("div", {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  margin: "20px 0px",
  gap: 8,
  justifyContent: "center"
})

export default function Home(props) {
  console.log(props);
  const scrambledLetters = props ? props.data.scrambledLetters : [];
  const hints = props ? props.data.hints : [];
  const Answer = props ? props.data.hashID : null;
  const [Letters, setLetters] = useState([]);
  const [deleteSound, setDeleteSound] = useState(null);
  const [clickNoise, setClickNoise] = useState(null);
  const [Wrong, setWrongNoise] = useState(null);
  const [Correct, setCorrect] = useState(false);
  const [Shake, setShake] = useState(false);

  useEffect(() => {
    const soundForDelete = new Audio("/audio/delete.mp3");
    const clickAudio = new Audio("/audio/click.mp3");
    const wrongAudio = new Audio("/audio/wrong.mp3");
    setClickNoise(clickAudio);
    setDeleteSound(soundForDelete);
    setWrongNoise(wrongAudio);
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


  function CheckAnswer() {
    let _stringID = "";
    for (let i = 0; i < Letters.length; i++) {
      _stringID = _stringID + Letters[i];
    }
    const _mainID = parseInt(_stringID);

    const isCorrect = (Web3.utils.keccak256(new BN(_mainID)) == Answer);
    if (!isCorrect) {
      setShake(true);
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
  const SubmittedLetters = () => {
    return (<LetterHolder>
      {Letters.map((l, i) => {
        return (
          <motion.div
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            key={i}>
            <SubmittedLetter handleDelete={() => handleDelete(i)} >{alphabet[l]}</SubmittedLetter>
          </motion.div>)
      })}
    </LetterHolder>)
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
              <P>Solve the scrambled letters 5 letters do not belong in the answer</P>
            </motion.div>

          </BrandHolder>
        </motion.div>
        <motion.div
          initial="default"
          animate={Shake ? "shake" : "default"}
          transition={{ type: "spring" }}
          variants={ShakeNo}
        >
          <SubmittedLetters />
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
        <LetterHolder>
          <Button onClick={CheckAnswer}>Submit</Button>
        </LetterHolder>
      </Main>
    </>
  );
}

Home.getInitialProps = async ({ req }) => {
  const { protocol, host } = absoluteUrl(req)
  const res = await fetch(`${protocol}//${host}/api/daily_word`)
  const json = await res.json()
  console.log(json);
  return { data: json }
}

