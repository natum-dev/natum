import { useCallback, useEffect, useRef, useState, type DragEvent, type RefObject } from "react";

type UseFileDropTarget =
  | { target: "document" }
  | { target: RefObject<HTMLElement | null> };

export type UseFileDropOptions = UseFileDropTarget & {
  onFilesDropped: (files: File[], event: DragEvent | Event) => void;
  filesOnly?: boolean;
  disabled?: boolean;
};

export type UseFileDropBind = {
  onDragEnter: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
};

export type UseFileDropReturn = {
  isOver: boolean;
  bind: UseFileDropBind | null;
};

const hasFiles = (types: readonly string[] | undefined): boolean =>
  !!types && Array.from(types).includes("Files");

export function useFileDrop(options: UseFileDropOptions): UseFileDropReturn {
  const { onFilesDropped, filesOnly = true, disabled = false } = options;
  const [isOver, setIsOver] = useState(false);
  const counterRef = useRef(0);

  const onFilesDroppedRef = useRef(onFilesDropped);
  onFilesDroppedRef.current = onFilesDropped;

  const reset = useCallback(() => {
    counterRef.current = 0;
    setIsOver(false);
  }, []);

  const handleEnter = useCallback(
    (e: { dataTransfer?: DataTransfer | null; preventDefault?: () => void }) => {
      if (disabled) return;
      if (filesOnly && !hasFiles(e.dataTransfer?.types)) return;
      counterRef.current += 1;
      if (counterRef.current === 1) setIsOver(true);
    },
    [disabled, filesOnly]
  );

  const handleOver = useCallback(
    (e: { preventDefault: () => void }) => {
      if (disabled) return;
      e.preventDefault();
    },
    [disabled]
  );

  const handleLeave = useCallback(() => {
    if (disabled) return;
    if (counterRef.current > 0) counterRef.current -= 1;
    if (counterRef.current === 0) setIsOver(false);
  }, [disabled]);

  const handleDrop = useCallback(
    (e: { dataTransfer?: DataTransfer | null; preventDefault: () => void }) => {
      if (disabled) return;
      e.preventDefault();
      reset();
      const dt = e.dataTransfer;
      const files = dt?.files ? Array.from(dt.files) : [];
      if (filesOnly && files.length === 0) return;
      onFilesDroppedRef.current(files, e as unknown as Event);
    },
    [disabled, filesOnly, reset]
  );

  useEffect(() => {
    if (options.target !== "document") return;
    if (disabled) return;

    const enter = (e: Event) => handleEnter(e as unknown as DragEvent);
    const over = (e: Event) => handleOver(e as unknown as DragEvent);
    const leave = (e: Event) => handleLeave(e as unknown as DragEvent);
    const drop = (e: Event) => handleDrop(e as unknown as DragEvent);

    document.addEventListener("dragenter", enter);
    document.addEventListener("dragover", over);
    document.addEventListener("dragleave", leave);
    document.addEventListener("drop", drop);

    return () => {
      document.removeEventListener("dragenter", enter);
      document.removeEventListener("dragover", over);
      document.removeEventListener("dragleave", leave);
      document.removeEventListener("drop", drop);
    };
  }, [options.target, disabled, handleEnter, handleOver, handleLeave, handleDrop]);

  const bind: UseFileDropBind | null =
    options.target === "document"
      ? null
      : {
          onDragEnter: handleEnter,
          onDragOver: handleOver,
          onDragLeave: handleLeave,
          onDrop: handleDrop,
        };

  return { isOver, bind };
}
