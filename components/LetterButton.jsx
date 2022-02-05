import React, { useRef, useState, useEffect } from 'react';
import { styled, theme } from '../stitches.config';
import { alphabet } from '../lib/alphabet';


export default function LetterButton({ letter, handleClick, value }) {

    const [Pressed, setPressed] = useState(false);


    function handlePress() {
        setPressed(true)
        setTimeout(() => {
            setPressed(false)
        }, 100);
        handleClick(letter);
    }

    const LetterButton = styled("button", {
        height: 80,
        width: 60,
        backgroundColor: theme.colors.primary,
        border: "1px solid $secondary",
        fontSize: 32,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        color: 'white',
        userSelect: "none",
        boxShadow: `0px 2px 0px ${theme.colors.secondary}`,
        variants: {
            pressed: {
                true: {
                    boxShadow: `0px 0px 0px ${theme.colors.secondary}`,
                },
                false: {
                    boxShadow: `0px 2px 0px ${theme.colors.secondary}`,
                }
            }
        },
        "@sm": {
            fontSize: 24,
            height: 70,
            width: 60,
        }
    })
    return (
        <LetterButton
            pressed={Pressed ? "true" : "false"}
            onClick={handlePress}
            onMouseDown={handlePress}
        >
            {alphabet[letter]}
        </LetterButton>)

}
