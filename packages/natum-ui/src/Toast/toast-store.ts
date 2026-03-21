export type ToastType = "success" | "error" | "warning" | "info";

export type ToastPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

export type ToastOptions = {
  id?: string;
  message: string;
  title?: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export type Toast = ToastOptions & {
  id: string;
  createdAt: number;
};

type Listener = () => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

let counter = 0;

export const toastStore = {
  getToasts: (): Toast[] => toasts,
  addToast: (options: ToastOptions): string => {
    const id = options.id ?? String(++counter);
    const existing = toasts.find((t) => t.id === id);

    if (existing) {
      toasts = toasts.map((t) =>
        t.id === id
          ? {
              ...t,
              ...options,
              id,
              type: options.type ?? t.type,
              duration: options.duration ?? t.duration,
            }
          : t
      );
      notify();
      return id;
    }

    const toast: Toast = {
      id,
      ...options,
      type: options.type ?? "info",
      duration: options.duration ?? 5000,
      createdAt: Date.now(),
    };
    toasts = [...toasts, toast];
    notify();
    return id;
  },
  updateToast: (id: string, options: Partial<Omit<ToastOptions, "id">>) => {
    toasts = toasts.map((t) =>
      t.id === id ? { ...t, ...options } : t
    );
    notify();
  },
  removeToast: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },
  clear: () => {
    toasts = [];
    notify();
  },
  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
