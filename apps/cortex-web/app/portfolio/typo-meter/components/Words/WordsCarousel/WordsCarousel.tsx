"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Word from "../Word";
import styles from "./WordsCarousel.module.scss";
import { useAtomValue, useSetAtom } from "jotai";
import {
  activeIndexWordAtom,
  activeWordAtom,
  appendWordAtom,
  wordsAtom,
} from "../../../store/atoms/Words";
import {
  textInputCursorPositionAtom,
  textValueAtom,
} from "../../../store/atoms/TextInput";
import { getLineHeight } from "@/lib/helpers/dom";

const WordsCarousel = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const currentWord = useAtomValue(activeWordAtom);
  const words = useAtomValue(wordsAtom);
  const currentWordIndex = useAtomValue(activeIndexWordAtom);
  const textValue = useAtomValue(textValueAtom);
  const cursorPosition = useAtomValue(textInputCursorPositionAtom);
  const dispatchAppendWords = useSetAtom(appendWordAtom);

  useEffect(() => {
    if (words.length && words.length - currentWordIndex <= 50) {
      dispatchAppendWords();
    }
  }, [words, currentWordIndex, dispatchAppendWords]);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;

    const lineHeight = getLineHeight(container);
    container.parentElement!.style.setProperty(
      "height",
      `calc(2 * ${lineHeight}px)`
    );
  }, []);

  useLayoutEffect(() => {
    const highlight = highlightRef.current;
    const container = ref.current;

    if (!highlight || !container) return;

    const curr = container.children[currentWordIndex + 1];

    if (!curr) return;

    const { top: containerTop, left: containerLeft } =
      container.getBoundingClientRect();

    let targetIndex = Math.min(cursorPosition, curr.childElementCount - 1);

    const targetCharacter = curr.children[targetIndex];
    const { left, top, width } = targetCharacter.getBoundingClientRect();

    highlight.style.setProperty("left", left - containerLeft + "px");
    highlight.style.setProperty("width", width + "px");

    const topPosition = top - containerTop;
    if (topPosition !== 0) {
      container.style.setProperty("margin-top", -topPosition + "px");
    }
  }, [currentWord?.value.length, currentWordIndex, cursorPosition, textValue]);

  return (
    // Wrapper + Wrapper's children acts as sliding window
    <div ref={wrapperRef} className={styles.wrapper}>
      <div>
        {/* This div used to calculate the words position etc */}
        <div ref={ref}>
          <span className={styles.highlight} ref={highlightRef}>
            &nbsp;
          </span>
          {words.map((word, i) => {
            return (
              <Word
                key={i}
                {...word}
                {...(i === currentWordIndex ? { inputtedText: textValue } : {})}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WordsCarousel;
