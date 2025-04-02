import { useAtomValue } from "jotai";
import Countdown from "./Countdown";
import styles from "./Statistics.module.scss";
import { testManagerAtom } from "../../store/atoms/TestManager";
import Tile from "./Tile";
import { useEffect, useRef, useState } from "react";
import { wordsAtom, WordState } from "../../store/atoms/Words";

const Statistics = () => {
  const { startTime, endTime, status } = useAtomValue(testManagerAtom);
  const words = useAtomValue(wordsAtom);
  const intervalId = useRef(0);
  const [wpm, setWPM] = useState(0);
  const [accuracy, setAccuracy] = useState("0");

  useEffect(() => {
    if (status === "idle") {
      setWPM(0);
      setAccuracy("0");
    }
  }, [status]);

  useEffect(() => {
    if (status !== "running") {
      clearInterval(intervalId.current);
      return;
    }

    if (!startTime) return;

    const calculate = () => {
      let totalWords = 0;
      let cummulativeAccuracy = 0;
      let totalCharacters = 0;
      for (const word of words) {
        if (![WordState.CORRECT, WordState.INCORRECT].includes(word.status))
          break;

        totalWords++;
        cummulativeAccuracy += word.accuracy ?? 100;
        totalCharacters += word.value.length;
      }

      if (totalWords === 0) return;

      const duration = (endTime ?? performance.now()) - startTime;
      const minutes = duration / 1000 / 60;

      const numberFormatter = Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
      });

      const accuracy = numberFormatter
        .format(cummulativeAccuracy / totalWords)
        .toString();
      const wpm = Math.round(totalCharacters / 5 / minutes); // assuming 5 characters per word in average

      setWPM(wpm);
      setAccuracy(accuracy);
    };

    calculate();
    intervalId.current = window.setInterval(() => {
      calculate();
    }, 1000);

    return () => {
      clearInterval(intervalId.current);
    };
  }, [endTime, startTime, status, words]);

  return (
    <div className={styles.container}>
      <Tile label="WPM">{wpm}</Tile>
      <Tile label="Accuracy">{accuracy}%</Tile>
      <Countdown />
    </div>
  );
};

export default Statistics;
