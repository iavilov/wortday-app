import { create } from 'zustand';

export type ToastVariant = 'success' | 'info' | 'error';

interface ToastState {
    visible: boolean;
    message: string;
    variant: ToastVariant;
    show: (message: string, variant?: ToastVariant, durationMs?: number) => void;
    hide: () => void;
}

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
    visible: false,
    message: '',
    variant: 'success',

    show: (message, variant = 'success', durationMs = 3000) => {
        if (dismissTimer) {
            clearTimeout(dismissTimer);
            dismissTimer = null;
        }
        set({ visible: true, message, variant });
        dismissTimer = setTimeout(() => {
            set({ visible: false });
            dismissTimer = null;
        }, durationMs);
    },

    hide: () => {
        if (dismissTimer) {
            clearTimeout(dismissTimer);
            dismissTimer = null;
        }
        set({ visible: false });
    },
}));

export const useToast = () => {
    const show = useToastStore(s => s.show);
    return { show };
};
