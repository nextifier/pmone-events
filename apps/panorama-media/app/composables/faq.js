import { defineStore } from "pinia";

export const useFAQStore = defineStore("faq", {
  state: () => ({
    categories: [
      {
        id: "general",
        name: "General",
        faqs: [
          {
            q: "What is Panorama Media?",
            a: "Panorama Media is an integrated event solutions company under the Panorama Group. We organize exhibitions, festivals, corporate events, and live entertainment across Indonesia. Our portfolio includes trade expos like Megabuild Indonesia and FLEI, pop culture events like Indonesia Comic Con, and corporate event services through Panorama Events.",
          },
          {
            q: "What types of events does Panorama Media organize?",
            a: "We organize four main types: (1) Trade exhibitions covering construction, ceramics, franchise, F&B, and halal food industries, (2) Pop culture events including Indonesia Comic Con and Indonesia Anime Con, (3) Corporate events like team building, conferences, and gala dinners through Panorama Events, and (4) Live entertainment including concerts and festivals through Panorama Live.",
          },
          {
            q: "How many brands does Panorama Media have?",
            a: "We have 13 brands: Panorama Events, Panorama Live, Megabuild Indonesia, Keramika Indonesia, Franchise & License Expo Indonesia (FLEI), Cafe & Brasserie Expo (CBE), Indonesia Coffee Festival (ICF), Cokelat Expo Indonesia, Indonesia Comic Con (ICC), Indonesia Anime Con (INACON), Indonesia Outing & Incentive Travel Expo (IOITE), Renovation Expo (RENEX), and More Food Expo.",
          },
          {
            q: "Where are Panorama Media events held?",
            a: "Most of our events are held in Jakarta at venues like Jakarta Convention Center (JCC), JIExpo Kemayoran, and Nusantara International Convention Exhibition (NICE) at PIK 2. Some events like Megabuild East Indonesia are held in Surabaya.",
          },
          {
            q: "How can I stay updated on upcoming events?",
            a: "Follow our social media accounts for each brand, subscribe to our newsletter, or check the Events page on our website regularly. Each brand also has its own website with detailed event information.",
          },
        ],
      },
      {
        id: "exhibitors",
        name: "For Exhibitors & Partners",
        faqs: [
          {
            q: "How do I become an exhibitor at Panorama Media events?",
            a: "Contact our sales team through the specific brand's website or email. For trade expos like Megabuild, FLEI, or CBE, you can inquire about booth packages, pricing, and availability. We'll send you a proposal with booth options, floor plans, and participation details.",
          },
          {
            q: "What booth sizes are available?",
            a: "Booth sizes vary by event. For most trade expos, the minimum booth size is 9-18 sqm. We offer shell scheme booths (basic setup included) and raw space options for custom builds. Contact the specific event's sales team for detailed booth packages.",
          },
          {
            q: "What's included in a standard booth package?",
            a: "Standard shell scheme booths typically include: booth partition walls, fascia board with company name, basic lighting, power outlet, table and chairs, and listing in the event directory. Premium packages may include additional features like storage, meeting rooms, or corner positions.",
          },
          {
            q: "When is the deadline to register as an exhibitor?",
            a: "Registration deadlines vary by event, but we recommend booking at least 3-4 months before the event date to secure preferred booth locations. Early bird pricing is usually available for early registrations.",
          },
          {
            q: "Can I participate in multiple Panorama Media events?",
            a: "Yes. We offer package deals for exhibitors who want to participate in multiple events. For example, FLEI, CBE, and More Food Expo run concurrently with bundled exhibitor options.",
          },
          {
            q: "Do you offer business matching services?",
            a: "Yes. Most of our trade expos include 1-on-1 Business Matching programs that connect exhibitors with pre-qualified buyers, distributors, and potential partners. Our Hosted Buyer Program brings ASEAN buyers with accommodation provided.",
          },
          {
            q: "What marketing support do exhibitors receive?",
            a: "Exhibitors are included in event directories, website listings, and promotional materials. We also offer upgrade options like logo placement, sponsored sessions, Brand Talks appearances, and featured listings in our marketing campaigns.",
          },
        ],
      },
      {
        id: "sponsors",
        name: "For Sponsors",
        faqs: [
          {
            q: "What sponsorship opportunities are available?",
            a: "We offer various sponsorship tiers from Title Sponsor to Supporting Sponsor. Benefits include logo placement, booth space, speaking opportunities, brand activations, hospitality packages, and media coverage. Each event has customized sponsorship packages.",
          },
          {
            q: "Can I sponsor a specific program or area within an event?",
            a: "Yes. You can sponsor specific programs like conferences, competitions (e.g., barista championships, cosplay competitions), networking nights, workshops, or dedicated zones within the exhibition.",
          },
          {
            q: "What's the typical sponsorship investment?",
            a: "Sponsorship packages vary significantly based on the event and tier level. Contact our partnership team for a detailed proposal tailored to your brand objectives and budget.",
          },
          {
            q: "How early should I inquire about sponsorship?",
            a: "We recommend reaching out 6-8 months before the event for major sponsorships, as premium packages get booked early. However, supporting sponsorship opportunities may be available closer to the event date.",
          },
          {
            q: "Do you offer multi-event sponsorship packages?",
            a: "Yes. We can create annual or multi-event sponsorship packages across our portfolio of events. This provides consistent brand presence and typically offers better value than individual event sponsorships.",
          },
        ],
      },
      {
        id: "visitors",
        name: "For Visitors",
        faqs: [
          {
            q: "Are Panorama Media events open to the public?",
            a: "Most of our events welcome both trade visitors and the general public. Trade expos like Megabuild and FLEI are open to anyone interested, while pop culture events like Indonesia Comic Con are primarily consumer-focused.",
          },
          {
            q: "How much do tickets cost?",
            a: "Ticket pricing varies by event. Many trade expos offer free admission with online pre-registration. Pop culture events like Indonesia Comic Con have paid tickets ranging from general admission to VIP packages. Check each event's website for current pricing.",
          },
          {
            q: "Do I need to register in advance?",
            a: "Pre-registration is recommended for all events. For trade expos, pre-registration is usually required for free entry. For ticketed events, advance purchase often provides discounts compared to on-site pricing.",
          },
          {
            q: "What can I expect as a visitor at trade expos?",
            a: "You'll have access to exhibition halls with hundreds of brands, product demonstrations, industry conferences and seminars, networking opportunities, special promotions, and sometimes competitions or entertainment programs.",
          },
          {
            q: "Can I bring children to the events?",
            a: "Yes, most events are family-friendly. Pop culture events like Indonesia Comic Con welcome families, and trade expos like RENEX (Renovation Expo) are designed for homeowners including families. Check specific event guidelines for any age restrictions.",
          },
          {
            q: "Is there parking available at the venues?",
            a: "Yes, all our venue partners (JCC, JIExpo, NICE PIK 2) have parking facilities. Fees vary by venue. We recommend using public transportation or ride-sharing services during peak hours.",
          },
          {
            q: "What should I bring to Indonesia Comic Con or Anime Con?",
            a: "Bring your ticket (digital or printed), valid ID, comfortable shoes, and cash for merchandise. Cosplayers should review the costume and prop guidelines on the event website. Cameras are generally allowed for personal use.",
          },
        ],
      },
      {
        id: "corporate",
        name: "For Corporate Clients",
        faqs: [
          {
            q: "What corporate event services does Panorama Events offer?",
            a: "Panorama Events handles team building, corporate outings, conferences, seminars, gala dinners, award ceremonies, product launches, family days, and CSR programs. We provide end-to-end service from concept to execution.",
          },
          {
            q: "Can you organize events outside Jakarta?",
            a: "Yes. We organize corporate events across Indonesia, from Bali to Yogyakarta to Surabaya and beyond. Our nationwide network through the Panorama Group allows us to handle logistics anywhere in the country.",
          },
          {
            q: "How do you approach corporate event planning?",
            a: "We start by understanding your objectives, company culture, and desired outcomes. We design programs around your HR goals, not just entertainment. Every activity is purposeful and aligned with what you want your team to experience and take away.",
          },
          {
            q: "What's included in your corporate event packages?",
            a: "Full packages typically include: venue and hotel sourcing, program design, travel and transportation, on-site management, activities and entertainment, professional photography and videography, and budget management with transparent reporting.",
          },
          {
            q: "How far in advance should we book a corporate event?",
            a: "For smaller outings, 2-3 months is usually sufficient. For larger events, international destinations, or complex programs, we recommend 4-6 months or earlier to ensure availability and proper preparation.",
          },
          {
            q: "Do you handle virtual or hybrid corporate events?",
            a: "Yes. We can incorporate virtual elements into corporate events, including live streaming, virtual team activities, and hybrid meeting setups for teams with remote participants.",
          },
          {
            q: "What size groups can you accommodate?",
            a: "We handle groups of all sizes, from intimate executive retreats of 10-20 people to large company outings of 500+ participants. Our team scales resources according to your group size and requirements.",
          },
          {
            q: "Can you work within a specific budget?",
            a: "Absolutely. We customize programs to match your budget while maximizing impact. We're transparent about costs and help you prioritize elements that matter most for your objectives.",
          },
        ],
      },
      {
        id: "contact",
        name: "Contact & Support",
        faqs: [
          {
            q: "How do I contact Panorama Media?",
            a: "You can reach us through the Contact page on our website, or contact specific brands directly through their individual websites. Each brand has dedicated WhatsApp numbers for quick inquiries.",
          },
          {
            q: "What are your office hours?",
            a: "Our office operates Monday to Friday, 9:00 AM to 5:00 PM (Jakarta time). For urgent matters during events, on-site staff are available throughout event hours.",
          },
          {
            q: "How quickly can I expect a response to my inquiry?",
            a: "We aim to respond to all inquiries within 1-2 business days. For urgent exhibition or sponsorship inquiries close to event dates, please mention the urgency in your message or call our hotline directly.",
          },
          {
            q: "I have a complaint about an event. How do I submit it?",
            a: "We take feedback seriously. Please email your concerns to the relevant brand's contact email or use the general contact form on our website. Include your contact details, event attended, and specific details about your experience.",
          },
          {
            q: "Do you have a media or press contact?",
            a: "Yes. Media inquiries should be directed to our communications team. Visit the specific event website for media registration or contact us through the main website for press-related matters.",
          },
          {
            q: "Where can I find past event photos and recaps?",
            a: "Event galleries and recaps are available on each brand's website and social media channels. For press-quality images or official materials, contact our media team.",
          },
        ],
      },
    ],
  }),

  getters: {
    list: (state) => {
      return state.categories.flatMap((cat) => cat.faqs);
    },
    getAllFaqs: (state) => {
      return state.categories.flatMap((cat) => cat.faqs);
    },
    getCategoryById: (state) => (id) => {
      return state.categories.find((cat) => cat.id === id);
    },
  },
});
