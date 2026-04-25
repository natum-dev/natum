import { toastStore, type ToastOptions } from "./toast-store";

type ToastMethodOptions = Partial<Omit<ToastOptions, "message" | "type">>;
type ToastUpdateOptions = Partial<Omit<ToastOptions, "id">>;

type ToastFn = {
  (message: string, options?: ToastMethodOptions): string;
  success: (message: string, options?: ToastMethodOptions) => string;
  error: (message: string, options?: ToastMethodOptions) => string;
  warning: (message: string, options?: ToastMethodOptions) => string;
  info: (message: string, options?: ToastMethodOptions) => string;
  update: (id: string, options: ToastUpdateOptions) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const toastFn = (message: string, options?: ToastMethodOptions) =>
  toastStore.addToast({ ...options, message, type: "info" });

toastFn.success = (message: string, options?: ToastMethodOptions) =>
  toastStore.addToast({ ...options, message, type: "success" });
toastFn.error = (message: string, options?: ToastMethodOptions) =>
  toastStore.addToast({ ...options, message, type: "error" });
toastFn.warning = (message: string, options?: ToastMethodOptions) =>
  toastStore.addToast({ ...options, message, type: "warning" });
toastFn.info = (message: string, options?: ToastMethodOptions) =>
  toastStore.addToast({ ...options, message, type: "info" });
toastFn.update = (id: string, options: ToastUpdateOptions) =>
  toastStore.updateToast(id, options);
toastFn.dismiss = (id: string) => toastStore.removeToast(id);
toastFn.dismissAll = () => toastStore.clear();

export const toast: ToastFn = toastFn;
export type { ToastFn };
