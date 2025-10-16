"use client";

import Image from 'next/image';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Example {
  title: string;
  emoji: string;
  description: string;
  authorName: string;
  authorAvatar: string;
  authorLink: string;
  repoName: string;
  repoLink: string;
  codeLink: string;
  demoLink?: string;
}

const examples: Example[] = [
  {
    title: 'Todo App (TypeScript)',
    emoji: '✅',
    description: 'A famous To-Do list app, implemented in TypeScript.',
    authorName: 'wasp',
    authorAvatar: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/925e87bf-f3d6-444f-8bd6-c8540aabc457-wasp-sh/assets/images/55102317-4.webp?',
    authorLink: 'https://github.com/wasp-lang',
    repoName: 'TodoAppTs',
    repoLink: 'https://github.com/wasp-lang/wasp/tree/release/examples/tutorials/TodoAppTs',
    codeLink: 'https://github.com/wasp-lang/wasp/tree/release/examples/tutorials/TodoAppTs',
  },
  {
    title: 'CoverLetterGPT',
    emoji: '🤖',
    description: 'Generate cover letters based on your CV and the job description. Powered by ChatGPT.',
    authorName: 'vincanger',
    authorAvatar: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/925e87bf-f3d6-444f-8bd6-c8540aabc457-wasp-sh/assets/images/70215737-5.webp?',
    authorLink: 'https://github.com/vincanger',
    repoName: 'coverlettergpt',
    repoLink: 'https://github.com/vincanger/coverlettergpt',
    codeLink: 'https://github.com/vincanger/coverlettergpt',
    demoLink: 'https://coverlettergpt.xyz/',
  },
  {
    title: 'Realtime voting via WebSockets',
    emoji: '🔌',
    description: 'A realtime, websockets-powered voting app built with Wasp and TypeScript.',
    authorName: 'wasp',
    authorAvatar: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/925e87bf-f3d6-444f-8bd6-c8540aabc457-wasp-sh/assets/images/55102317-4.webp?',
    authorLink: 'https://github.com/wasp-lang',
    repoName: 'websockets-realtime-voting',
    repoLink: 'https://github.com/wasp-lang/wasp/tree/release/examples/websockets-realtime-voting',
    codeLink: 'https://github.com/wasp-lang/wasp/tree/release/examples/websockets-realtime-voting',
    demoLink: 'https://websockets-voting-client.fly.dev/login',
  },
];

const ExampleCard = ({ example, index }: { example: Example; index: number }) => {
  return (
    <div className="group relative flex h-full flex-col justify-between overflow-hidden glass-panel grid-border metal-shine border border-white/10 hover:border-[#FECC00] transition-all" style={{ perspective: '1000px' }}>
      <div className="flex-grow space-y-6 p-6 border-b border-white/10">
        <div className="space-y-3">
          <h3 className="flex items-center text-lg font-bold uppercase tracking-wide text-white">
            <span>{example.title}</span>
            <span className="ml-2">{example.emoji}</span>
          </h3>
          <p className="text-white/70 text-sm">{example.description}</p>
        </div>
        <a
          href={example.authorLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-xs uppercase tracking-wide text-[#FECC00] hover:text-white transition-all"
        >
          <Image
            className="h-6 w-6 border border-[#FECC00]"
            src={example.authorAvatar}
            alt={`${example.authorName} GitHub profile picture`}
            width={24}
            height={24}
          />
          <span className="font-bold">{example.authorName}</span>
        </a>
      </div>
      <div className="space-y-4 bg-card p-6">
        <a
          href={example.repoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-xs uppercase tracking-wider text-[#FECC00] hover:text-white transition-all font-bold"
        >
          <span>{example.repoName}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
        <div className="flex items-center gap-2">
          <a
            href={example.codeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 border border-white/20 bg-card px-3 py-2 text-xs uppercase tracking-wide text-white transition-all hover:border-[#FECC00] hover:text-[#FECC00] font-bold"
          >
            <span>CODE</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          {example.demoLink && (
            <a
              href={example.demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 border border-[#FECC00] bg-[#FECC00] px-3 py-2 text-xs uppercase tracking-wide text-black transition-all hover:bg-[#FECC00]/80 font-bold"
            >
              <span>DEMO</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ExamplesShowcase() {
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
                  titleRef.current.style.transform = 'translateX(-30px)';
                  setTimeout(() => {
                    if (titleRef.current) {
                      titleRef.current.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                      titleRef.current.style.opacity = '1';
                      titleRef.current.style.transform = 'translateX(0)';
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
    <section ref={sectionRef} className="border-y border-[#FECC00]/30">
      <div className="container mx-auto px-6 py-20 md:py-28 lg:px-16 xl:px-20">
        <div className="text-center">
          <h2 ref={titleRef} className="text-4xl font-bold uppercase tracking-wide text-white" style={{ opacity: 0 }}>
            SHOW, DON'T TELL.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-white/70">
            Take a look at examples - see how things work and get inspired for your next project.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {examples.map((example, index) => (
            <ExampleCard key={example.title} example={example} index={index} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <a
            href="https://github.com/wasp-lang/wasp/tree/release/examples"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex cursor-pointer items-center justify-center gap-2 text-[#FECC00] transition-all hover:text-white font-bold uppercase tracking-wider text-sm"
          >
            <span>SEE ALL EXAMPLES</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}