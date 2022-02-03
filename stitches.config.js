// stitches.config.ts
import { createStitches } from "@stitches/react";

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: {
    colors: {
      primary: "#FFA726",
      secondary: "#6B184E",
      text: "#666666",
    },
  },
  fonts: {
    main: "cherry",
  },
  media: {
    sm: "(max-width: 480px)",
  },
  utils: {
    marginX: (value) => ({ marginLeft: value, marginRight: value }),
  },
});
