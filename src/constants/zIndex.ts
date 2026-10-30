/**
 * Centralized Z-Index Scale for CozyFit Desktop
 * content: 0
 * topbar: z-20 (sticky/fixed above content)
 * sidebar: z-30 (above topbar and content)
 * drawerBackdrop: z-40 (overlay for slide-over drawer)
 * drawerAndDialogs: z-50 (slide-over panel, modals, popovers)
 * toasts: z-[60] (temporary notification toasts)
 * celebrationLayer: z-[70] (global achievement celebrations)
 */
export const Z_INDEX = {
  content: 'z-0',
  topbar: 'z-20',
  sidebar: 'z-30',
  drawerBackdrop: 'z-40',
  drawerAndDialogs: 'z-50',
  toasts: 'z-[60]',
  celebrationLayer: 'z-[70]',
} as const;
