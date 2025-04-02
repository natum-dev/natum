import { useCountdown } from "@jonathanramlie/neuron/hooks";
import { useAtomValue, useSetAtom } from "jotai";
import {
  dispatchTestManagerAtom,
  testManagerAtom,
  TestManagerStatusAction,
} from "../../../store/atoms/TestManager";
import { useEffect } from "react";
import Tile from "../Tile";

const formatDuration = (val: number) => val.toString().padStart(2, "0");

const Countdown = () => {
  const { duration, status: managerStatus } = useAtomValue(testManagerAtom);
  const {
    start,
    breakdown,
    reset,
    state: countdownState,
  } = useCountdown(duration);
  const dispatchTestManager = useSetAtom(dispatchTestManagerAtom);

  useEffect(() => {
    if (countdownState === "finished") {
      dispatchTestManager({ type: TestManagerStatusAction.FINISH });
    }
  }, [countdownState]);

  useEffect(() => {
    if (managerStatus === "running") {
      start();
    } else if (managerStatus === "idle") {
      reset(duration);
    }
  }, [managerStatus, duration]);

  return (
    <Tile label="Timer">
      <span>{formatDuration(breakdown.minutes)}</span>&#58;
      <span>{formatDuration(breakdown.seconds)}</span>
    </Tile>
  );
};

export default Countdown;
