"use client";

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Terminal, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CodeLine = ({ children }: { children: React.ReactNode }) => (
  <div className="token-line">{children}</div>
);

const todoAppCode = (
  <>
    <CodeLine>
      <span className="text-[#FECC00]">app</span>{' '}
      <span className="text-white">todoApp</span> <span className="text-white/50">{'{'}</span>
    </CodeLine>
    <CodeLine>
      {'  '}
      <span className="text-white">title</span>: <span className="text-[#FECC00]">"ToDo App"</span>,{'  '}
      <span className="text-white/50">// visible in the browser tab</span>
    </CodeLine>
    <CodeLine>
      {'  '}
      <span className="text-white">auth</span>: <span className="text-white/50">{'{'}</span>{' '}
      <span className="text-white/50">// full-stack auth out-of-the-box</span>
    </CodeLine>
    <CodeLine>
      {'    '}
      <span className="text-white">userEntity</span>: <span className="text-white">User</span>,
    </CodeLine>
    <CodeLine>
      {'    '}
      <span className="text-white">methods</span>: <span className="text-white/50">{'{'}</span>{' '}
      <span className="text-white">google</span>: <span className="text-white/50">{'{'}</span>
      <span className="text-white/50">{'}'}</span>, <span className="text-white">gitHub</span>: <span className="text-white/50">{'{'}</span>
      <span className="text-white/50">{'}'}</span>, <span className="text-white">email</span>: <span className="text-white/50">{'{'}...{'}'}</span>{' '}
      <span className="text-white/50">{'}'}</span>
    </CodeLine>
    <CodeLine>
      {'  '}
      <span className="text-white/50">{'}'}</span>
    </CodeLine>
    <CodeLine>{' '}</CodeLine>
    <CodeLine>
      <span className="text-[#FECC00]">route</span>{' '}
      <span className="text-white">RootRoute</span> <span className="text-white/50">{'{'}</span>{' '}
      <span className="text-white">path</span>: <span className="text-[#FECC00]">"/"</span>,{' '}
      <span className="text-white">to</span>: <span className="text-white">MainPage</span>{' '}
      <span className="text-white/50">{'}'}</span>
    </CodeLine>
    <CodeLine>
      <span className="text-[#FECC00]">page</span> <span className="text-white">MainPage</span> <span className="text-white/50">{'{'}</span>
    </CodeLine>
    <CodeLine>
      {'  '}
      <span className="text-white">authRequired</span>: <span className="text-[#FECC00]">true</span>,{' '}
      <span className="text-white/50">// Limit access to logged in users.</span>
    </CodeLine>
    <CodeLine>
      {'  '}
      <span className="text-white">component</span>: <span className="text-[#FECC00]">import</span> Main{' '}
      <span className="text-[#FECC00]">from</span> <span className="text-[#FECC00]">"@client/Main.tsx"</span>{' '}
      <span className="text-white/50">// Your React code.</span>
    </CodeLine>
    <CodeLine>
      <span className="text-white/50">{'}'}</span>
    </CodeLine>
    <CodeLine>{' '}</CodeLine>
    <CodeLine>
      <span className="text-[#FECC00]">query</span> <span className="text-white">getTasks</span> <span className="text-white/50">{'{'}</span>
    </CodeLine>
    <CodeLine>
      {'  '}
      <span className="text-white">fn</span>: <span className="text-[#FECC00]">import</span> <span className="text-white/50">{'{'}</span> getTasks <span className="text-white/50">{'}'}</span>{' '}
      <span className="text-[#FECC00]">from</span> <span className="text-[#FECC00]">"@server/tasks.js"</span>,{' '}
      <span className="text-white/50">// Your Node.js code.</span>
    </CodeLine>
    <CodeLine>
      {'  '}
      <span className="text-white">entities</span>: <span className="text-white/50">[</span>
      <span className="text-white">Task</span><span className="text-white/50">]</span>{' '}
      <span className="text-white/50">// Automatic cache invalidation.</span>
    </CodeLine>
    <CodeLine>
      <span className="text-white/50">{'}'}</span>
    </CodeLine>
  </>
);

const schemaPrismaCode = (
  <CodeLine>
    <span className="text-[#FECC00]">model</span> <span className="text-white">Task</span>{' '}
    <span className="text-white/50">{'{'}</span> ... <span className="text-white/50">{'}'}</span>{' '}
    <span className="text-white/50">// Your Prisma data model</span>
  </CodeLine>
);

