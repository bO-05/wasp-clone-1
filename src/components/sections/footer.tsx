"use client";

import Image from 'next/image';
import Link from 'next/link';
import CustomLogo from '@/components/custom-logo';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const linkSpanClassName = "cursor-pointer text-xs uppercase tracking-wider text-white/70 transition-all hover:text-[#FECC00] font-bold";

const docsLinks = [
  { href: "https://wasp.sh/docs", label: "Getting Started" },
  { href: "https://wasp.sh/docs/tutorial/create", label: "Todo App Tutorial" },
  { href: "https://wasp.sh/docs/general/language", label: "Language Reference" },
];

const communityLinks = [
  { href: "https://discord.gg/rzdnErX", label: "Discord" },
  { href: "https://twitter.com/WaspLang", label: "X / Twitter" },
  { href: "https://bsky.app/profile/wasp-lang.bsky.social", label: "Bluesky" },
  { href: "https://github.com/wasp-lang/wasp", label: "GitHub" },
];

const companyLinks = [
  { href: "https://wasp.sh/blog", label: "Blog" },
  { href: "https://wasp-lang.notion.site/Wasp-Careers-59fd1682c80d446f92be5fa65cc17672", label: "Careers" },
  { href: "https://wasp-lang.notion.site/Framework-Engineer-at-Wasp-12a18a74854c80de9481c33ebe9cccff?pvs=25#1371801161fd404a8c583cde3611238e", label: "Company" },
];

const FooterLinkColumn = ({ title, links }: { title: string, links: { href: string, label: string }[] }) => (
  <div className="col-span-1 md:col-span-3">
    <p className="font-bold uppercase tracking-wider text-white text-sm">{title}</p>
    <div className="mt-6 flex flex-col space-y-3">
      {links.map((link) => {
        const isExternal = link.href.startsWith('http');
        if (isExternal) {
          return (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
              <span className={linkSpanClassName}>{link.label}</span>
            </a>
          );
        }
        return (
          <Link key={link.href} href={link.href}>
            <span className={linkSpanClassName}>{link.label}</span>
          </Link>
        );
      })}
    </div>
  </div>
);

const Footer = () => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <footer id="footer" className="border-t border-[#FECC00]/30 glass-panel">
      <div className="container mx-auto px-6 py-20 md:py-24 lg:px-16 lg:py-20 xl:px-20">
        <div id="signup"></div>
        <div className="mb-12 space-y-4 text-center md:text-left">
          <h5 className="text-2xl font-bold uppercase tracking-wide text-white">STAY UP TO DATE 📬</h5>
          <p className="text-white/70">Join our mailing list and be the first to know when we ship new features and updates!</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
          <form ref={formRef} className="flex w-full max-w-lg items-center justify-center md:w-auto gap-3">
            <input 
              type="email" 
              placeholder="you@awesomedev.com" 
              className="w-full border border-white/20 bg-card px-4 py-3 text-sm text-white transition-all focus:border-[#FECC00] focus:outline-none md:w-80"
            />
            <button 
              type="submit" 
              className="border border-[#FECC00] bg-[#FECC00] px-4 py-3 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-[#FECC00]/80 whitespace-nowrap"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
        
        <div className="my-12 flex w-full items-center justify-center gap-3">
            <small className="text-xs uppercase tracking-widest text-[#FECC00] font-bold">BACKED BY</small>
            <span className="group inline-flex items-center">
              <img 
                src="https://wasp.sh/img/lp/yc-logo-rounded.webp" 
                alt="YC" 
                className="w-20 h-auto grayscale opacity-60 transition-all duration-200 ease-out group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
                width={96}
                height={27}
              />
            </span>
        </div>

        <div className="grid grid-cols-2 gap-8 gap-y-12 md:grid-cols-12 md:gap-6 lg:grid-cols-12">
            <FooterLinkColumn title="DOCS" links={docsLinks} />
            <FooterLinkColumn title="COMMUNITY" links={communityLinks} />
            <FooterLinkColumn title="COMPANY" links={companyLinks} />
        </div>

        <div className="mt-12 w-full border-t border-[#FECC00]/30"></div>

        <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <div style={{ width: '18px', height: '18px' }}>
                <CustomLogo />
              </div>
              <p className="text-xs uppercase tracking-wider text-white/70 font-bold">© WASP, INC. ALL RIGHTS RESERVED.</p>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;