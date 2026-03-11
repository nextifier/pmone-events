import { defineStore } from 'pinia'

export const useFAQStore = defineStore("faq", {
  state: () => {
    const config = useAppConfig();
    const localePath = useLocalePath();
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
            <p>You can get your tickets through our official website. Simply click the <a href="${localePath('/ticket')}">Get Ticket</a> button and follow the registration process. E-tickets will be sent to your email and WhatsApp after purchase.</p>
          `,
        },
        {
          q: "How much does a ticket cost?",
          a: `
            <p>Ticket prices vary depending on the ticket type and promotional period. Please visit our <a href="${localePath('/ticket')}">Ticket page</a> for the most up-to-date pricing information. Don't miss our early bird and pre-sale promotions!</p>
          `,
        },
        {
          q: "Can I get a refund if I can't attend?",
          a: `
            <p>All ticket sales are final. There are no refunds or exchanges once a ticket has been purchased. Please review our <a href="${localePath('/ticket-refund-and-return-policy')}">Ticket Refund and Return Policy</a> for more details.</p>
          `,
        },
        {
          q: "What should I bring to the event?",
          a: `
            <p>Please bring your e-ticket (digital or printed) to be exchanged for a badge or wristband at the registration counter. We recommend bringing business cards for networking with suppliers and contractors.</p>
          `,
        },
        {
          q: "Who can attend the event?",
          a: `
            <p>The event is open to everyone! Whether you're a homeowner planning a renovation, architect, interior designer, contractor, property developer, or building materials supplier, you're welcome to attend!</p>
          `,
        },
        {
          q: "What products and services will be showcased?",
          a: `
            <p>You'll find a wide range of building materials, home improvement products, construction equipment, interior design solutions, furniture, sanitary ware, flooring, roofing, and much more. Visit our <a href="${localePath('/brands')}">Brands page</a> for the exhibitor list.</p>
          `,
        },
        {
          q: "Can I get special prices or discounts at the event?",
          a: `
            <p>Yes! Many exhibitors offer exclusive event-only discounts and promotions. This is a great opportunity to find deals on building materials and home improvement products directly from suppliers.</p>
          `,
        },
        {
          q: "How can I become an exhibitor?",
          a: `
            <p>To showcase your products or services at our event, please visit our <a href="${localePath('/book-space')}">Exhibitor Registration page</a> or contact our team via <a href="${whatsappLink}" target="_blank">WhatsApp</a> for booth packages and availability.</p>
          `,
        },
        {
          q: "Are there any seminars or workshops at the event?",
          a: `
            <p>Yes! We organize seminars and workshops covering topics like interior design trends, sustainable building, renovation tips, and industry insights. Check our <a href="${localePath('/rundown')}">Rundown page</a> for the complete schedule.</p>
          `,
        },
        {
          q: "Can I consult with professionals at the event?",
          a: `
            <p>Absolutely! Many exhibitors have professionals available to provide consultation on your building, renovation, or interior design projects. It's a great opportunity to get expert advice and compare solutions.</p>
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
            <p>Personal photography and video recording for non-commercial purposes are allowed. However, professional or commercial recording requires written permission from the organizer. Please refer to our <a href="${localePath('/event-policy')}">Event Policy</a> for more details.</p>
          `,
        },
        {
          q: "How can I stay updated about the event?",
          a: `
            <p>Follow us on Instagram <a href="https://www.instagram.com/${instagram}" target="_blank">@${instagram}</a> for the latest updates, exhibitor announcements, and exclusive content. You can also check our <a href="${localePath('/news')}">News page</a>.</p>
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
            <p>Visit our <a href="${localePath('/help-center')}">Help Center</a> for more contact options and quick links to useful information.</p>
          `,
        },
      ],
    };
  },
});
