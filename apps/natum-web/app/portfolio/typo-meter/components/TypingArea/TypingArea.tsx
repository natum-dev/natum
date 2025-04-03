"use client";

import { ChangeEvent, KeyboardEvent, useCallback, useRef } from "react";
import WordsCarousel from "../Words/WordsCarousel";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { dispatchWordAtom, WordsAtomAction } from "../../store/atoms/Words";
import {
  textInputResetAtom,
  textInputCursorPositionAtom,
  textValueAtom,
} from "../../store/atoms/TextInput";
import styles from "./TypingArea.module.scss";
import {
  dispatchTestManagerAtom,
  testManagerAtom,
  TestManagerStatusAction,
} from "../../store/atoms/TestManager";

const TypingArea = () => {
  const dispatch = useSetAtom(dispatchWordAtom);
  const [textValue, setTextValue] = useAtom(textValueAtom);
  const resetTextInput = useSetAtom(textInputResetAtom);
  const setActiveCursorPosition = useSetAtom(textInputCursorPositionAtom);
  const { status } = useAtomValue(testManagerAtom);
  const dispatchTestManager = useSetAtom(dispatchTestManagerAtom);
  const inputRef = useRef<HTMLInputElement>(null);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const input = e.currentTarget;

      // If space is hit, skips the change and keyup lifecycle
      if (e.code === "Space" || e.key === " ") {
        e.stopPropagation();
        e.preventDefault();
        if (input.value) {
          dispatch({ type: WordsAtomAction.SELECT_NEXT_WORD });
        }
        resetTextInput();
      }
    },
    [dispatch, resetTextInput]
  );

  const onKeyUp = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      setActiveCursorPosition(input.selectionStart ?? 0);
    },
    [setActiveCursorPosition]
  );

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      // If there's text value change skip onKeyUp and instead set the selectionRange here
      e.stopPropagation();

      if (status === "idle") {
        dispatchTestManager({ type: TestManagerStatusAction.START });
      }

      const input = e.target;
      setTextValue(input.value);
      setActiveCursorPosition(input.selectionStart ?? 0);
    },
    [dispatchTestManager, setActiveCursorPosition, setTextValue, status]
  );

  const reset = useCallback(() => {
    dispatchTestManager({ type: TestManagerStatusAction.RESET });
    setTextValue("");
    inputRef.current?.focus();
    setActiveCursorPosition(0);
  }, [dispatchTestManager, setActiveCursorPosition, setTextValue]);

  return (
    <div className={styles.container}>
      <WordsCarousel />
      <div className={styles.control_area}>
        <input
          ref={inputRef}
          autoComplete="false"
          spellCheck="false"
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onChange={onChange}
          value={textValue}
          className={styles.input}
          disabled={status === "finished"}
          autoFocus
          placeholder="Type here..."
        />
        <button type="button" className={styles.reset_button} onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default TypingArea;
