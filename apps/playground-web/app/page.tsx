"use client";

import { ReactNode, useMemo } from "react";

export default function Home() {
  const images = useMemo(() => {
    if (typeof window === "undefined") return [];

    const appleTouchImages = document.querySelectorAll(
      'link[rel="apple-touch-icon"]'
    );

    const imageRender: ReactNode[] = [];

    for (let i = appleTouchImages.length - 1; i >= 0; i--) {
      const linkRel = appleTouchImages[i];
      imageRender.push(
        <div key={i}>
          <img src={linkRel.getAttribute("href")!} />
          <div>{linkRel.getAttribute('sizes')}</div>
        </div>
      );
    }

    return imageRender;
  }, []);
  return (
      <main className="flex flex-row items-end p-16">
        {images}
      </main>
  );
}
