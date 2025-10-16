"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef } from 'react';

const showcaseData = [
  {
    title: 'Farnance: SaaS marketplace for farmers',
    tags: ['hackathon', 'material-ui'],
    description: 'See how Julian won HackLBS 2021 among 250 participants and why Wasp was instrumental for the team\'s victory.',
    imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/925e87bf-f3d6-444f-8bd6-c8540aabc457-wasp-sh/assets/images/farnance-dashboard-11.webp?',
    link: 'https://wasp.sh/blog/2022/10/28/farnance-hackathon-winner',
  },
  {
    title: 'Grabbit: Easily manage dev environments',
    tags: ['internal-tools'],
    description: 'See how Michael built and deployed an internal tool for managing dev resources at StudentBeans.',
    imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/925e87bf-f3d6-444f-8bd6-c8540aabc457-wasp-sh/assets/images/grabbit-hero-12.webp?',
    link: 'https://wasp.sh/blog/2022/11/26/michael-curry-usecase',
  },
  {
    title: 'Amicus: Task and workflow management for legal teams',
    tags: ['startup', 'material-ui'],
    description: 'See how Erlis rolled out fully-fledged SaaS as a team of one in record time and got first paying customers.',
    imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/925e87bf-f3d6-444f-8bd6-c8540aabc457-wasp-sh/assets/images/amicus-landing-13.webp?',
    link: 'https://wasp.sh/blog/2022/11/26/erlis-amicus-usecase',
  },
];

const tagColorClasses: { [key: string]: string } = {
  'hackathon': 'border-[#FECC00] bg-[#FECC00]/20 text-[#FECC00]',
  'material-ui': 'border-white bg-white/20 text-white',
  'internal-tools': 'border-[#FECC00] bg-[#FECC00]/20 text-[#FECC00]',
  'startup': 'border-white bg-white/20 text-white',
};

const ShowcaseGallery = () => {
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
                  titleRef.current.style.transform = 'rotateX(45deg)';
                  setTimeout(() => {
                    if (titleRef.current) {
                      titleRef.current.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                      titleRef.current.style.opacity = '1';
                      titleRef.current.style.transform = 'rotateX(0deg)';
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
    <section ref={sectionRef} className="py-20 md:py-28 border-y border-[#FECC00]/30">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center">
          <h2 ref={titleRef} className="text-3xl font-bold uppercase tracking-wide text-white" style={{ opacity: 0 }}>
            🏆 SHOWCASE GALLERY 🏆
          </h2>
          <p className="mt-6 text-lg text-white/70">
            See what others are building with Wasp.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {showcaseData.map((item, index) => (
            <Link 
              href={item.link} 
              key={item.title} 
              className="block group"
            >
              <Card className="h-full overflow-hidden border border-white/10 glass-panel transition-all hover:border-[#FECC00] metal-shine">
                <div className="relative h-56 w-full border-b border-white/10">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="flex flex-1 flex-col justify-between p-6 space-y-4">
                  <div>
                    <p className="text-base font-bold uppercase tracking-wide text-white">{item.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.map(tag => (
                        <span key={tag} className={`inline-flex items-center border px-2 py-1 text-xs font-bold uppercase tracking-wider ${tagColorClasses[tag] || 'border-white/20 bg-white/20 text-white/70'}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-white/70">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShowcaseGallery;