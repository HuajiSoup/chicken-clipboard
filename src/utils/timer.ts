/**
 * Creates a debounced version of a function
 * @param callback a function to debounce
 * @param wait the delay in milliseconds
 * @returns a debounced version of the function
 */
export function debounce<F extends (...args: any[]) => void>(
    callback: F,
    wait: number
) {
    let timeoutId: number | null = null;

    return (...args: Parameters<F>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(callback, wait, ...args);
    }
}

/**
 * Creates a throttled version of a function.
 * Note that the first call will be executed immediately,
 * and the last call will be executed after the wait time.
 * @param callback a function to throttle
 * @param wait the delay in milliseconds
 * @returns a throttled version of the function
 */
export function throttle<F extends (...args: any[]) => void>(
    callback: F,
    wait: number
) {
    let lastCallTime: number | null = null;

    return (...args: Parameters<F>) => {
        const now = Date.now();
        if (!lastCallTime || now - lastCallTime >= wait) {
            callback(...args);
            lastCallTime = now;
        }
    };
}