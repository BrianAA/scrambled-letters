import React, { useRef, useState, useEffect } from 'react';
import { styled, theme } from '../stitches.config';
import { alphabet } from '../lib/alphabet';

export default function SubmittedLetter() {
    const Letter = styled("button", {
        height: 80,
        width: 60,
        backgroundColor: "#F2EAEF",
        border: "1px solid $secondary",
        fontSize: 32,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        color: theme.colors.secondary,
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
        }
    })
    return <Letter></Letter>;
}
