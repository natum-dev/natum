"use client";

import { memo, useMemo } from "react";
import {
  WordState,
  type Word as WordType,
} from "@/app/portfolio/typo-meter/store/atoms/Words";
import styles from "./Word.module.scss";
import classNames from "classnames";

type Props = WordType;

const Word = ({ status, value, inputtedText }: Props) => {
  const characters = useMemo(() => {
    return [...value.trim().split(""), " "];
  }, [value]);

  return (
    <span
      className={classNames(styles.word, {
        [styles.correct]: status === WordState.CORRECT,
        [styles.incorrect]: status === WordState.INCORRECT,
      })}
    >
      {characters.map((char, i) => {
        const inputtedChar = inputtedText?.[i];
        let className;

        if (inputtedChar && status === WordState.ACTIVE) {
          className = inputtedChar === char ? styles.correct : styles.incorrect;
        }
        return (
          <span key={i} className={className}>
            {char === " " ? <>&nbsp;</> : char}
          </span>
        );
      })}
    </span>
  );
};

export default memo(Word);
