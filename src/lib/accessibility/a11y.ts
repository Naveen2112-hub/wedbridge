/**
 * Accessibility utilities: ARIA helpers, focus management, keyboard navigation.
 */

/**
 * Generate ARIA attributes for a button with loading state.
 */
export function getButtonAria(label: string, loading: boolean, disabled: boolean): Record<string, string> {
  return {
    "aria-label": label,
    "aria-busy": String(loading),
    "aria-disabled": String(disabled || loading),
    role: "button",
    tabIndex: disabled || loading ? "-1" : "0",
  };
}

/**
 * Generate ARIA attributes for a modal/dialog.
 */
export function getModalAria(label: string, open: boolean): Record<string, string> {
  return {
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": `${label}-title`,
    "aria-hidden": String(!open),
  };
}

/**
 * Generate ARIA attributes for a tablist.
 */
export function getTabAria(selected: boolean, controls: string): Record<string, string> {
  return {
    role: "tab",
    "aria-selected": String(selected),
    "aria-controls": controls,
    tabIndex: selected ? "0" : "-1",
  };
}

/**
 * Trap focus within a container (for modals).
 */
export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusableElements.length === 0) return;

  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  if (event.key === "Tab") {
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

/**
 * Move focus to an element (for route changes or modal open).
 */
export function moveToFocus(elementId: string): void {
  if (typeof document === "undefined") return;
  const el = document.getElementById(elementId);
  if (el) {
    el.focus();
  }
}

/**
 * Announce a message to screen readers using an aria-live region.
 */
export function announceToScreenReader(message: string): void {
  if (typeof document === "undefined") return;
  const announcer = document.getElementById("sr-announcer");
  if (announcer) {
    announcer.textContent = message;
  }
}

/**
 * Check if user prefers reduced motion.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Generate alt text for a profile photo.
 */
export function getProfilePhotoAlt(name: string | undefined): string {
  return name ? `Profile photo of ${name}` : "Profile photo";
}

/**
 * Generate alt text for a vendor logo.
 */
export function getVendorLogoAlt(businessName: string | undefined): string {
  return businessName ? `Logo of ${businessName}` : "Vendor logo";
}
