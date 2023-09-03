import { style, globalStyle } from "@vanilla-extract/css";

globalStyle("body", {
  margin: 0,
});

export const boardContainer = style({
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-around",
});

export const boardContainerInner = style({
  display: "flex",
  justifyContent: "space-around",
});

export const snake = style({
  background: "#0f0",
});
export const food = style({
  background: "#f00",
});
export const board = style({
  display: "grid",
  gap: 1,
  width: "min(80vh, 80vw)",
  height: "min(80vh, 80vw)",
  backgroundColor: "black",
});
