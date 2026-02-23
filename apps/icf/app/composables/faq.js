import { defineStore } from "pinia";

export const useFAQStore = defineStore("faq", {
  state: () => {
    const config = useAppConfig();
    const eventTitle = config.event.title;
    const eventDate = config.event.date;
    const eventTime = config.event.time;
    const eventLocation = config.event.location;
    const locationLink = config.event.locationLink;
    const whatsapp = config.contact.whatsapp;
    const whatsappLink = `https://wa.me/${whatsapp}`;
    const email = config.contact.email;
    const instagram = config.social.instagram;

    return {
      list: [
        {
          q: `When and where will ${eventTitle} take place?`,
          a: `
            <p>${eventTitle} will be held on <strong>${eventDate}</strong>, from <strong>${eventTime}</strong>, at <a href="${locationLink}" target="_blank">${eventLocation}</a>.</p>
          `,
        },
        {
          q: "How do I get tickets to attend the event?",
          a: `
            <p>You can get your tickets through our official website. Simply click the <a href="/ticket">Get Ticket</a> button and follow the registration process. E-tickets will be sent to your email and WhatsApp after purchase.</p>
          `,
        },
        {
          q: "How much does a ticket cost?",
          a: `
            <p>Ticket prices vary depending on the ticket type and promotional period. Please visit our <a href="/ticket">Ticket page</a> for the most up-to-date pricing information. Don't miss our early bird and pre-sale promotions for special discounts!</p>
          `,
        },
        {
          q: "Can I get a refund if I can't attend?",
          a: `
            <p>All ticket sales are final. There are no refunds or exchanges once a ticket has been purchased. Please review our <a href="/ticket-refund-and-return-policy">Ticket Refund and Return Policy</a> for more details.</p>
          `,
        },
        {
          q: "What should I bring to the event?",
          a: `
            <p>Please bring your e-ticket (digital or printed) to be exchanged for a badge or wristband at the registration counter. We also recommend bringing business cards if you plan to network with exhibitors and other attendees.</p>
          `,
        },
        {
          q: "Who can attend the event?",
          a: `
            <p>The event is open to everyone! Whether you're a cafe owner, F&B entrepreneur, coffee enthusiast, food industry professional, or simply someone who loves exploring culinary trends, you're welcome to attend!</p>
          `,
        },
        {
          q: "What brands and products will be showcased at the event?",
          a: `
            <p>We feature a diverse range of F&B brands, equipment suppliers, ingredient providers, and service companies. From coffee machines and cafe furniture to food ingredients and packaging solutions. You can view the list of exhibitors on our <a href="/brands">Brands page</a>.</p>
          `,
        },
        {
          q: "How can I become an exhibitor?",
          a: `
            <p>To become an exhibitor and showcase your F&B products or services, please visit our <a href="/book-space">Exhibitor Registration page</a> or contact our team via <a href="${whatsappLink}" target="_blank">WhatsApp</a> for more information about booth packages and availability.</p>
          `,
        },
        {
          q: "Will there be product sampling or tasting sessions?",
          a: `
            <p>Yes! Many exhibitors offer product sampling and tasting sessions at their booths. This is a great opportunity to discover new products, ingredients, and flavors for your business or personal enjoyment.</p>
          `,
        },
        {
          q: "Are there any seminars or workshops at the event?",
          a: `
            <p>Yes! We organize various seminars, workshops, and demo sessions covering topics like brewing techniques, food trends, business strategies, and industry insights. Check our <a href="/rundown">Rundown page</a> for the complete schedule.</p>
          `,
        },
        {
          q: "How can I become a sponsor or media partner?",
          a: `
            <p>We welcome sponsorship and media partnership opportunities. Please contact us via <a href="${whatsappLink}" target="_blank">WhatsApp</a> or <a href="mailto:${email}">email</a> to discuss partnership packages.</p>
          `,
        },
        {
          q: "Is there parking available at the venue?",
          a: `
            <p>Yes, the venue provides parking facilities. However, we recommend arriving early as parking spaces may fill up quickly during peak hours. You may also consider using public transportation or ride-sharing services.</p>
          `,
        },
        {
          q: "Can I take photos or videos at the event?",
          a: `
            <p>Personal photography and video recording for non-commercial purposes are allowed. However, professional or commercial recording requires written permission from the organizer. Please refer to our <a href="/event-policy">Event Policy</a> for more details.</p>
          `,
        },
        {
          q: "How can I stay updated about the event?",
          a: `
            <p>Follow us on Instagram <a href="https://www.instagram.com/${instagram}" target="_blank">@${instagram}</a> for the latest updates, announcements, and exclusive content. You can also check our <a href="/news">News page</a> for articles and updates.</p>
          `,
        },
        {
          q: "How do I contact the organizer?",
          a: `
            <p>You can reach us through:</p>
            <ul>
              <li>WhatsApp: <a href="${whatsappLink}" target="_blank">Click here to chat</a></li>
              <li>Email: <a href="mailto:${email}">${email}</a></li>
            </ul>
            <p>Visit our <a href="/help-center">Help Center</a> for more contact options and quick links to useful information.</p>
          `,
        },
      ],
    };
  },
});
