export function MoveObserver(
  element: Element,
  onMove: (rect: DOMRect) => void,
) {
  const root = document.documentElement;

  let intersectionObserver: IntersectionObserver | null;

  function disconnect() {
    if (!intersectionObserver) return;
    intersectionObserver?.disconnect();
    intersectionObserver = null;
  }

  function refresh() {
    disconnect();

    const rect = element.getBoundingClientRect();

    onMove(rect);

    const rootMarginNumbers = [
      rect.top,
      root.clientWidth - rect.right,
      root.clientWidth - rect.bottom,
      rect.left,
    ];

    const rootMargin = rootMarginNumbers
      .map((size) => `-${Math.floor(size)}px`)
      .join(" ");

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const ratio = entry.intersectionRatio;

        if (ratio < 1) {
          refresh();
        }
      },
      {
        root: document,
        rootMargin: rootMargin,
        threshold: 1,
      },
    );
    intersectionObserver.observe(element);
  }

  refresh();

  return disconnect;
}
