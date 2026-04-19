import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useUploadQueue, type UploadFn } from "./use-upload-queue";

const makeFile = (name = "f.txt", size = 1024) => {
  const content = new Uint8Array(size);
  return new File([content], name, { type: "text/plain" });
};

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (v: T) => void;
  reject: (e: unknown) => void;
};

const deferred = <T>(): Deferred<T> => {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe("useUploadQueue — add + scheduler", () => {
  it("appends a pending item with progress 0 and returns the id", () => {
    const { result } = renderHook(() => useUploadQueue());
    const pending = deferred<void>();
    const fn: UploadFn = () => pending.promise;

    let id!: string;
    act(() => {
      id = result.current.add(makeFile("a.txt"), fn);
    });
    expect(id).toBeTruthy();
    const [item] = result.current.items;
    expect(item.name).toBe("a.txt");
    expect(item.progress).toBe(0);
    // uploading (started by scheduler) OR pending (synchronous check)
    expect(["pending", "uploading"]).toContain(item.status);
  });

  it("applies opts.id and opts.name overrides", () => {
    const { result } = renderHook(() => useUploadQueue());
    const pending = deferred<void>();
    act(() => {
      result.current.add(makeFile("orig.txt"), () => pending.promise, {
        id: "custom-1",
        name: "Aliased.txt",
      });
    });
    expect(result.current.items[0].id).toBe("custom-1");
    expect(result.current.items[0].name).toBe("Aliased.txt");
  });

  it("respects concurrency (default 3) — only 3 uploading at a time", async () => {
    const { result } = renderHook(() => useUploadQueue());
    const ds = Array.from({ length: 5 }, () => deferred<void>());
    const fn =
      (i: number): UploadFn =>
      () =>
        ds[i].promise;

    act(() => {
      ds.forEach((_, i) => result.current.add(makeFile(`f${i}`), fn(i)));
    });

    expect(result.current.stats.uploading).toBe(3);
    expect(result.current.stats.pending).toBe(2);

    act(() => {
      ds[0].resolve();
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.stats.uploading).toBe(3);
    expect(result.current.stats.pending).toBe(1);
    expect(result.current.stats.success).toBe(1);
  });

  it("custom concurrency option applies", () => {
    const { result } = renderHook(() => useUploadQueue({ concurrency: 1 }));
    const ds = [deferred<void>(), deferred<void>()];
    act(() => {
      result.current.add(makeFile("a"), () => ds[0].promise);
      result.current.add(makeFile("b"), () => ds[1].promise);
    });
    expect(result.current.stats.uploading).toBe(1);
    expect(result.current.stats.pending).toBe(1);
  });

  it("clamps progress to [0, 1] and accepts undefined for indeterminate", async () => {
    const { result } = renderHook(() => useUploadQueue());
    let onProgress!: (v: number | undefined) => void;
    const pending = deferred<void>();
    const fn: UploadFn = (_file, ctx) => {
      onProgress = ctx.onProgress;
      return pending.promise;
    };

    act(() => {
      result.current.add(makeFile(), fn);
    });

    act(() => onProgress(0.5));
    expect(result.current.items[0].progress).toBe(0.5);
    act(() => onProgress(2));
    expect(result.current.items[0].progress).toBe(1);
    act(() => onProgress(-1));
    expect(result.current.items[0].progress).toBe(0);
    act(() => onProgress(undefined));
    expect(result.current.items[0].progress).toBeUndefined();
  });

  it("sets status=success + progress=1 + finishedAt on resolve", async () => {
    const { result } = renderHook(() => useUploadQueue());
    const d = deferred<void>();
    act(() => {
      result.current.add(makeFile(), () => d.promise);
    });
    act(() => {
      d.resolve();
    });
    await act(async () => {
      await Promise.resolve();
    });
    const item = result.current.items[0];
    expect(item.status).toBe("success");
    expect(item.progress).toBe(1);
    expect(item.finishedAt).toBeTypeOf("number");
  });

  it("sets status=error + error message on reject (non-abort)", async () => {
    const { result } = renderHook(() => useUploadQueue());
    const d = deferred<void>();
    act(() => {
      result.current.add(makeFile(), () => d.promise);
    });
    act(() => {
      d.reject(new Error("boom"));
    });
    await act(async () => {
      await Promise.resolve();
    });
    const item = result.current.items[0];
    expect(item.status).toBe("error");
    expect(item.error).toBe("boom");
  });

  it("AbortError rejections splice the item (not error)", async () => {
    const { result } = renderHook(() => useUploadQueue());
    const d = deferred<void>();
    act(() => {
      result.current.add(makeFile(), () => d.promise);
    });
    act(() => {
      const err = new Error("aborted");
      err.name = "AbortError";
      d.reject(err);
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.items).toHaveLength(0);
  });

  it("synchronous throw in uploadFn routes through the error path", async () => {
    const { result } = renderHook(() => useUploadQueue());
    const fn: UploadFn = () => {
      throw new Error("sync boom");
    };
    act(() => {
      result.current.add(makeFile(), fn);
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.items[0].status).toBe("error");
    expect(result.current.items[0].error).toBe("sync boom");
  });

  it("onItemChange fires on status transitions", async () => {
    const onItemChange = vi.fn();
    const { result } = renderHook(() => useUploadQueue({ onItemChange }));
    const d = deferred<void>();
    act(() => {
      result.current.add(makeFile(), () => d.promise);
    });
    act(() => d.resolve());
    await act(async () => {
      await Promise.resolve();
    });
    const statuses = onItemChange.mock.calls.map((c) => c[0].status);
    expect(statuses).toEqual(
      expect.arrayContaining(["uploading", "success"])
    );
  });
});

describe("useUploadQueue — cancel + remove + retry + clear", () => {
  it("cancel aborts an in-flight upload and splices item", async () => {
    const { result } = renderHook(() => useUploadQueue());
    let capturedSignal!: AbortSignal;
    const pending = deferred<void>();
    const fn: UploadFn = (_f, ctx) => {
      capturedSignal = ctx.signal;
      return new Promise<void>((_, reject) => {
        ctx.signal.addEventListener("abort", () => {
          const err = new Error("aborted");
          err.name = "AbortError";
          reject(err);
        });
        pending.promise.then(() => _(undefined as unknown as void));
      });
    };

    let id!: string;
    act(() => {
      id = result.current.add(makeFile(), fn);
    });
    expect(result.current.items[0].status).toBe("uploading");

    act(() => {
      result.current.cancel(id);
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(capturedSignal.aborted).toBe(true);
    expect(result.current.items).toHaveLength(0);
  });

  it("cancel removes a pending item directly (no controller)", () => {
    const { result } = renderHook(() => useUploadQueue({ concurrency: 1 }));
    const a = deferred<void>();
    const b = deferred<void>();
    let idB!: string;
    act(() => {
      result.current.add(makeFile("a"), () => a.promise);
      idB = result.current.add(makeFile("b"), () => b.promise);
    });
    expect(result.current.items).toHaveLength(2);
    expect(result.current.stats.pending).toBe(1);

    act(() => {
      result.current.cancel(idB);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe("a");
  });

  it("remove splices a terminal item", async () => {
    const { result } = renderHook(() => useUploadQueue());
    const d = deferred<void>();
    let id!: string;
    act(() => {
      id = result.current.add(makeFile(), () => d.promise);
    });
    act(() => d.resolve());
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.items[0].status).toBe("success");

    act(() => {
      result.current.remove(id);
    });
    expect(result.current.items).toHaveLength(0);
  });

  it("cancel on missing id is a no-op", () => {
    const { result } = renderHook(() => useUploadQueue());
    act(() => {
      result.current.cancel("nonexistent");
    });
    expect(result.current.items).toHaveLength(0);
  });

  it("retry resets an errored item and re-schedules", async () => {
    const { result } = renderHook(() => useUploadQueue());
    const d1 = deferred<void>();
    let id!: string;
    act(() => {
      id = result.current.add(makeFile(), () => d1.promise);
    });
    act(() => d1.reject(new Error("x")));
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.items[0].status).toBe("error");

    const d2 = deferred<void>();
    act(() => {
      result.current.retry(id, () => d2.promise);
    });
    expect(["pending", "uploading"]).toContain(result.current.items[0].status);

    act(() => d2.resolve());
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.items[0].status).toBe("success");
  });

  it("retry throws when item is not in error state", async () => {
    const { result } = renderHook(() => useUploadQueue());
    const d = deferred<void>();
    let id!: string;
    act(() => {
      id = result.current.add(makeFile(), () => d.promise);
    });
    expect(() => result.current.retry(id, () => Promise.resolve())).toThrow(
      /not in error state/i
    );
  });

  it("retry throws when item not found", () => {
    const { result } = renderHook(() => useUploadQueue());
    expect(() => result.current.retry("nope", () => Promise.resolve())).toThrow(
      /not found/i
    );
  });

  it("clear default removes success + error items", async () => {
    const { result } = renderHook(() => useUploadQueue());
    const d1 = deferred<void>();
    const d2 = deferred<void>();
    const d3 = deferred<void>();
    act(() => {
      result.current.add(makeFile("a"), () => d1.promise);
      result.current.add(makeFile("b"), () => d2.promise);
      result.current.add(makeFile("c"), () => d3.promise);
    });
    act(() => {
      d1.resolve();
      d2.reject(new Error("fail"));
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.stats.success).toBe(1);
    expect(result.current.stats.error).toBe(1);
    expect(result.current.stats.uploading).toBe(1);

    act(() => {
      result.current.clear();
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe("c");
  });

  it("clear with filter removes matching items", () => {
    const { result } = renderHook(() => useUploadQueue({ concurrency: 1 }));
    const d1 = deferred<void>();
    const d2 = deferred<void>();
    act(() => {
      result.current.add(makeFile("a"), () => d1.promise);
      result.current.add(makeFile("b"), () => d2.promise);
    });
    act(() => {
      result.current.clear((i) => i.name === "b");
    });
    expect(result.current.items.map((i) => i.name)).toEqual(["a"]);
  });
});
