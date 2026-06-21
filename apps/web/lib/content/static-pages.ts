import type { Metadata } from "next";

export type StaticPageSlug =
  | "about"
  | "careers"
  | "press"
  | "help"
  | "contact"
  | "faq"
  | "privacy"
  | "terms";

export interface StaticPageSection {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface StaticPageContent {
  slug: StaticPageSlug;
  title: string;
  description: string;
  intro?: string;
  sections: StaticPageSection[];
  contactEmail?: string;
  faq?: { question: string; answer: string }[];
}

export const STATIC_PAGES: Record<StaticPageSlug, StaticPageContent> = {
  about: {
    slug: "about",
    title: "About FADEN",
    description: "Learn how FADEN connects customers with trusted boutiques for custom fashion.",
    intro:
      "FADEN is a discovery and ordering platform for bespoke fashion — helping you find verified boutiques, customize outfits, and follow your order from first thread to final fitting.",
    sections: [
      {
        heading: "Our mission",
        paragraphs: [
          "We believe custom fashion should feel as effortless as browsing ready-to-wear. FADEN brings transparency, trust, and tools to the boutique experience — for customers who want something made for them, and for studios who craft it.",
        ],
      },
      {
        heading: "What we offer",
        bullets: [
          "Discover boutiques by location, outfit type, and audience (Women, Men, Kids)",
          "Customize requests with references, measurements, and delivery timelines",
          "Direct ordering from portfolio designs with size and length details",
          "Messaging, quotations, and order tracking in one place",
        ],
        paragraphs: [],
      },
      {
        heading: "For boutiques",
        paragraphs: [
          "Verified boutique partners can showcase portfolios, respond to customization requests, and manage orders through the FADEN owner dashboard. Interested in joining? Start with Register Boutique from the main menu.",
        ],
      },
    ],
  },
  careers: {
    slug: "careers",
    title: "Careers at FADEN",
    description: "Join the team building the future of custom fashion in India.",
    intro: "We're a small team obsessed with craft, trust, and great product. If that sounds like you, we'd love to hear from you.",
    sections: [
      {
        heading: "How we work",
        paragraphs: [
          "We work remotely across India with async collaboration, clear ownership, and a bias toward shipping useful product for real customers and boutique partners.",
        ],
      },
      {
        heading: "Open roles",
        paragraphs: [
          "We don't have public listings at every moment — but we're always interested in engineers, designers, and operations talent who care about marketplaces and fashion tech.",
        ],
        bullets: [
          "Product & full-stack engineering",
          "Design (brand, product, motion)",
          "Boutique partnerships & operations",
        ],
      },
      {
        heading: "Apply",
        paragraphs: [
          "Send your résumé, portfolio, or a short note about what you'd like to build with us to careers@faden.in. We'll respond when there's a strong fit.",
        ],
      },
    ],
    contactEmail: "careers@faden.in",
  },
  press: {
    slug: "press",
    title: "Press",
    description: "Media resources and contact for FADEN.",
    intro: "For press inquiries, brand assets, and founder interviews, reach out to our communications team.",
    sections: [
      {
        heading: "About FADEN",
        paragraphs: [
          "FADEN connects customers with verified custom-fashion boutiques across India — from discovery and customization to order and delivery. Tagline: It All Starts With a Thread.",
        ],
      },
      {
        heading: "Media contact",
        paragraphs: [
          "Email press@faden.in with your outlet, deadline, and topic. We aim to respond within two business days.",
        ],
      },
      {
        heading: "Brand usage",
        paragraphs: [
          "Please request approval before using the FADEN name or logo in published materials. We'll share guidelines and assets on request.",
        ],
      },
    ],
    contactEmail: "press@faden.in",
  },
  help: {
    slug: "help",
    title: "Help Center",
    description: "Get help using FADEN — discovery, customize, orders, and account.",
    intro: "Quick answers to common questions. For anything else, visit Contact or browse the FAQ.",
    sections: [
      {
        heading: "Getting started",
        bullets: [
          "Set your location in the header to see nearby boutiques and distances",
          "Browse Featured Boutiques or use Search by outfit type, fabric, or boutique name",
          "Open a boutique profile to explore categories, designs, and reviews",
        ],
        paragraphs: [],
      },
      {
        heading: "Customize & order",
        bullets: [
          "Use Customize Outfit to submit a request with outfit type, fabric, and timeline",
          "From an outfit detail page, Order this outfit sends size and length specs with your request",
          "Track requests and orders under Account when signed in",
        ],
        paragraphs: [],
      },
      {
        heading: "Wishlist & cart",
        bullets: [
          "Save boutiques or designs with the heart (wishlist) or bag (cart) icons",
          "Guests: saved locally; signed-in users: synced to your account",
        ],
        paragraphs: [],
      },
      {
        heading: "Still stuck?",
        paragraphs: ["Visit the FAQ for more detail, or contact us — we're happy to help."],
      },
    ],
  },
  contact: {
    slug: "contact",
    title: "Contact Us",
    description: "Get in touch with the FADEN team.",
    intro: "Questions about your order, account, or partnering as a boutique? We're here to help.",
    sections: [
      {
        heading: "Customer support",
        paragraphs: [
          "For order status, customization requests, or account issues, email hello@faden.in. Include your registered email and any request or order reference if you have one.",
        ],
      },
      {
        heading: "Boutique partners",
        paragraphs: [
          "Existing partners: use your owner dashboard for day-to-day operations. For onboarding or verification questions, email partners@faden.in.",
        ],
      },
      {
        heading: "Response time",
        paragraphs: [
          "We typically respond within one to two business days. Urgent delivery issues are prioritized when marked in the subject line.",
        ],
      },
    ],
    contactEmail: "hello@faden.in",
  },
  faq: {
    slug: "faq",
    title: "FAQ",
    description: "Frequently asked questions about FADEN.",
    intro: "Answers to the questions we hear most often from customers and boutique partners.",
    sections: [],
    faq: [
      {
        question: "What is FADEN?",
        answer:
          "FADEN is a platform to discover verified custom-fashion boutiques, submit customization requests, order from portfolio designs, and track your journey from inquiry to delivery.",
      },
      {
        question: "Do I need an account to browse?",
        answer:
          "No — you can explore boutiques, search, and save items locally as a guest. Sign in to sync your wishlist and cart, and to manage requests and orders.",
      },
      {
        question: "How do I customize an outfit?",
        answer:
          "Go to Customize Outfit from the homepage or boutique profile. Choose Women, Men, or Kids, pick an outfit type, add fabric and delivery preferences, and submit. Matching boutiques can respond with quotations.",
      },
      {
        question: "Can I order the same outfit shown in a boutique gallery?",
        answer:
          "Yes. Open the outfit detail page and use Order this outfit. Size and length specifications from that piece are included with your request.",
      },
      {
        question: "How are boutiques verified?",
        answer:
          "Boutiques apply through Register Boutique, submit business and portfolio details, and are reviewed before appearing as verified in discovery.",
      },
      {
        question: "How does location affect featured boutiques?",
        answer:
          "Featured boutiques prioritize high ratings near you (within 25 km when location is set). Update your location in the header for accurate distances.",
      },
      {
        question: "Is my payment handled on FADEN?",
        answer:
          "Payment flows depend on the boutique and order stage. Check Account → Payments for saved methods and history when available for your order.",
      },
      {
        question: "How do I delete my data?",
        answer:
          "Contact hello@faden.in from your registered email with a privacy request. See our Privacy Policy for full details.",
      },
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    description: "How FADEN collects, uses, and protects your information.",
    intro: "Last updated: June 2026. This policy describes how FADEN Labs handles personal information when you use our website and services.",
    sections: [
      {
        heading: "Information we collect",
        bullets: [
          "Account details: name, email, and profile information when you register",
          "Location: city or map pin you choose for boutique discovery",
          "Order & customization data: measurements, preferences, messages, and uploaded references",
          "Usage data: pages visited, searches, and device/browser information for security and improvement",
        ],
        paragraphs: [],
      },
      {
        heading: "How we use information",
        bullets: [
          "Provide discovery, customization, ordering, and account features",
          "Connect you with boutiques and facilitate quotations and fulfillment",
          "Improve product performance and prevent fraud or abuse",
          "Send service-related communications (you can opt out of marketing where applicable)",
        ],
        paragraphs: [],
      },
      {
        heading: "Sharing",
        paragraphs: [
          "We share relevant request and order information with boutiques you choose to engage with. We use infrastructure providers (e.g. hosting, authentication, payments) under appropriate agreements. We do not sell your personal information.",
        ],
      },
      {
        heading: "Retention & security",
        paragraphs: [
          "We retain data as long as needed to provide services and meet legal obligations. We apply industry-standard safeguards; no system is 100% secure, so please use a strong password and protect your account.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "You may access, correct, or request deletion of your account data by contacting hello@faden.in. Indian users may have additional rights under applicable law.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: ["Privacy questions: privacy@faden.in"],
      },
    ],
    contactEmail: "privacy@faden.in",
  },
  terms: {
    slug: "terms",
    title: "Terms of Service",
    description: "Terms governing use of the FADEN platform.",
    intro: "Last updated: June 2026. By using FADEN, you agree to these terms.",
    sections: [
      {
        heading: "The service",
        paragraphs: [
          "FADEN provides a marketplace-style platform connecting customers with independent boutiques. We facilitate discovery, messaging, and order workflows; individual boutiques are responsible for production, pricing, delivery timelines, and garment quality unless otherwise stated in a specific agreement.",
        ],
      },
      {
        heading: "Accounts",
        paragraphs: [
          "You must provide accurate information and keep credentials secure. You are responsible for activity under your account. We may suspend accounts that violate these terms or harm other users or partners.",
        ],
      },
      {
        heading: "Orders & payments",
        paragraphs: [
          "Quotations, deposits, and final payments are governed by agreements between you and the boutique, plus any payment terms shown at checkout. Disputes about fit, fabric, or delivery should first be raised with the boutique through FADEN messaging when possible.",
        ],
      },
      {
        heading: "Content",
        paragraphs: [
          "You retain rights to content you upload. You grant FADEN a license to display and transmit that content to operate the service (e.g. sharing reference images with a boutique). Do not upload unlawful or infringing material.",
        ],
      },
      {
        heading: "Boutique partners",
        paragraphs: [
          "Boutiques must provide accurate business information, honor quoted timelines where feasible, and comply with applicable consumer and tax laws. FADEN may remove boutiques that receive sustained complaints or fail verification standards.",
        ],
      },
      {
        heading: "Disclaimer",
        paragraphs: [
          'The service is provided "as is" to the extent permitted by law. FADEN is not liable for indirect damages arising from boutique performance, third-party services, or events outside our reasonable control.',
        ],
      },
      {
        heading: "Changes",
        paragraphs: [
          "We may update these terms. Continued use after changes constitutes acceptance. Material changes will be noted on this page.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: ["Legal inquiries: legal@faden.in"],
      },
    ],
    contactEmail: "legal@faden.in",
  },
};

export function getStaticPage(slug: StaticPageSlug): StaticPageContent {
  return STATIC_PAGES[slug];
}

export function staticPageMetadata(slug: StaticPageSlug): Metadata {
  const page = STATIC_PAGES[slug];
  return {
    title: `${page.title} — FADEN`,
    description: page.description,
  };
}

export function staticPageHref(label: string): string {
  return `/${label.toLowerCase()}`;
}

export const FOOTER_LINKS = {
  Company: ["About", "Careers", "Press"],
  Support: ["Help", "Contact", "FAQ"],
  Legal: ["Privacy", "Terms"],
} as const;
