/**
 * Theme controller. The inline bootstrap in Base.astro <head> has already set
 * data-theme (resolved) and data-color-mode (user choice) before first paint;
 * this module wires the toggle: light → dark → system.
 */

export type ColorMode = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'nzp-theme';

export const getStoredMode = (): ColorMode | null => {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === 'light' || value === 'dark' || value === 'system' ? value : null;
};

export const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

/** Resolves a mode to a concrete theme, honouring the system setting. */
export const resolveTheme = (mode: ColorMode): 'light' | 'dark' =>
  mode === 'system' ? (systemDark() ? 'dark' : 'light') : mode;

export function applyMode(mode: ColorMode): void {
  document.documentElement.dataset.colorMode = mode;
  document.documentElement.dataset.theme = resolveTheme(mode);
}

/** Inline, blocking bootstrap for the <head>: never flashes the wrong theme. */
export const bootstrapScript = `(function(){try{var m=localStorage.getItem('nzp-theme');if(m!=='light'&&m!=='dark'&&m!=='system')m='system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var de=document.documentElement;de.dataset.theme=d?'dark':'light';de.dataset.colorMode=m;}catch(e){}})();`;

export function initThemeToggle(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!toggle) return;

  const status = toggle.querySelector<HTMLElement>('[data-theme-status]');
  const labels: Record<ColorMode, string> = {
    light: toggle.dataset.labelLight ?? 'Light',
    dark: toggle.dataset.labelDark ?? 'Dark',
    system: toggle.dataset.labelSystem ?? 'System',
  };

  const announce = (mode: ColorMode) => {
    if (status) status.textContent = labels[mode];
  };

  toggle.addEventListener('click', () => {
    const order: ColorMode[] = ['light', 'dark', 'system'];
    const current = (document.documentElement.dataset.colorMode as ColorMode) || 'system';
    const next = order[(order.indexOf(current) + 1) % order.length];
    applyMode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable; theme still applies for this page view */
    }
    announce(next);
  });

  // Follow the OS when the user has not made an explicit choice.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!getStoredMode() || getStoredMode() === 'system') applyMode('system');
  });
}
