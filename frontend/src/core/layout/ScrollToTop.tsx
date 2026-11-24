import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that manages window scrolling on route and hash changes.
 * When navigating to a new page, it resets scroll position to the top.
 * When an anchor hash is present (e.g. /#features), it scrolls smoothly to that target section.
 */
export function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace(/^#/, '');
      const scrollToHashElement = () => {
        const element = document.getElementById(id) || document.querySelector(location.hash);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - offset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
          return true;
        }
        return false;
      };

      if (!scrollToHashElement()) {
        const timer = setTimeout(scrollToHashElement, 150);
        return () => clearTimeout(timer);
      }
      return;
    }

    // Scroll to top instantly when route changes without a hash
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior
    });
  }, [location.pathname, location.hash]);

  return null;
}
