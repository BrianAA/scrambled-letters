import Head from "next/head";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { scrambledLetters } from "../lib/src/guessData";
import { alphabet } from "../lib/alphabet";
import { theme, styled } from "../stitches.config";
import LetterButton from "../components/LetterButton";
const H1 = styled("h1", {
  font: "cherry",
  color: theme.colors.secondary,
  fontSize: 48,
  width: 250,
  marginTop: 0,
  marginBottom: 4,
  textAlign: "center",
});
const P = styled("p", {
  color: theme.colors.secondary,
  fontSize: 16,
  marginBottom: 48
})
const LetterHolder = styled("div", {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
  justifyContent: "center"
})

export default function Home() {
  const [Letters, setLetters] = useState([]);
  const [deleteSound, setDeleteSound] = useState(null);
  const [clickNoise, setClickNoise] = useState(null);
  useEffect(() => {
    const soundForDelete = new Audio("/audio/delete.mp3");
    const clickAudio = new Audio("/audio/click.mp3");
    setClickNoise(clickAudio);
    setDeleteSound(soundForDelete);
    console.log(`Letters length ${Letters.length}`, Letters)
    document.addEventListener("keydown", handleDelete);
    return () => {
      document.removeEventListener("keydown", handleDelete);;
    };
  }, []);


  const handleDelete = (e) => {
    if (e.which === 8 && Letters.length > 0) {
      let newLetters = Letters;
      if (deleteSound) {
        deleteSound.play();
      }
      newLetters.pop();
      setLetters(newLetters);
      console.log(Letters);
    }
  }

  function handleClick(_letter) {
    let newLetters = Letters;
    console.log(`Letters length ${Letters.length}`, Letters)
    if (clickNoise) {
      clickNoise.play();
    }

    if (!(Letters.length < 5)) return;
    newLetters.push(_letter);
    setLetters(Letters);
    console.log(Letters);
  }
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <img src="/img/eggs.svg" />
        <H1 className="cherry">Scrambled Letters</H1>
        <P className="cherry">Solve the scrambled letters 3 letters do not belong</P>
        <LetterHolder>
          {/* {Letters && Letters.map((_letter, i) => {
            return <p>{alphabet[_letter]}</p>
          })} */}
        </LetterHolder>
        <LetterHolder>
          {scrambledLetters.map((letter, i) => {
            return <LetterButton handleClick={handleClick} letter={letter} key={i} />
          })}

        </LetterHolder>
      </main>
    </>
  );
}
