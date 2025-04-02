import { atom } from "jotai";

export const textValueAtom = atom("");

export const textInputCursorPositionAtom = atom(0);

export const textInputResetAtom = atom(null, (_, set) => {
  set(textValueAtom, "");
  set(textInputCursorPositionAtom, 0);
});
