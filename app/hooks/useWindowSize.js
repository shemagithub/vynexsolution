import { useCallback, useEffect, useState } from 'react';

const DEFAULT_SIZE = { width: 1280, height: 800 };

export function useWindowSize() {
  const getHeight = useCallback(() => {
    if (typeof window === 'undefined') return DEFAULT_SIZE.height;

    const isIOS = navigator?.userAgent.match(/iphone|ipod|ipad/i);
    if (!isIOS) return window.innerHeight;

    const ruler = document.createElement('div');
    ruler.style.position = 'fixed';
    ruler.style.height = '100vh';
    ruler.style.width = '0';
    ruler.style.top = '0';
    document.documentElement.appendChild(ruler);
    const height = ruler.offsetHeight;
    document.documentElement.removeChild(ruler);
    return height;
  }, []);

  const [windowSize, setWindowSize] = useState(DEFAULT_SIZE);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: getHeight(),
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getHeight]);

  return windowSize;
}
