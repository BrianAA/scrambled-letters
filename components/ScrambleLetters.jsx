import React from 'react'
import { styled } from '@stitches/react'
import LetterButton from './LetterButton'
import { motion } from 'framer-motion'

const LetterHolder = styled("div", {
    display: "flex",
    alignItems: "center",
    rowGap: 16,
    flexWrap: "wrap",
    margin: "16px 0px",
    width: "100%",
    justifyContent: "space-between",
    minHeight: "auto",
})


export default function ScrambleLetters({ handleClick, Letters, scrambledLetters }) {
    function handleUsed(_letterInfo) {
        if (Letters.includes(_letterInfo)) {
            return true;
        } else {
            return false;
        }
    }
    return (
        <LetterHolder>
            {scrambledLetters && scrambledLetters.map((letterInfo, i) => {
                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: .1, delay: .2 * i }}
                    >

                        <LetterButton Used={handleUsed(letterInfo)} handleClick={handleClick} letterInfo={letterInfo} />
                    </motion.div>)
            })}
        </LetterHolder>
    )
}
