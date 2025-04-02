"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";

const RQ_WORDS_QUERY = "RQ_WORDS_QUERY";

export const useWordsQuery = (options?: UseQueryOptions<string[]>) => {
  return useQuery({
    ...options,
    queryKey: [RQ_WORDS_QUERY],
    queryFn: async () => {
      try {
        const result = await fetch("/api/words");

        return result.json();
      } catch (e) {
        return [];
      }
    },
  });
};
