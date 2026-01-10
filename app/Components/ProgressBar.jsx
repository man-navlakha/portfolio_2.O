'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // This effect handles stopping the progress bar
  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  // This effect handles starting the progress bar
  useEffect(() => {
    // This handles link clicks
    const handleClick = (event) => {
      const anchor = event.target.closest('a');
      if (anchor && anchor.href) {
        const targetUrl = new URL(anchor.href, window.location.origin);
        const currentUrl = new URL(window.location.href);
        const isNewTab = anchor.target === '_blank';

        // Start progress if it's an internal navigation to a different URL
        // and not opening in a new tab.
        if (targetUrl.origin === currentUrl.origin && !isNewTab && targetUrl.href !== currentUrl.href) {
          NProgress.start();
        }
      }
    };

    // This handles browser back/forward navigation
    const handlePopState = () => {
      NProgress.start();
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // Run this effect only once

  return null;
}
