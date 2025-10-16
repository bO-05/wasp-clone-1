"use client";

import Image from 'next/image';
import { useEffect, useRef } from 'react';

interface Testimonial {
  name: string;
  handle: string;
  avatar: string;
  socialIcon: string;
  socialPlatform: string;
  link: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Joan Reyero',
    handle: '@joanreyero',
    avatar: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/925e87bf-f3d6-444f-8bd6-c8540aabc457-wasp-sh/assets/images/reyero-6.webp?',
    socialIcon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/925e87bf-f3d6-444f-8bd6-c8540aabc457-wasp-sh/assets/images/ph-logo-7.webp?',
    socialPlatform: 'Product Hunt',
    link: 'https://www.producthunt.com/posts/wasp-lang-beta?comment=2048094',
    quote: "I spent the one weekend building with Wasp and it was amazing, a real pleasure. I normally develop in Vue.js, but in a weekend I had time to learn Wasp, React and finish a full-stack app (only missing styling). This would have been impossible before.\n\nSo glad to see Wasp in Beta! 🍻",
  },
  {
    name: 'Tim ✌️',
    handle: '@tskaggs',
    avatar: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/925e87bf-f3d6-444f-8bd6-c8540aabc457-wasp-sh/assets/images/tskaggs-8.webp?',
    socialIcon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/925e87bf-f3d6-444f-8bd6-c8540aabc457-wasp-sh/assets/images/twitter-logo-9.webp?',
    socialPlatform: 'Twitter',
    link: 'https://twitter.com/tskaggs/status/1602513968207101954',
    quote: 'The simplification of the main.wasp file is 👍. And it feels like a very light weight version of a few larger frameworks.',
  },
  {
    name: 'Attila Vago',
    handle: '@AttilaTheDev',
    avatar: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/925e87bf-f3d6-444f-8bd6-c8540aabc457-wasp-sh/assets/images/attila-10.webp?',
    socialIcon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/925e87bf-f3d6-444f-8bd6-c8540aabc457-wasp-sh/assets/images/twitter-logo-9.webp?',
    socialPlatform: 'Twitter',
    link: 'https://twitter.com/AttilaTheDev/status/1583530646047117317',
    quote: '@WaspLang has been in the back of my mind for months now. It left an impression, and I\'m really not easy to impress. That\'s gotta mean something… #programming #webdevelopment #FullStack',
  },
];

const TestimonialsSection = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
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
                  titleRef.current.style.transform = 'scale(1.2)';
                  setTimeout(() => {
                    if (titleRef.current) {
                      titleRef.current.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                      titleRef.current.style.opacity = '1';
                      titleRef.current.style.transform = 'scale(1)';
                    }
                  }, 100);
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
    <section ref={sectionRef}>
      <div className="container mx-auto px-6 py-20 text-center md:py-28 lg:px-16 xl:px-20">
        <h2 ref={titleRef} className="text-3xl font-bold uppercase tracking-wide text-white" style={{ opacity: 0 }}>YOU'RE IN A GOOD CROWD</h2>
        <p className="mt-6 text-lg text-white/70">
          Here's what folks using Wasp say about it. Join{' '}
          <a
            href="https://discord.gg/rzdnErX"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FECC00] hover:text-white transition-all font-bold"
          >
            our Discord
          </a>{' '}
          for more!
        </p>

        <div className="grid grid-cols-1 gap-6 pt-12 text-left md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <a
              key={index}
              href={testimonial.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full"
            >
              <div 
                className="flex h-full flex-col justify-between glass-panel grid-border p-6 transition-all hover:border-[#FECC00] metal-shine border border-white/10"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        src={testimonial.avatar}
                        alt={`${testimonial.name}'s avatar`}
                        width={48}
                        height={48}
                        className="h-12 w-12 border border-[#FECC00]"
                      />
                      <div>
                        <div className="font-bold text-white uppercase tracking-wide text-sm">{testimonial.name}</div>
                        <div className="text-xs text-[#FECC00]">{testimonial.handle}</div>
                      </div>
                    </div>
                    <Image
                      src={testimonial.socialIcon}
                      alt={`${testimonial.socialPlatform} logo`}
                      width={16}
                      height={16}
                      className="h-4 w-4 opacity-50"
                    />
                  </div>
                  <p className="mt-6 whitespace-pre-wrap text-sm text-white/70 leading-relaxed">
                    {testimonial.quote}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="inline-flex items-center space-x-2 border border-[#FECC00] bg-[#FECC00] px-4 py-3 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-[#FECC00]/80">
            <span>🐝</span>
            <span>LOAD MORE</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;