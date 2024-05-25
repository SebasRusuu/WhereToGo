import { useEffect, useRef, useState } from 'react';

function useInView(options = { threshold: 0.5 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setInView(entry.isIntersecting);
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: options.threshold
      }
    );

    const element = ref.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options.threshold]);

  return [ref, inView];
}

export default useInView;
