import { atom } from "jotai";
import { textValueAtom } from "./TextInput";
import { shuffle } from "@/lib/helpers/array";

export enum WordState {
  INCORRECT,
  CORRECT,
  ACTIVE,
  INACTIVE,
}

export type Word = {
  value: string;
  status: WordState;
  inputtedText?: string;
  timestamp?: number;
  accuracy?: number;
};

export type WordsAtom = {
  dictionary: string[];
  words: Word[];
  activeIndex: number;
};

export enum WordsAtomAction {
  SELECT_NEXT_WORD,
  RESET,
}

const baseWordsAtom = atom<WordsAtom>({
  dictionary: [],
  words: [],
  activeIndex: 0,
});

export const generateWordsAtomValue = (words: string[]): Word[] => {
  return words.map((word, i) => ({
    value: word,
    status: i === 0 ? WordState.ACTIVE : WordState.INACTIVE,
  }));
};

// Creates action atom instead of using atomWithReducers
// Ref: https://jotai.org/docs/guides/composing-atoms#action-atoms

export const selectNextWordAtom = atom(null, (get, set) => {
  const textValue = get(textValueAtom);
  set(baseWordsAtom, (wordsAtom) => ({
    ...wordsAtom,
    words: wordsAtom.words.map((word, i) => {
      if (i === wordsAtom.activeIndex) {
        const totalCharacters = Math.max(word.value.length, textValue.length);
        const correctCharacters = word.value.split("").filter((char, index) => {
          return textValue[index] === char;
        }).length;
        const accuracy = (correctCharacters / totalCharacters) * 100;

        return {
          ...word,
          timestamp: performance.now(),
          inputtedText: textValue,
          status:
            textValue === word.value ? WordState.CORRECT : WordState.INCORRECT,
          accuracy,
        };
      } else if (i === wordsAtom.activeIndex + 1) {
        return {
          ...word,
          status: WordState.ACTIVE,
        };
      }
      return word;
    }),
    activeIndex: wordsAtom.activeIndex + 1,
  }));
});

export const appendWordAtom = atom<null, [void], void>(null, (get, set) => {
  set(baseWordsAtom, (wordAtoms) => ({
    ...wordAtoms,
    words: [
      ...wordAtoms.words,
      ...generateWordsAtomValue(shuffle(wordAtoms.dictionary).slice(0, 50)),
    ],
  }));
});

export const resetWordAtom = atom<null, [string[] | void], void>(
  null,
  (get, set, words) => {
    const dictionary = words || get(baseWordsAtom).dictionary;
    const randomizedWords = shuffle(dictionary).slice(0, 100);
    set(baseWordsAtom, () => ({
      dictionary,
      words: generateWordsAtomValue(randomizedWords),
      activeIndex: 0,
    }));
  }
);

export const wordsAtom = atom((get) => get(baseWordsAtom).words);

export const activeIndexWordAtom = atom(
  (get) => get(baseWordsAtom).activeIndex
);

export const activeWordAtom = atom(
  (get) => get(baseWordsAtom).words[get(baseWordsAtom).activeIndex]
);

type DispatchWordAtomTypes =
  | { type: WordsAtomAction.RESET }
  | { type: WordsAtomAction.SELECT_NEXT_WORD };
export const dispatchWordAtom = atom<null, [DispatchWordAtomTypes], void>(
  null,
  (get, set, args) => {
    switch (args.type) {
      case WordsAtomAction.RESET: {
        set(resetWordAtom);
        return;
      }
      case WordsAtomAction.SELECT_NEXT_WORD: {
        set(selectNextWordAtom);
        return;
      }
    }
  }
);
