"use client";

import TypingArea from "./components/TypingArea/TypingArea";
import Typography from "@jonathanramlie/neuron/Typography";
import { useWordsQuery } from "@/lib/queries/useWordsQuery";
import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { resetWordAtom } from "./store/atoms/Words";
import Statistics from "./components/Statistics";

const Page = () => {
  const { isLoading, data } = useWordsQuery();
  const dispatchResetAtom = useSetAtom(resetWordAtom);

  useEffect(() => {
    if (!data?.length) return;

    dispatchResetAtom(data);
  }, [data]);

  if (isLoading) {
    return null;
  }

  return (
    <>
      <Typography variant="h3">Typo-Meter</Typography>
      <Statistics />
      <TypingArea />
    </>
  );
};

export default Page;
