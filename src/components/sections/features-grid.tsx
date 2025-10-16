"use client";

import React, { useEffect, useRef } from 'react';
import {
  Star,
  Lock,
  ArrowLeftRight,
  Send,
  Cog,
  Mail,
  Grid,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface Feature {
  icon: React.ElementType | string;
  title: string;
  description: React.ReactNode;
  href: string;
}

const features: Feature[] = [
  {
    icon: Sparkles,
    title: 'AI-Powered Terminal',
    description: 'Built-in Mistral AI integration. Ask questions, get code help, and solve problems directly in the terminal.',
    href: '/desktop',
  },
  {
    icon: Star,
    title: 'Open Source',
    description: "This is the way. Wasp is fully open-source and you're welcome to contribute!",
    href: 'https://github.com/wasp-lang/wasp',
  },
  {
    icon: Lock,
    title: 'Full-stack Auth',
    description: 'Add login with social providers or email in a few lines of code with powerful UI helpers. No third party vendor lock-in.',
    href: 'https://wasp.sh/blog/2023/04/12/auth-ui',
  },
  {
    icon: ArrowLeftRight,
    title: 'RPC (Client <-> Server)',
    description: 'Wasp provides a typesafe RPC layer that instantly brings your data models and server logic to the client.',
    href: 'https://wasp.sh/docs/data-model/operations/overview',
  },
  {
    icon: Send,
    title: 'Simple Deployment',
    description: 'Deploy your app to any platform. Wasp offers CLI helpers for the most popular options.',
    href: 'https://wasp.sh/docs/deployment/intro',
  },
  {
    icon: Cog,
    title: 'Jobs',
    description: (
      <>
        Easily define, schedule and run specialized server tasks.
        <br />
        Persistent, retryable, delayable.
      </>
    ),
    href: 'https://wasp.sh/docs/advanced/jobs',
  },
  {
    icon: Mail,
    title: 'Email Sending',
    description: 'All you need to do is connect an email provider and you can send emails!',
    href: 'https://wasp.sh/docs/advanced/email',
  },
  {
    icon: 'T',
    title: 'Full-stack Type Safety',
    description: 'Full support for TypeScript with auto-generated types that span the whole stack.',
    href: 'https://wasp.sh/docs/tutorial/queries#implementing-a-query',
  },
  {
    icon: Grid,
    title: 'And More!',
    description: 'Custom API routes, database seeding, optimistic updates, automatic cache invalidation on the client, ...',
    href: 'https://wasp.sh/docs',
  },
];

const FeatureCard = ({ icon: Icon, title, description, href, index }: Feature & { index: number }) => {
  return (
    <div className="grid-border glass-panel p-6 space-y-4 metal-shine border border-white/10 hover:border-[#FECC00]/50 transition-all">
      <div className="flex items-center gap-4">
        <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center border border-[#FECC00] bg-[#FECC00]/10 text-[#FECC00]">
          {typeof Icon === 'string' ? (
            <span className="font-bold text-xl">{Icon}</span>
          ) : (
            <Icon className="h-5 w-5" aria-hidden="true" />
          )}
        </div>
        <dt className="font-bold text-white uppercase tracking-wide text-sm">{title}</dt>
      </div>
      <dd className="text-white/70 text-sm leading-relaxed">{description}</dd>
      <a href={href} className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#FECC00] hover:text-white transition-all group font-bold">
        <span>LEARN MORE</span>
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
      </a>
    </div>
  );
};

const FeaturesGrid = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
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
                  titleRef.current.style.transform = 'translateY(20px)';
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
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -100px 0px' }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative border-y border-[#FECC00]/30">
      <div className="relative container mx-auto py-20 md:py-28">
        <h2 ref={titleRef} className="text-3xl font-bold uppercase tracking-wide text-white md:text-4xl text-center mb-16" style={{ opacity: 0 }}>
          FEATURES
        </h2>
        <dl className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </dl>
      </div>
    </section>
  );
};

export default FeaturesGrid;