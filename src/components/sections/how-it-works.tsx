"use client";

import { ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import WaspDiagram from '@/components/wasp-diagram';

const features = [
  {
    title: 'Simple config language',
    description: 'Declaratively describe high-level details of your app.',
    link: 'https://wasp.sh/docs/general/language',
  },
  {
    title: 'Wasp CLI',
    description: 'All the handy commands at your fingertips.',
    link: 'https://wasp.sh/docs/general/cli',
  },
  {
    title: 'React / Node.js / Prisma',
    description: 'You are still writing 90% of the code in your favorite technologies.',
    link: null,
  },
  {
    title: 'Goodbye boilerplate',
    description: 'Write only the code that matters, let Wasp handle the rest.',
    link: 'https://www.youtube.com/watch?v=x5nsBbLvKnU',
  },
];

const HowItWorksSection = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const hasAnimated = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);

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
                  titleRef.current.style.transform = 'scale(0.9) translateY(20px)';
                  setTimeout(() => {
                    if (titleRef.current) {
                      titleRef.current.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                      titleRef.current.style.opacity = '1';
                      titleRef.current.style.transform = 'scale(1) translateY(0)';
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
    <section ref={sectionRef} className="py-20 md:py-28">
      <div className="container mx-auto space-y-16 px-6 lg:px-16 xl:px-20">
        <div>
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <h2 ref={titleRef} className="text-3xl font-bold uppercase tracking-wide text-white md:text-4xl" style={{ opacity: 0 }}>
              HOW DOES IT WORK? 🧐
            </h2>
            <div className="space-y-6 max-w-3xl">
              <p className="text-lg text-white/70">
                Given a simple <code className="border border-[#FECC00] bg-[#FECC00]/10 text-[#FECC00] px-2 py-1 text-sm">.wasp</code> configuration file that
                describes the high-level details of your web app, and{' '}
                <code className="border border-[#FECC00] bg-[#FECC00]/10 text-[#FECC00] px-2 py-1 text-sm">.js(x)/.css/...</code>, source files with your unique
                logic, Wasp compiler generates the full source of your web app
                in the target stack: front-end, back-end and deployment.
              </p>
              <p className="text-lg text-white/70">
                This unique approach is what makes Wasp "smart" and gives it
                its super powers!
              </p>
            </div>
          </div>
          <div className="mt-12">
            <WaspDiagram />
          </div>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="glass-panel grid-border p-6 space-y-4 border border-white/10 hover:border-[#FECC00]/50 transition-all">
                <h4 className="inline-block border border-[#FECC00] bg-[#FECC00]/20 px-3 py-2 font-bold uppercase tracking-wide text-[#FECC00] text-sm">
                  {feature.title}
                </h4>
                <p className="text-white/70">{feature.description}</p>
                {feature.link && (
                  <a
                    href={feature.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#FECC00] hover:text-white transition-all font-bold"
                  >
                    <span>LEARN MORE</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;