"use client";

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const AnnouncementBanner = () => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bannerRef.current) {
      gsap.to(bannerRef.current, {
        backgroundPosition: '200% 0',
        duration: 8,
        ease: 'linear',
        repeat: -1,
      });
    }
  }, []);

  return (
    <Link href="https://wasp.sh/blog/2025/10/08/design-ai-thon" className="block cursor-pointer" passHref>
      <div
        ref={bannerRef}
        className="overflow-hidden border-b border-[#FECC00]"
        style={{
          background: 'linear-gradient(90deg, #FECC00 0%, #000000 25%, #FECC00 50%, #000000 75%, #FECC00 100%)',
          backgroundSize: '200% 100%',
        }}
      >
        <div className="mx-auto flex flex-col items-center justify-center p-3 text-sm font-medium lg:container lg:flex-row lg:divide-x lg:divide-black/20 lg:px-16 xl:px-20">
          <div className="flex items-center gap-2 px-3 text-center uppercase tracking-wide">
            <span>
              <b className="text-black">🎨 WASP DESIGN-AI-THON IS LIVE!</b>{' '}
              <span className="font-bold text-black/80">OCT 10 - OCT 19</span>
            </span>
          </div>
          <div className="hidden items-center space-x-2 px-3 lg:flex">
            <span className="cursor-pointer bg-black px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#FECC00] transition-all hover:bg-black/80">
              JOIN NOW <span className="text-white">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AnnouncementBanner;