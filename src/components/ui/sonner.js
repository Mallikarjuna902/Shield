export const toast = {
  success: (message) => {
    // Fallback: log + alert for visibility in demo
    // eslint-disable-next-line no-console
    console.log('[toast:success]', message);
    try { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message } })); } catch {}
  },
  error: (message) => {
    // eslint-disable-next-line no-console
    console.error('[toast:error]', message);
    try { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message } })); } catch {}
  }
};

export function Toaster() {
  // No-op visual component placeholder
  return null;
}


