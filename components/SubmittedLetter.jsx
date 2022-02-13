import React, { useRef, useState, useEffect } from 'react';
import { styled, theme } from '../stitches.config';
import { alphabet } from '../lib/alphabet';

export default function SubmittedLetter({ children, isEmpty, Correct, handleDelete }) {
    const Letter = styled("button", {
        position: "relative",
        height: 80,
        width: 60,
        overflow: "visible",
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
            },
            Empty: {
                true: {
                    border: "1px solid transparent",
                    boxShadow: `0px 0px 0px ${theme.colors.secondary}`,
                },
            },
        },

        compoundVariants: [{
            pressed: false,
            Empty: true,
            css: {
                border: "1px solid transparent",
                boxShadow: `0px 0px 0px ${theme.colors.secondary}`,
            }
        }],
        "@sm": {
            fontSize: 24,
            height: 70,
            width: 60,
        }
    })

    const DeleteIndicator = styled("div", {
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        top: -4,
        right: -4,
        pointerEvents: "none",
        backgroundColor: theme.colors.secondary,
        color: "white",
        borderRadius: "99999px",
        height: 16,
        width: 16,
        fontSize: 8,
    })
    return (
        <Letter
            Empty={isEmpty}
            onClick={handleDelete}>
            {!isEmpty &&
                <DeleteIndicator>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="10" width="10" fill="#FFFFFF"><title>Close</title><path id="close_svg__close" d="M13,3.65,12.35,3,8,7.34,3.65,3,3,3.65,7.34,8,3,12.35l.65.65L8,8.66,12.35,13l.65-.65L8.66,8Z" /></svg>
                </DeleteIndicator>
            }
            {children}
        </Letter>);
}
