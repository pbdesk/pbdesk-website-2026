export const DEFAULT_SMOOTH_SCROLL_DURATION_MS = 1000;

export function easeInOutCubic(progress: number): number {
  if (progress < 0.5) {
    return 4 * progress * progress * progress;
  }
  return 1 - (-2 * progress + 2) ** 3 / 2;
}

export function getScrollTargetTop(
  elementViewportTop: number,
  scrollY: number
): number {
  return elementViewportTop + scrollY;
}

export function smoothScrollToHash(
  hash: string,
  opts: {
    durationMs?: number;
    getNow?: () => number;
    requestFrame?: (callback: FrameRequestCallback) => number;
  } = {}
): boolean {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  const target = document.getElementById(id);
  if (!target) {
    return false;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    target.scrollIntoView();
    return true;
  }

  const durationMs = opts.durationMs ?? DEFAULT_SMOOTH_SCROLL_DURATION_MS;
  const getNow = opts.getNow ?? performance.now.bind(performance);
  const requestFrame = opts.requestFrame ?? requestAnimationFrame;
  const startY = window.scrollY;
  const endY = getScrollTargetTop(target.getBoundingClientRect().top, startY);
  const distance = endY - startY;
  const startTime = getNow();

  const step: FrameRequestCallback = () => {
    const elapsed = getNow() - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));

    if (progress < 1) {
      requestFrame(step);
    } else {
      history.replaceState(null, "", `#${id}`);
    }
  };

  requestFrame(step);
  return true;
}
