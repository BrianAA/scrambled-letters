import React, { useRef, useState, useEffect } from 'react';
import { styled, theme } from '../stitches.config';
import { alphabet } from '../lib/alphabet';


export default function LetterButton({ letterInfo, Used, handleClick, value }) {

    const [Pressed, setPressed] = useState(false);

    function handlePress() {
        setPressed(true)
        setTimeout(() => {
            setPressed(false)
        }, 100);
        handleClick(letterInfo);
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
            },
            used: {
                true: {
                    opacity: .5,
                },
                false: {
                    opacity: 1,
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
            used={Used ? "true" : "false"}
            disabled={Used}
            onClick={handlePress}
            onMouseDown={handlePress}
        >
            {alphabet[letterInfo.letter]}
        </LetterButton>)

}
