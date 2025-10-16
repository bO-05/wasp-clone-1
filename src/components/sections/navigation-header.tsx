"use client";

import { useState } from "react";
import Link from "next/link";
import CustomLogo from "@/components/custom-logo";
import { Menu, X, Star, Github, Twitter, Monitor } from "lucide-react";

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.222 5.392a15.863 15.863 0 0 0-4.66-1.579.11.11 0 0 0-.105.075 12.35 12.35 0 0 0-1.63 3.659A14.032 14.032 0 0 0 8.12 7.545a12.522 12.522 0 0 0-1.63-3.66.11.11 0 0 0-.106-.074 15.82 15.82 0 0 0-4.66 1.578.11.11 0 0 0-.05.143 16.539 16.539 0 0 0 4.12 9.467.11.11 0 0 0 .147.03 12.013 12.013 0 0 0 2.228-1.423.11.11 0 0 0-.012-.171 10.385 10.385 0 0 1-1.12-1.293.11.11 0 0 1 .04-.171c.012-.005.024-.01.036-.015a13.331 13.331 0 0 0 10.156 0c.012.005.024.01.037.015a.11.11 0 0 1 .04.171 10.385 10.385 0 0 1-1.12 1.293.11.11 0 0 0-.012.17c.725.432 1.543.91 2.228 1.424a.11.11 0 0 0 .147-.03 16.539 16.539 0 0 0 4.12-9.467.11.11 0 0 0-.05-.143Z" />
  </svg>
);

const navLinks = [
  { href: "https://wasp.sh/docs", label: "DOCS" },
  { href: "https://wasp.sh/blog", label: "BLOG" },
  { href: "#faq", label: "FAQ" },
  { href: "/desktop", label: "DESKTOP" },
];

export default function NavigationHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50">
      <div className="absolute top-0 h-full w-full glass-panel" />
      <nav className="border-b border-white/10">
        <div className="relative mx-auto flex h-16 justify-between lg:container lg:px-16 xl:px-20">
          <div className="absolute inset-y-0 left-0 flex items-center px-2 lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 text-[#FECC00] hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FECC00]"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center sm:items-stretch lg:justify-between">
            <div className="flex items-center">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/" className="flex items-center">
                  <div className="h-6 w-6 shrink-0">
                    <CustomLogo />
                  </div>
                  <span className="ml-3 text-lg font-bold uppercase tracking-wider text-white">
                    WASP <sup className="text-sm font-bold text-[#FECC00]">β</sup>
                  </span>
                </Link>
              </div>
              <div className="hidden pl-8 sm:ml-6 sm:space-x-6 lg:flex">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="border-b-2 border-transparent px-1 py-5 text-sm font-bold uppercase tracking-wide text-white transition-all hover:border-[#FECC00] hover:text-[#FECC00]">
                    {link.label}
                  </Link>
                ))}
                <Link href="https://wasp.sh/#signup" className="flex items-center border-b-2 border-transparent px-1 py-5 text-sm font-bold uppercase">
                  <span className="bg-[#FECC00]/20 border border-[#FECC00] px-3 py-1.5 text-[#FECC00] transition-all hover:bg-[#FECC00] hover:text-black">
                    📬 JOIN LIST
                  </span>
                </Link>
              </div>
            </div>

            <div className="hidden items-center gap-3 space-x-2 lg:flex">
              <a href="https://github.com/wasp-lang/wasp" target="_blank" rel="noopener noreferrer" className="group flex items-center space-x-2 border border-white/20 bg-card px-3 py-2 text-xs uppercase tracking-wide text-white transition-all hover:border-[#FECC00] hover:text-[#FECC00]">
                <Star className="h-3 w-3" />
                <span className="truncate font-bold">STAR</span>
              </a>
              <Link href="https://wasp.sh/docs/quick-start" className="border border-[#FECC00] bg-[#FECC00] px-3 py-2 text-xs font-bold uppercase tracking-wide text-black transition-all hover:bg-[#FECC00]/80">
                GET STARTED
              </Link>
              <a href="https://github.com/wasp-lang/wasp" target="_blank" rel="noopener noreferrer" className="text-white transition-all hover:text-[#FECC00]">
                <Github className="h-5 w-5" title="GitHub" />
              </a>
              <a href="https://discord.gg/rzdnErX" target="_blank" rel="noopener noreferrer" className="text-white transition-all hover:text-[#FECC00]">
                <DiscordIcon className="h-6 w-6" title="Discord" />
              </a>
              <a href="https://twitter.com/WaspLang" target="_blank" rel="noopener noreferrer" className="text-white transition-all hover:text-[#FECC00]">
                <Twitter className="h-5 w-5" title="X" />
              </a>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-white/10 lg:hidden glass-panel" id="mobile-menu">
            <div className="space-y-1 px-4 pb-3 pt-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block px-3 py-2 text-base font-bold uppercase text-white hover:text-[#FECC00]" onClick={() => setIsMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Link href="https://wasp.sh/#signup" className="block px-3 py-2 text-base font-bold uppercase text-white hover:text-[#FECC00]" onClick={() => setIsMenuOpen(false)}>
                📬 JOIN LIST
              </Link>
              <a href="https://github.com/wasp-lang/wasp" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 px-3 py-2 text-base font-bold uppercase text-white hover:text-[#FECC00]">
                <Star className="h-5 w-5 text-[#FECC00]" />
                <span>STAR</span>
              </a>
              <Link href="https://wasp.sh/docs/quick-start" className="block w-full bg-[#FECC00] px-3 py-2 text-center text-base font-bold uppercase text-black transition-all hover:bg-[#FECC00]/80" onClick={() => setIsMenuOpen(false)}>
                GET STARTED
              </Link>
              <div className="flex items-center justify-center space-x-6 pt-2">
                <a href="https://github.com/wasp-lang/wasp" target="_blank" rel="noopener noreferrer" className="text-white/70 transition-all hover:text-[#FECC00]">
                  <Github className="h-6 w-6" title="GitHub" />
                </a>
                <a href="https://discord.gg/rzdnErX" target="_blank" rel="noopener noreferrer" className="text-white/70 transition-all hover:text-[#FECC00]">
                  <DiscordIcon className="h-7 w-7" title="Discord" />
                </a>
                <a href="https://twitter.com/WaspLang" target="_blank" rel="noopener noreferrer" className="text-white/70 transition-all hover:text-[#FECC00]">
                  <Twitter className="h-6 w-6" title="X" />
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}