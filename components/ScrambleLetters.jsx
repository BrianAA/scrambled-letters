import React from 'react'
import { styled } from '@stitches/react'
import LetterButton from './LetterButton'
import { motion } from 'framer-motion'

const LetterHolder = styled("div", {
    display: "flex",
    alignItems: "center",
    rowGap: 16,
    columnGap: 12,
    flexWrap: "wrap",
    margin: "16px 0px",
    width: "100%",
    justifyContent: "center",
    minHeight: "auto",
})


export default function ScrambleLetters({ handleClick, Letters, scrambledLetters }) {
    function handleUsed(_letterInfo) {
        let usedLetter=false;
        for(let i=0;i<Letters.length;i++){
            const id=Letters[i].id;
            if(id==_letterInfo.id){
                usedLetter=true;
            }
        }
        return usedLetter
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

                        <LetterButton Used={handleUsed({id:i,value:letterInfo})} handleClick={handleClick} letterInfo={{id:i,value:letterInfo}} />
                    </motion.div>)
            })}
        </LetterHolder>
    )
}
