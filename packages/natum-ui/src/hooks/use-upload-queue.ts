import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type UploadStatus = "pending" | "uploading" | "success" | "error";

export type UploadItem = {
  id: string;
  file: File;
  name: string;
  size: number;
  status: UploadStatus;
  progress: number | undefined;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
};

export type UploadFn = (
  file: File,
  ctx: { onProgress: (value: number | undefined) => void; signal: AbortSignal }
) => Promise<void>;

export type UseUploadQueueOptions = {
  concurrency?: number;
  onItemChange?: (item: UploadItem) => void;
};

export type UseUploadQueueReturn = {
  items: UploadItem[];
  add: (
    file: File,
    uploadFn: UploadFn,
    opts?: { id?: string; name?: string }
  ) => string;
  cancel: (id: string) => void;
  remove: (id: string) => void;
  retry: (id: string, uploadFn: UploadFn) => void;
  clear: (filter?: (item: UploadItem) => boolean) => void;
  stats: { pending: number; uploading: number; success: number; error: number };
};

type QueueEntry = { fn: UploadFn; file: File };

const clampProgress = (v: number | undefined): number | undefined => {
  if (v === undefined) return undefined;
  if (!Number.isFinite(v)) return 0;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
};

export function useUploadQueue(
  options: UseUploadQueueOptions = {}
): UseUploadQueueReturn {
  const { concurrency = 3, onItemChange } = options;
  const [items, setItems] = useState<UploadItem[]>([]);
  const itemsRef = useRef<UploadItem[]>([]);
  itemsRef.current = items;
  const controllersRef = useRef<Map<string, AbortController>>(new Map());
  const queueRef = useRef<Map<string, QueueEntry>>(new Map());
  const counterRef = useRef(0);

  const onItemChangeRef = useRef(onItemChange);
  onItemChangeRef.current = onItemChange;

  const notify = useCallback((item: UploadItem) => {
    onItemChangeRef.current?.(item);
  }, []);

  const patch = useCallback(
    (id: string, patchFn: (item: UploadItem) => UploadItem) => {
      setItems((prev) => {
        const next = prev.map((item) =>
          item.id === id ? patchFn(item) : item
        );
        const patched = next.find((i) => i.id === id);
        if (patched) notify(patched);
        return next;
      });
    },
    [notify]
  );

  const splice = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    controllersRef.current.delete(id);
    queueRef.current.delete(id);
  }, []);

  const startUpload = useCallback(
    (id: string) => {
      const entry = queueRef.current.get(id);
      if (!entry) return;
      const { fn: uploadFn, file } = entry;
      const controller = new AbortController();
      controllersRef.current.set(id, controller);

      setItems((prev) => {
        const next = prev.map((item) =>
          item.id === id
            ? { ...item, status: "uploading" as const, startedAt: Date.now() }
            : item
        );
        const patched = next.find((i) => i.id === id);
        if (patched) notify(patched);
        return next;
      });

      const onProgress = (value: number | undefined) => {
        const clamped = clampProgress(value);
        patch(id, (item) => ({ ...item, progress: clamped }));
      };

      let resultPromise: Promise<void>;
      try {
        resultPromise = Promise.resolve(
          uploadFn(file, { onProgress, signal: controller.signal })
        );
      } catch (err) {
        resultPromise = Promise.reject(err);
      }

      resultPromise
        .then(() => {
          controllersRef.current.delete(id);
          patch(id, (item) => ({
            ...item,
            status: "success",
            progress: 1,
            finishedAt: Date.now(),
          }));
        })
        .catch((err: unknown) => {
          controllersRef.current.delete(id);
          const isAbort =
            (err instanceof Error && err.name === "AbortError") ||
            controller.signal.aborted;
          if (isAbort) {
            splice(id);
            return;
          }
          const message =
            err instanceof Error
              ? err.message
              : typeof err === "string"
                ? err
                : "Upload failed";
          patch(id, (item) => ({
            ...item,
            status: "error",
            error: message,
            finishedAt: Date.now(),
          }));
        });
    },
    [patch, splice, notify]
  );

  // Scheduler: start pending items up to concurrency
  useEffect(() => {
    const uploadingCount = items.filter((i) => i.status === "uploading").length;
    const slotsFree = Math.max(0, concurrency - uploadingCount);
    if (slotsFree === 0) return;
    const pending = items
      .filter((i) => i.status === "pending")
      .slice(0, slotsFree);
    pending.forEach((item) => {
      startUpload(item.id);
    });
  }, [items, concurrency, startUpload]);

  const add = useCallback<UseUploadQueueReturn["add"]>(
    (file, uploadFn, opts = {}) => {
      const id = opts.id ?? String(++counterRef.current);
      const name = opts.name ?? file.name;
      const item: UploadItem = {
        id,
        file,
        name,
        size: file.size,
        status: "pending",
        progress: 0,
      };
      queueRef.current.set(id, { fn: uploadFn, file });
      setItems((prev) => [...prev, item]);
      return id;
    },
    []
  );

  const cancel = useCallback(
    (id: string) => {
      setItems((prev) => {
        const item = prev.find((i) => i.id === id);
        if (!item) return prev;
        if (item.status === "uploading") {
          const controller = controllersRef.current.get(id);
          controller?.abort();
          // The abort handler in startUpload will call splice(id);
          // here we just return the current list (splice handles removal).
          return prev;
        }
        controllersRef.current.delete(id);
        queueRef.current.delete(id);
        return prev.filter((i) => i.id !== id);
      });
    },
    []
  );

  const remove = useCallback(
    (id: string) => {
      const controller = controllersRef.current.get(id);
      controller?.abort();
      controllersRef.current.delete(id);
      queueRef.current.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    },
    []
  );

  const retry = useCallback(
    (id: string, uploadFn: UploadFn) => {
      const item = itemsRef.current.find((i) => i.id === id);
      if (!item) throw new Error(`retry: item "${id}" not found`);
      if (item.status !== "error")
        throw new Error(`retry: item "${id}" is not in error state`);
      const file = item.file;
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: "pending" as const,
                progress: 0,
                error: undefined,
                startedAt: undefined,
                finishedAt: undefined,
              }
            : i
        )
      );
      queueRef.current.set(id, { fn: uploadFn, file });
    },
    []
  );

  const clear = useCallback(
    (filter?: (item: UploadItem) => boolean) => {
      const predicate =
        filter ??
        ((item: UploadItem) =>
          item.status === "success" || item.status === "error");
      setItems((prev) => {
        const toRemove = prev.filter(predicate);
        toRemove.forEach((item) => {
          controllersRef.current.get(item.id)?.abort();
          controllersRef.current.delete(item.id);
          queueRef.current.delete(item.id);
        });
        return prev.filter((item) => !predicate(item));
      });
    },
    []
  );

  const stats = useMemo(
    () => ({
      pending: items.filter((i) => i.status === "pending").length,
      uploading: items.filter((i) => i.status === "uploading").length,
      success: items.filter((i) => i.status === "success").length,
      error: items.filter((i) => i.status === "error").length,
    }),
    [items]
  );

  // Unmount cleanup
  useEffect(() => {
    const controllers = controllersRef.current;
    const queue = queueRef.current;
    return () => {
      controllers.forEach((c) => c.abort());
      controllers.clear();
      queue.clear();
    };
  }, []);

  return { items, add, cancel, remove, retry, clear, stats };
}
