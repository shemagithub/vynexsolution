import { useEffect } from 'react';

function updateMeta(name, content) {
  const meta = document.querySelector(`meta[name="${name}"]`);
  if (meta) {
    meta.setAttribute('content', content);
  }
}

export function HeadThemeMeta({ theme }) {
  useEffect(() => {
    const themeColor = theme === 'dark' ? '#111' : '#F2F2F2';
    const colorScheme = theme === 'light' ? 'light dark' : 'dark light';
    updateMeta('theme-color', themeColor);
    updateMeta('color-scheme', colorScheme);
  }, [theme]);

  return null;
}
