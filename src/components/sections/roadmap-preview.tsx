"use client";

import Image from 'next/image';
import { useEffect, useRef } from 'react';

const RoadmapPreview = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!sectionRef.current || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            
            if (titleRef.current) {
              requestAnimationFrame(() => {
                if (titleRef.current) {
                  titleRef.current.style.opacity = '0';
                  titleRef.current.style.transform = 'translateY(-20px)';
                  setTimeout(() => {
                    if (titleRef.current) {
                      titleRef.current.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                      titleRef.current.style.opacity = '1';
                      titleRef.current.style.transform = 'translateY(0)';
                    }
                  }, 100);
                }
              });
            }
            
            if (imageRef.current) {
              requestAnimationFrame(() => {
                if (imageRef.current) {
                  imageRef.current.style.opacity = '0';
                  imageRef.current.style.transform = 'scale(0.9)';
                  setTimeout(() => {
                    if (imageRef.current) {
                      imageRef.current.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                      imageRef.current.style.opacity = '1';
                      imageRef.current.style.transform = 'scale(1)';
                    }
                  }, 200);
                }
              });
            }
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -100px 0px' }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="roadmap"
      className="container mx-auto space-y-8 px-6 py-20 text-center md:py-28 lg:px-16 xl:px-20"
    >
      <h2 ref={titleRef} className="text-2xl font-bold uppercase tracking-wide text-white md:text-3xl" style={{ opacity: 0 }}>
        🚧 ROADMAP 🚧
      </h2>
      <p className="text-lg text-white/70">
        Work on Wasp never stops:{' '}
        <a
          href="https://github.com/orgs/wasp-lang/projects/5"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FECC00] hover:text-white transition-all font-bold uppercase tracking-wide"
        >
          get a glimpse
        </a>{' '}
        of what is coming next!
      </p>
      <a
        href="https://github.com/orgs/wasp-lang/projects/5"
        target="_blank"
        rel="noopener noreferrer"
        className="block metal-shine"
        style={{ perspective: '1000px' }}
      >
        <Image
          ref={imageRef}
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/925e87bf-f3d6-444f-8bd6-c8540aabc457-wasp-sh/assets/images/wasp-roadmap-14.webp?"
          alt="Roadmap"
          width={1000}
          height={539}
          className="mt-8 inline-block border-2 border-[#FECC00]/50 transition-all hover:border-[#FECC00]"
          style={{ opacity: 0 }}
        />
      </a>
    </section>
  );
};

export default RoadmapPreview;