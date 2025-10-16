"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef } from 'react';

export default function NewsletterSignup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!sectionRef.current || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            
            if (containerRef.current) {
              requestAnimationFrame(() => {
                if (containerRef.current) {
                  containerRef.current.style.opacity = '0';
                  containerRef.current.style.transform = 'scale(0.95) translateY(20px)';
                  setTimeout(() => {
                    if (containerRef.current) {
                      containerRef.current.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                      containerRef.current.style.opacity = '1';
                      containerRef.current.style.transform = 'scale(1) translateY(0)';
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
    <section ref={sectionRef} id="signup" className="py-20 md:py-28">
      <div className="container">
        <div 
          ref={containerRef}
          className="border border-[#FECC00] glass-panel p-12 text-center metal-shine" 
          style={{
            background: 'radial-gradient(circle at center, rgba(254, 204, 0, 0.05) 0%, transparent 70%)',
            opacity: 0
          }}
        >
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold uppercase tracking-wide text-white">
              STAY UP TO DATE 📬
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/70">
              Be the first to know when we ship new features and updates!
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-8 mx-auto flex max-w-md flex-col gap-4 sm:flex-row sm:gap-3"
            >
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="min-w-0 flex-auto border-white/20 bg-card text-white"
                placeholder="you@awesomedev.com"
              />
              <Button type="submit" className="flex-none border border-[#FECC00] bg-[#FECC00] text-black hover:bg-[#FECC00]/80 uppercase tracking-wide font-bold">
                SUBSCRIBE
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}