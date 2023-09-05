import { style, globalStyle } from "@vanilla-extract/css";

globalStyle("body", {
  margin: 0,
});

export const boardContainer = style({
  height: "100vh",
  display: "flex",
  justifyContent: "space-around",
});
export const boardContainerInner = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-around",
});
export const scoreRow = style({
  paddingBottom: "1em",
});
export const statusRow = style({
  paddingTop: "1em",
});

export const len9CharsGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(13, 1fr)",
  gridAutoRows: "1fr",

  "::before": {
    content: "",
    width: 0,
    paddingBottom: "100%",
    gridRow: "1 / 1",
    gridColumn: "1 / 1",
  },
});
const blockBase = style({
  selectors: {
    [`${len9CharsGrid} > &:first-child`]: {
      gridRow: "1 / 1",
      gridColumn: "1 / 1",
    },
  },
});
export const block1 = style([
  blockBase,
  {
    background: "#000",
  },
]);
export const block0 = style([
  blockBase,
  {
    background: "none",
  },
]);

export const snake = style({
  background: "#0f0",
});
export const food = style({
  background: "#f00",
});
export const board = style({
  display: "grid",
  gap: 1,
  width: "min(70vh, 70vw)",
  height: "min(70vh, 70vw)",
  backgroundColor: "black",
});
