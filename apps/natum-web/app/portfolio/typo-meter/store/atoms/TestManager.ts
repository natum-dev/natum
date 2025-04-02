import { atom } from "jotai";
import { resetWordAtom } from "./Words";

export type TestManager = {
  status: "idle" | "running" | "finished";
  duration: number;
  startTime?: number;
  endTime?: number;
};

export const testManagerAtom = atom<TestManager>({
  status: "idle",
  duration: 60,
});

export enum TestManagerStatusAction {
  RESET,
  START,
  FINISH,
}

export enum TestManagerStateAction {
  DURATION,
}

type DispatchTestManagerAtomTypes =
  | { type: TestManagerStatusAction }
  | { type: TestManagerStateAction.DURATION; duration: number };
export const dispatchTestManagerAtom = atom<
  null,
  [DispatchTestManagerAtomTypes],
  void
>(null, (get, set, args) => {
  switch (args.type) {
    case TestManagerStatusAction.RESET: {
      set(testManagerAtom, (testManagerAtom) => ({
        ...testManagerAtom,
        status: "idle",
        startTime: undefined,
        endTime: undefined,
      }));
      set(resetWordAtom);
      return;
    }
    case TestManagerStatusAction.START: {
      set(testManagerAtom, (testManagerAtom) => ({
        ...testManagerAtom,
        status: "running",
        startTime: performance.now(),
      }));
      return;
    }
    case TestManagerStatusAction.FINISH: {
      set(testManagerAtom, (testManagerAtom) => ({
        ...testManagerAtom,
        status: "finished",
        endTime: performance.now(),
      }));
      return;
    }
    case TestManagerStateAction.DURATION: {
      set(testManagerAtom, (testManagerAtom) => ({
        ...testManagerAtom,
        duration: args.duration,
      }));
      return;
    }
  }
});
