import { useEffect, useRef, useState, useMemo } from 'react';

// import Router, { useRouter } from 'next/router';

import { useSelector } from 'react-redux';

import { get, keys, startsWith } from 'lodash';

// import { selectIsSignedIn, selectProfile } from '@/store/auth';

// import { AB_TEST_PREFIX } from '@/constants/';

// import { get AfterAuth } from '@/helpers/routePath';

// import {
//   set PathAfterSignIn,
//   get PathAfterSignIn,
//   remove PathAfterSignIn,
// } from './auth';

export function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      if (savedCallback && savedCallback.current) {
        // @ts-ignore
        savedCallback.current();
      }
    }

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}

export function useTimeout(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      if (savedCallback && savedCallback.current) {
        // @ts-ignore
        savedCallback.current();
      }
    }

    const id = setTimeout(tick, delay);
    return () => clearTimeout(id);
  }, [delay]);
}

export function useEventListener(event, listener, initialCall = true) {
  useEffect(() => {
    initialCall && listener();
    window.addEventListener(event, listener);

    return () => {
      window.removeEventListener(event, listener);
    };
  }, []);
}

export function useHideScroll() {
  useEffect(() => {
    document.querySelector('body').classList.add('hide-scroll');

    return () => {
      // sometimes this doesn't run. not calling useHideScroll for now!
      document.querySelector('body').classList.remove('hide-scroll');
    };
  }, []);
}

export function useHideScrollOnEvent(open) {
  useEffect(() => {
    if (open) {
      document.querySelector('body').classList.add('hide-scroll');
    } else {
      document.querySelector('body').classList.remove('hide-scroll');
    }

    return () => {
      document.querySelector('body').classList.remove('hide-scroll');
    };
  }, [open]);
}

export function useIsDesktop(mediaQuery = '(min-width: 768px)') {
  const [isDesktop, setIsDesktop] = useState(false);

  useEventListener('resize', handleResize);

  function handleResize() {
    const matches = window.matchMedia(mediaQuery).matches;

    setIsDesktop(matches);
  }

  return { isDesktop };
}

// export function useAuthorizedRoute(path = '/',  PathAfterSignIn = '') {
//   const isSignedIn = useSelector(selectIsSignedIn);

//   useEffect(() => {
//     if (!isSignedIn) {
//       if ( PathAfterSignIn) {
//         set PathAfterSignIn( PathAfterSignIn);
//       }

//       Router.push(path);
//     }
//   }, [isSignedIn]);
// }

// export function useUnauthorizedRoute( To = '/') {
//   const isSignedIn = useSelector(selectIsSignedIn);

//   useEffect(() => {
//     isSignedIn && Router.push( To);
//   }, [isSignedIn]);
// }

// export function use AfterAuthRoute( To = '/') {
//   const profile = useSelector(selectProfile);
//   const  PathAfterSignIn =
//     get PathAfterSignIn() || get AfterAuth(profile,  To);

//   useEffect(() => {
//     if (profile) {
//       remove PathAfterSignIn();
//       Router.push( PathAfterSignIn);
//     }
//   }, [profile]);
// }

// export function useUnverifiedRoute( To = '/') {
//   const profile = useSelector(selectProfile);

//   useEffect(() => {
//     if (get(profile, 'is_verified')) {
//       Router.push( To);
//     }
//   }, []);
// }

// export function useRequiredQueryParamRoute(
//   query,
//   requiredParams,
//    To = '/',
// ) {
//   useEffect(() => {
//     for (const param of requiredParams) {
//       if (!query[param]) {
//         Router.push( To);
//       }
//     }
//   }, []);
// }

export function useScrollToTop() {
  useEffect(() => {
    window && window.scrollTo(0, 0);
  }, []);
}

const SCROLL_UP = 'up';
const SCROLL_DOWN = 'down';

export const useScrollDirection = ({
  initialDirection = 'up',
  off = false,
}) => {
  const [scrollDir, setScrollDir] = useState(initialDirection);

  useEffect(() => {
    const threshold = 0;
    let lastScrollY = window.pageYOffset;
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset;

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        // We haven't exceeded the threshold
        ticking = false;
        return;
      }

      setScrollDir(scrollY > lastScrollY ? SCROLL_DOWN : SCROLL_UP);
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    /**
     * Bind the scroll handler if `off` is set to false.
     * If `off` is set to true reset the scroll direction.
     */
    !off
      ? window.addEventListener('scroll', onScroll)
      : setScrollDir(initialDirection);

    return () => window.removeEventListener('scroll', onScroll);
  }, [initialDirection, off]);

  return scrollDir;
};

// export const useABTest = () => {
//   const abTests = keys(window.localStorage)
//     .filter((key) => startsWith(key, AB_TEST_PREFIX))
//     .reduce((acc, key) => {
//       let value = window.localStorage.getItem(key) ;
//       if (['true', 'false'].includes(value)) value = value === 'true';
//       acc[key.substring(AB_TEST_PREFIX.length)] = value;
//       return acc;
//     }, {});

//   // TODO: remove this from UI logic.. its already disabled in ab-test.js
//   abTests['showAltCopy3'] = false;
//   abTests['showaltcontent'] = true;
//   abTests['showbooklocation'] = true;
//   abTests['showbooknavlocation'] = true;
//   abTests['showbookexit'] = false;
//   return abTests ;
// };

// export const useIsFeatureFlagOn = (key) => {
//   if (
//     [
//       'affirm-enable',
//       'curated-package-enabled',
//       'login-page-new-design',
//       'enable-holiday',
//       'enable-black-friday',
//       'enable-december-20',
//       'enable-december-message',
//       // 'promo-code-disabled',
//     ].includes(key)
//   ) {
//     return true;
//   }

//   // disabled feature flags
//   if (
//     [
//       'holiday-package-update',
//       'enable-covid-safety',
//       'mother-day-enabled',
//       'coming-soon-location-enabled',
//       'promo-code-disabled',
//     ].includes(key)
//   ) {
//     return false;
//   }

//   const featureFlag = useMemo(() => localStorage.getItem(key), [localStorage]);
//   return featureFlag === 'true';
// };

export const useOutsideClick = (
  ref,
  onOutsideClick,
) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref && ref.current && !ref.current.contains(event.target)) {
        onOutsideClick(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, onOutsideClick]);
};

export const useLeavePrevention = (blockURL) => {
  const [showModal, setShowModal] = useState(false);
  const [targetURL, setTargetURL] = useState('');
  // const router = useRouter();

  // Use beforeunload to prevent closing the tab, refreshing the page or moving outside the Next app
  useEffect(() => {
    const prevFunc = window.onbeforeunload;
    const handleTabClose = (event) => {
      event.preventDefault();
      return (event.returnValue = 'Are you sure you want to exit?');
    };

    window.onbeforeunload = handleTabClose;
    return () => {
      window.onbeforeunload = prevFunc;
    };
  });

  //   const confirm = () => {};

  //   const cancel = () => {};

  //   // Use routeChangeStart to prevent navigation inside of the Next app
  //   // Uses a module variable to bypass the confirm, otherwise we would be in a loop
  //   router.events.on('routeChangeStart', (url) => {
  //     if (showModal) return;
  //     setShowModal(false);
  //     setTargetURL(url);
  //     if (url.includes(blockURL)) return;
  //     setShowModal(true);
  //     router.events.emit('routeChangeError');
  //     throw 'routeChange aborted.';
  //   });

  //   return {
  //     showModal,
  //     targetURL,
  //     confirm,
  //     cancel,
  //   };
};


export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return isOnline;
}