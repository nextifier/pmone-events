<template>
  <div class="pt-6 pb-16 lg:pt-10 lg:pb-24">
    <div class="container">
      <div class="format-html mx-auto">
        <h1>Ticket Terms and Conditions</h1>

        <p>Last updated: {{ lastUpdate }}</p>

        <p>
          By purchasing a ticket for {{ eventTitle }}, you agree to the
          following terms and conditions. Please read them carefully before
          completing your purchase.
        </p>

        <h2>1. Ticket Validity</h2>
        <p>
          Tickets are valid only for the specified event, date, time, and venue.
          Please ensure you have verified all details before making your
          purchase.
        </p>

        <h2>2. E-Ticket Delivery</h2>
        <p>
          Your e-ticket will be delivered via email and WhatsApp to the contact
          information provided during purchase. Please ensure your contact
          details are accurate to receive your ticket confirmation.
        </p>

        <h2>3. Ticket Redemption</h2>
        <p>
          Tickets will be exchanged in the form of badges or wristbands at the
          venue upon redemption. Please present your e-ticket (digital or
          printed) at the registration counter.
        </p>

        <h2>4. No Refunds or Exchanges</h2>
        <p>
          All ticket sales are final. There are no refunds and no exchanges. We
          encourage you to review your order carefully before confirming your
          purchase. For more information, please refer to our
          <nuxt-link :to="localePath('/ticket-refund-and-return-policy')"
            >Ticket Refund and Return Policy</nuxt-link
          >.
        </p>

        <h2>5. Official Ticket Sales</h2>
        <p>
          We are only responsible for tickets that are purchased through our
          official ticket platform. Any tickets acquired from unauthorized
          sellers or secondary markets outside our official ticketing platform
          are done so at your own risk. We cannot guarantee the validity of
          tickets purchased from third parties.
        </p>

        <h2>6. Event Rules and Regulations</h2>
        <p>
          The ticket holder must follow the event rules and regulations,
          including codes of conduct or instructions provided by the organizer
          or venue staff. Failure to comply may result in removal from the event
          without refund. For more details, please refer to our
          <nuxt-link :to="localePath('/event-policy')">Event Policy</nuxt-link>.
        </p>

        <h2>7. Lost or Stolen Tickets</h2>
        <p>
          Lost and stolen tickets may not be replaced. Please keep your e-ticket
          secure and do not share it with others.
        </p>

        <h2>8. Protecting Your E-Ticket</h2>
        <p>
          Do not take photos or screenshots of online e-tickets and upload them
          to social media. This is to protect your ticket data from being copied
          or misused by others. Your e-ticket contains unique identifiers that
          should remain confidential.
        </p>

        <h2>9. Non-Transferable Use</h2>
        <p>
          Ticket holders must not allow their e-ticket or printed badges or
          wristbands to be used by anyone else. Any failure to comply is likely
          to lead to the ticket holder and the person using the e-ticket or
          printed badges or wristbands being removed from the event without
          refund.
        </p>

        <h2>10. Event Changes</h2>
        <p>
          The organizer reserves the right to make changes to the event program,
          schedule, or venue due to unforeseen circumstances.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about these Ticket Terms and Conditions, you
          can contact us:
        </p>
        <ul>
          <li>
            By email:
            <a :href="`mailto:${email}`">{{ email }}</a>
          </li>
          <li>
            By WhatsApp:
            <a :href="whatsappLink" target="_blank">{{ whatsappDisplay }}</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
usePageMeta(null, {
  title: "Ticket Terms and Conditions",
  description:
    "Read the ticket terms and conditions including ticket validity, e-ticket delivery, redemption process, and usage policies.",
});

const localePath = useLocalePath();
const config = useAppConfig();
const eventTitle = config.event.title;
const email = config.contact.email;
const whatsapp = config.contact.whatsapp;
const whatsappLink = `https://api.whatsapp.com/send?phone=${whatsapp}`;
const whatsappDisplay = `+${whatsapp.slice(0, 2)} ${whatsapp.slice(2, 5)}-${whatsapp.slice(5, 9)}-${whatsapp.slice(9)}`;
const lastUpdate = config.settings.terms.lastUpdate;
</script>
