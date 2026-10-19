import { useEffect, useState } from 'react';

export function useMobileBar(targetId = 'booking') {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const obs = new IntersectionObserver(
      ([e]) => setShow(!e.isIntersecting && window.scrollY > 700),
      { rootMargin: '-80px 0px 0px 0px' }
    );
    obs.observe(target);
    const onScroll = () => { if (window.scrollY < 700) setShow(false); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { obs.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, [targetId]);
  return show;
}
