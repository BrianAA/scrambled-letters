import SubmittedLetter from "./SubmittedLetter";
import React from "react";
import { styled } from "@stitches/react";
import { motion } from "framer-motion";
import { alphabet } from "../lib/alphabet";
const LetterHolder = styled("div", {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    margin: "16px 0px",
    width: "100%",
    minHeight: "auto",
    justifyContent: "space-between"
})

const FadeIn = {
    hidden: { opacity: 0, y: "0%" },
    reveal: { opacity: 1, y: "0%" },
}

const SlideIn = {
    hidden: { opacity: 0, y: "100%" },
    reveal: { opacity: 1, y: "0%" },
}

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
                        initial={SlideIn.hidden}
                        animate={SlideIn.reveal}
                        transition={{ type: "tween" }}
                        key={i}>
                        <SubmittedLetter handleDelete={() => handleDelete(i)} >{l.value}</SubmittedLetter>
                    </motion.div>)
            })}
            {EmptyArray.map((l, i) => {
                return (
                    <motion.div
                        animate={FadeIn.reveal}
                        transition={{ type: "tween" }}
                        key={i}>
                        <SubmittedLetter isEmpty />
                    </motion.div>)
            })}
        </LetterHolder>
    )
})

SubmittedLetters.displayName = "SubmittedLetters";



export default SubmittedLetters