const CodeBlock = ({ title, description, link, code }: { title: string; description: string; link: string; code: React.ReactNode }) => {
  return (
    <div className="relative flex flex-col items-center justify-center metal-shine">
      <div className="flex h-8 w-full items-center justify-between border-b border-[#FECC00]/30 bg-card px-3">
        <Link href={link} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-xs uppercase tracking-wider text-[#FECC00] transition-all hover:text-white">
          <span className="font-bold">{title}</span>
          <ExternalLink className="h-3 w-3" />
          <span className="text-white/50">· {description}</span>
        </Link>
        <div className="flex space-x-2">
          <div className="h-2 w-2 bg-[#FECC00]" />
          <div className="h-2 w-2 bg-white" />
          <div className="h-2 w-2 bg-[#FECC00]" />
        </div>
      </div>
      <div className="w-full border border-[#FECC00]/30 glass-panel text-sm">
        <pre className="p-6 text-xs leading-[1.7] overflow-x-auto">{code}</pre>
      </div>
    </div>
  );
};

const HeroSection = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (titleRef.current && !hasAnimated.current) {
      hasAnimated.current = true;
      const words = titleRef.current.querySelectorAll('.word');
      
      // Optimized: Faster, smoother animation
      words.forEach((word, index) => {
        requestAnimationFrame(() => {
          (word as HTMLElement).style.opacity = '0';
          (word as HTMLElement).style.transform = 'translateY(20px)';
          
          setTimeout(() => {
            (word as HTMLElement).style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
            (word as HTMLElement).style.opacity = '1';
            (word as HTMLElement).style.transform = 'translateY(0)';
          }, index * 50);
        });
      });
    }
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-6 pt-24 pb-5 sm:py-16 md:py-24 lg:px-16 lg:py-24 xl:px-20">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16">
          <div className="z-10 flex flex-col space-y-12 lg:col-span-6">
            <div>
              <h1 ref={titleRef} className="text-4xl font-extrabold lg:text-5xl text-white" style={{ lineHeight: '1.1' }}>
                <span className="word inline-block">NEXT-GEN</span>{' '}
                <span className="word inline-block">RAILS</span>{' '}
                <span className="word inline-block">FOR</span>{' '}
                <span className="word inline-block">REACT</span>{' '}
                <span className="word inline-block">&</span>{' '}
                <span className="word inline-block text-[#FECC00]">NODE</span>
              </h1>
              <p className="mt-6 text-xl text-white/70">
                Build, ship, and deploy full‑stack apps faster with zero boilerplate.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild size="lg" className="bg-[#FECC00] text-black hover:bg-[#FECC00]/80 text-sm font-bold uppercase tracking-wide h-auto px-4 py-3 border border-[#FECC00]">
                <Link href="https://wasp.sh/docs/quick-start">
                  <Terminal className="mr-2 h-4 w-4" />
                  GET STARTED
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:border-[#FECC00] hover:text-[#FECC00] text-sm font-bold uppercase tracking-wide h-auto px-4 py-3 bg-transparent">
                <Link href="https://wasp.sh/docs">
                  <FileText className="mr-2 h-4 w-4" />
                  DOCS
                </Link>
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              <small className="text-xs uppercase tracking-widest text-[#FECC00] font-bold">WORKS WITH</small>
              <div className="flex items-center gap-8">
                <div className="group inline-flex items-center">
                  <Image src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/925e87bf-f3d6-444f-8bd6-c8540aabc457-wasp-sh/assets/svgs/react-logo-gray-1.svg?" alt="React logo" width={80} height={40} className="h-8 w-auto grayscale opacity-60 transition-all duration-200 ease-out group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-100" />
                </div>
                <div className="group inline-flex items-center">
                  <Image src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/925e87bf-f3d6-444f-8bd6-c8540aabc457-wasp-sh/assets/svgs/nodejs-logo-gray-2.svg?" alt="Node.js logo" width={80} height={40} className="h-8 w-auto grayscale opacity-60 transition-all duration-200 ease-out group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-100" />
                </div>
                <div className="group inline-flex items-center">
                  <Image src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/925e87bf-f3d6-444f-8bd6-c8540aabc457-wasp-sh/assets/svgs/prisma-logo-gray-3.svg?" alt="Prisma logo" width={80} height={40} className="h-8 w-auto grayscale opacity-60 transition-all duration-200 ease-out group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-100" />
                </div>
              </div>
              <span className="mt-4 flex items-center gap-2">
                <small className="text-xs uppercase tracking-widest text-[#FECC00] font-bold">BACKED BY</small>
                <Image src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/925e87bf-f3d6-444f-8bd6-c8540aabc457-wasp-sh/assets/images/yc-logo-rounded-2.webp?" alt="Y Combinator logo" width={96} height={25} className="ml-2 w-20 h-auto grayscale opacity-60 transition-all duration-200 ease-out hover:grayscale-0 hover:opacity-100 hover:scale-110" />
              </span>
            </div>
          </div>
          <div className="mt-16 flex flex-col gap-4 lg:col-span-6 lg:mt-0">
            <CodeBlock 
                title="TODOAPP.WASP"
                description="WASP CONFIG"
                link="https://github.com/wasp-lang/wasp/blob/release/examples/tutorials/TodoAppTs/main.wasp"
                code={todoAppCode}
            />
            <CodeBlock
                title="SCHEMA.PRISMA"
                description="DATA MODEL"
                link="https://github.com/wasp-lang/wasp/blob/release/examples/tutorials/TodoAppTs/schema.prisma"
                code={schemaPrismaCode}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;