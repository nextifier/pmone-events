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
            <p>Ticket prices vary depending on the ticket type and promotional period. Please visit our <a href="/ticket">Ticket page</a> for the most up-to-date pricing information. Don't miss our early bird and pre-sale promotions!</p>
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
            <p>Please bring your e-ticket (digital or printed) to be exchanged for a badge at the registration counter. We recommend bringing business cards if you're looking to connect with vendors for corporate events or group activities.</p>
          `,
        },
        {
          q: "Who can attend the event?",
          a: `
            <p>The event is open to everyone! Whether you're an HR professional, event organizer, company representative looking for team building activities, travel enthusiast, or outing service provider, you're welcome to attend!</p>
          `,
        },
        {
          q: "What services and destinations will be showcased?",
          a: `
            <p>You'll discover a variety of outing destinations, team building activities, corporate event venues, travel packages, outdoor adventures, resorts, and unique group experiences. Visit our <a href="/brands">Exhibitors page</a> for the full list.</p>
          `,
        },
        {
          q: "Can I book services directly at the event?",
          a: `
            <p>Yes! Many exhibitors offer exclusive event promotions and allow on-site bookings. This is a great opportunity to find deals on corporate outings, team building packages, and group travel directly from providers.</p>
          `,
        },
        {
          q: "How can I become an exhibitor?",
          a: `
            <p>To showcase your outing services, venues, or travel packages, please visit our <a href="/book-space">Exhibitor Registration page</a> or contact our team via <a href="${whatsappLink}" target="_blank">WhatsApp</a> for booth information.</p>
          `,
        },
        {
          q: "Are there any seminars or presentations at the event?",
          a: `
            <p>Yes! We organize seminars and presentations covering topics like effective team building, corporate event planning, trending outing destinations, and employee engagement activities. Check our <a href="/rundown">Rundown page</a> for the schedule.</p>
          `,
        },
        {
          q: "Is this event suitable for finding team building activities?",
          a: `
            <p>Absolutely! This is the perfect place to discover team building providers, compare packages, and find unique activities for your company's outing. Meet vendors face-to-face and discuss your specific needs.</p>
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
            <p>Follow us on Instagram <a href="https://www.instagram.com/${instagram}" target="_blank">@${instagram}</a> for the latest updates, exhibitor announcements, and exclusive content. You can also check our <a href="/news">News page</a>.</p>
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
