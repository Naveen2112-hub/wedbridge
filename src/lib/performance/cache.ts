/**
 * Performance utilities: caching, lazy loading helpers, image optimization.
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Simple in-memory cache with TTL.
 */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * Set a cache entry with TTL in milliseconds.
 */
export function setCached<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

/**
 * Clear all cached entries.
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Clear cached entries matching a prefix.
 */
export function clearCacheByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: never[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function call.
 */
export function throttle<T extends (...args: never[]) => void>(fn: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

/**
 * Lazy load an image with Intersection Observer.
 */
export function lazyLoadImage(img: HTMLImageElement): void {
  if (!img.dataset.src) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        img.src = img.dataset.src!;
        img.removeAttribute("data-src");
        observer.unobserve(img);
      }
    });
  });
  observer.observe(img);
}

/**
 * Optimize image URL for Next.js Image component.
 */
export function getOptimizedImageUrl(src: string, width: number, quality = 75): string {
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;
  return src;
}

/**
 * Preload critical resources.
 */
export function preloadResource(href: string, as: string): void {
  if (typeof document === "undefined") return;
  const link = document.createElement("link");
  link.rel = "preload";
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}
