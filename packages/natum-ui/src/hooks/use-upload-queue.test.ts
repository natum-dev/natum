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
