"use client";

import { useWordsQuery } from "@/lib/queries/useWordsQuery";
import Typography from "@natum/natum-ui/Typography";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { resetWordAtom } from "../../store/atoms/Words";
import Statistics from "../Statistics";
import TypingArea from "../TypingArea";

const TypeContent = () => {
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
      <Statistics />
      <TypingArea />
    </>
  );
};

export default TypeContent;
