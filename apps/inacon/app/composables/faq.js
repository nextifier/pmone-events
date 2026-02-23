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
            <p>Ticket prices vary depending on the ticket type (one-day pass, full event pass, VIP, etc.) and promotional period. Please visit our <a href="/ticket">Ticket page</a> for the most up-to-date pricing. Don't miss our early bird promotions!</p>
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
            <p>Please bring your e-ticket (digital or printed) to be exchanged for a badge or wristband at the registration counter. Don't forget to bring your camera for photos with cosplayers and at photo spots!</p>
          `,
        },
        {
          q: "Is cosplay allowed at the event?",
          a: `
            <p>Absolutely! Cosplay is highly encouraged and welcomed. We love seeing creative costumes from your favorite characters. Please note that prop weapons must be peace-bonded and approved by security. Check our <a href="/event-policy">Event Policy</a> for cosplay guidelines.</p>
          `,
        },
        {
          q: "Will there be cosplay competitions?",
          a: `
            <p>Yes! We organize cosplay competitions with exciting prizes. Check our <a href="/rundown">Rundown page</a> for competition schedules, registration deadlines, and categories.</p>
          `,
        },
        {
          q: "Who can attend the event?",
          a: `
            <p>Everyone is welcome! Whether you're a hardcore fan, casual enthusiast, collector, artist, or just curious about pop culture, anime, comics, and gaming, there's something for everyone at our event!</p>
          `,
        },
        {
          q: "What can I expect to find at the event?",
          a: `
            <p>You'll find merchandise booths, artist alleys, gaming zones, photo opportunities, stage performances, meet & greets with special guests, cosplay competitions, and much more! Check our <a href="/brands">Exhibitors page</a> for the full list.</p>
          `,
        },
        {
          q: "Will there be special guests or celebrity appearances?",
          a: `
            <p>Yes! We invite special guests including voice actors, artists, content creators, and industry professionals. Guest announcements will be made on our social media and <a href="/news">News page</a>. Stay tuned!</p>
          `,
        },
        {
          q: "How can I become an exhibitor or artist?",
          a: `
            <p>To become an exhibitor or apply for the Artist Alley, please visit our <a href="/book-space">Registration page</a> or contact our team via <a href="${whatsappLink}" target="_blank">WhatsApp</a> for more information.</p>
          `,
        },
        {
          q: "Are there age restrictions for the event?",
          a: `
            <p>The event is family-friendly and open to all ages. Children under a certain age may enter free when accompanied by a paying adult. Please check our <a href="/ticket">Ticket page</a> for specific age policies.</p>
          `,
        },
        {
          q: "Is there parking available at the venue?",
          a: `
            <p>Yes, the venue provides parking facilities. However, we recommend arriving early as parking spaces fill up quickly, especially on weekends. Consider using public transportation or ride-sharing services.</p>
          `,
        },
        {
          q: "Can I take photos or videos at the event?",
          a: `
            <p>Personal photography and video recording are allowed and encouraged! Please be respectful when photographing cosplayers and always ask for permission. Professional or commercial recording requires written permission from the organizer.</p>
          `,
        },
        {
          q: "How can I stay updated about the event?",
          a: `
            <p>Follow us on Instagram <a href="https://www.instagram.com/${instagram}" target="_blank">@${instagram}</a> for the latest updates, guest announcements, and exclusive content. You can also check our <a href="/news">News page</a>.</p>
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
            <p>Visit our <a href="/help-center">Help Center</a> for more contact options.</p>
          `,
        },
      ],
    };
  },
});
