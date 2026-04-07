export function debounce<F extends (...args: any[]) => void>(
    func: F,
    wait: number
) {
    let timeoutId: number | null = null;

    return (...args: Parameters<F>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(func, wait, ...args);
    }
}

export function throttle<F extends (...args: any[]) => void>(
    func: F,
    wait: number
) {
    let timeoutId: number | null = null;

    return (...args: Parameters<F>) => {
        if (timeoutId) return;

        timeoutId = window.setTimeout(() => {
            func(...args);
            timeoutId = null;
        }, wait);
    }
}