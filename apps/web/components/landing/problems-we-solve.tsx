"use client";

import { motion, useReducedMotion } from "framer-motion";

const CUSTOMER_PROBLEMS = [
  "Find reliable boutiques",
  "Compare boutiques easily",
  "See genuine reviews",
  "Know realistic pricing",
  "Trust delivery timelines",
  "Manage custom orders",
  "Track progress on their garments",
];

const CUSTOMER_SOLUTIONS = [
  "Boutique discovery",
  "Verified reviews",
  "Portfolio browsing",
  "Price transparency",
  "Custom order management",
  "Delivery tracking",
];

const BOUTIQUE_PROBLEMS = [
  "Getting new customers",
  "Being discovered online",
  "Managing inquiries",
  "Handling custom orders through WhatsApp",
  "Tracking measurements and designs",
  "Building trust with new customers",
];

const BOUTIQUE_SOLUTIONS = [
  "Customer acquisition",
  "Online visibility",
  "Digital portfolio showcase",
  "Order management system",
  "Review and reputation building",
  "Business analytics",
];

function ProblemBox({
  title,
  intro,
  items,
  variant,
  delay,
}: {
  title: string;
  intro: string;
  items: string[];
  variant: "problem" | "solution";
  delay: number;
}) {
  const reducedMotion = useReducedMotion();
  const isProblem = variant === "problem";

  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={
        isProblem
          ? "rounded-xl border border-navy/15 bg-navy/5 p-8 md:p-9"
          : "rounded-xl border border-gold/35 bg-background-elevated p-8 shadow-sm md:p-9"
      }
    >
      <span
        className={`inline-block rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.2em] ${
          isProblem ? "bg-navy/10 text-navy" : "bg-gold/10 text-gold"
        }`}
      >
        {isProblem ? "PROBLEM" : "SOLUTION"}
      </span>
      <h3 className="mt-4 font-display text-xl font-semibold text-foreground md:text-2xl">{title}</h3>
      <p className={`mt-3 text-[15px] font-medium ${isProblem ? "text-foreground-muted" : "text-gold"}`}>
        {intro}
      </p>
      <ul className="mt-5 space-y-2.5">
        {items.map((item) => (
          <li
            key={item}
            className={`border-l-2 pl-3 text-[15px] leading-relaxed ${
              isProblem
                ? "border-navy/20 text-foreground-muted"
                : "border-gold/50 text-foreground"
            }`}
          >
            {item}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

export function ProblemsWeSolve() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="border-t border-border px-4 py-section-gap">
      <div className="mx-auto max-w-container">
        <motion.h2
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center font-display text-3xl font-semibold md:text-4xl"
        >
          Problems FADEN <span className="faden-trust-gradient">Solves</span>
        </motion.h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:gap-8">
          <ProblemBox
            title="For Customers"
            intro="Today customers struggle to:"
            items={CUSTOMER_PROBLEMS}
            variant="problem"
            delay={0}
          />
          <ProblemBox
            title="For Customers"
            intro="FADEN solves this by providing:"
            items={CUSTOMER_SOLUTIONS}
            variant="solution"
            delay={0.08}
          />
          <ProblemBox
            title="For Boutiques"
            intro="Today boutiques struggle with:"
            items={BOUTIQUE_PROBLEMS}
            variant="problem"
            delay={0.16}
          />
          <ProblemBox
            title="For Boutiques"
            intro="FADEN solves this by providing:"
            items={BOUTIQUE_SOLUTIONS}
            variant="solution"
            delay={0.24}
          />
        </div>
      </div>
    </section>
  );
}
