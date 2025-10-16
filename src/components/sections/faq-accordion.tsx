"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    value: "item-1",
    question: "How is Wasp different from Next.js / Nuxt.js / Gatsby?",
    answer: [
      "Wasp is a full-stack framework - it covers the whole stack, from front-end to back-end and the database. Next.js, Nuxt.js, and Gatsby are all front-end frameworks. They provide a great frontend-building experience but leave the back-end to you.",
      "With Wasp, you can write your front-end in React (and soon Vue, Svelte, ...) and your back-end in Node.js, and it's all nicely integrated. As a developer, this means you don't have to worry about connecting the two, building/bundling, or deploying - it's all handled by Wasp.",
      'Another popular solution for building full-stack apps is to combine Next.js with a "backend-as-a-service" solution like Firebase or Supabase. This can be a great combo, but it also has its downsides, namely vendor lock-in and less flexibility. Wasp is open-source and provides you with the full-stack codebase that you can eject from at any time and continue developing on your own.',
    ],
  },
  {
    value: "item-2",
    question: "How is Wasp different from Ruby on Rails or Django?",
    answer: [
      "Ruby on Rails and Django are also backend-focused frameworks, while Wasp is a full-stack framework that also takes care of the client side (React, etc.). Wasp's special power is that it provides a custom-made language for declaratively describing components of a modern full-stack web app, which simplifies the development process and allows Wasp to provide a lot of functionality out-of-the-box.",
    ],
  },
  {
    value: "item-3",
    question: "How hard is it to learn Wasp?",
    answer: [
      "Our main goal is to make web development easier and more fun, so we designed Wasp to be as simple as possible. It is a small language with only a few concepts to learn. Most of your code will still be in React and Node.js. If you already know them, you will be productive with Wasp in less than an hour! And if you don't know them, Wasp is a great place to start learning them, since it offers a much simpler, structured way of developing a web app with them.",
    ],
  },
  {
    value: "item-4",
    question: "Do you support only React & Node.js currently?",
    answer: [
      "Yes. Wasp is still in beta so we wanted to focus on one stack and do it right. React and Node.js with Prisma are super popular and a pleasure to work with, so that's why we chose them. We plan to add support for other front-end frameworks (e.g., Vue, Svelte), back-end languages, and databases in the future.",
    ],
  },
];

export default function FaqAccordion() {
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const sectionRef = React.useRef<HTMLElement>(null);
  const hasAnimated = React.useRef(false);

  React.useEffect(() => {
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
                  titleRef.current.style.transform = 'translateY(30px)';
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
    <section ref={sectionRef} id="faq" className="py-20 md:py-28 border-y border-[#FECC00]/30">
      <div className="container max-w-4xl">
        <div className="text-center">
          <h2 ref={titleRef} className="text-3xl font-bold uppercase tracking-wide text-white" style={{ opacity: 0 }}>
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="mt-6 text-lg text-white/70">
            For anything not covered here, join{" "}
            <a
              href="https://discord.gg/rzdnErX"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#FECC00] hover:text-white transition-all uppercase tracking-wide"
            >
              our Discord
            </a>
            !
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12 w-full">
          {faqItems.map((item) => (
            <AccordionItem value={item.value} key={item.value} className="border-b border-white/10">
              <AccordionTrigger className="py-6 hover:no-underline">
                <span className="text-left text-base font-bold uppercase tracking-wide text-white">
                  {item.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-6 pr-8">
                <div className="space-y-4 text-sm text-white/70">
                  {item.answer.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}