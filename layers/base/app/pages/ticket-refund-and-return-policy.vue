<template>
  <div class="pt-6 pb-16 lg:pt-10 lg:pb-24">
    <div class="container">
      <div class="format-html mx-auto">
        <h1>Ticket Refund and Return Policy</h1>

        <p>Last updated: {{ lastUpdate }}</p>

        <p>
          This Ticket Refund and Return Policy outlines the terms regarding
          refunds and returns for tickets purchased for {{ eventTitle }}. Please
          read this policy carefully before making your purchase.
        </p>

        <h2>No Refund Policy</h2>
        <p>
          <strong>All ticket sales are final.</strong> Once a ticket has been
          purchased, no refunds will be issued under any circumstances,
          including but not limited to:
        </p>
        <ul>
          <li>Change of personal plans or schedule conflicts</li>
          <li>Inability to attend the event</li>
          <li>Duplicate ticket purchases</li>
          <li>Purchasing the wrong ticket type or quantity</li>
          <li>Travel or accommodation issues</li>
          <li>Health-related reasons</li>
        </ul>

        <h2>No Exchange Policy</h2>
        <p>
          Tickets cannot be exchanged for other dates, events, or ticket types.
          Please ensure you select the correct ticket type and verify all
          details before completing your purchase.
        </p>

        <h2>No Transfer Policy</h2>
        <p>
          Tickets are non-transferable and may not be resold. The original
          purchaser's name will be registered with the ticket, and valid
          identification may be required at the venue for entry.
        </p>

        <h2>Event Cancellation</h2>
        <p>
          In the unlikely event that the event is cancelled entirely by the
          organizer (not postponed or rescheduled), ticket holders may be
          eligible for a refund or credit at the organizer's discretion.
          Notification will be provided through the contact information supplied
          during ticket purchase.
        </p>

        <h2>Event Postponement or Rescheduling</h2>
        <p>
          If the event is postponed or rescheduled to a different date, tickets
          will remain valid for the new date. No refunds will be issued for
          postponed or rescheduled events.
        </p>

        <h2>Force Majeure</h2>
        <p>
          In case of force majeure events (including but not limited to natural
          disasters, pandemics, government regulations, or other circumstances
          beyond the organizer's control), the organizer reserves the right to
          modify, postpone, or cancel the event. Refund eligibility in such
          cases will be determined at the organizer's sole discretion.
        </p>

        <h2>Chargebacks and Disputes</h2>
        <p>
          Initiating a chargeback or payment dispute for a valid ticket purchase
          is a violation of this policy. Any ticket holder who initiates a
          chargeback may have their ticket cancelled and be denied entry to the
          event.
        </p>

        <h2>Before You Purchase</h2>
        <p>We encourage all ticket buyers to:</p>
        <ul>
          <li>Carefully review event details including date, time, and venue</li>
          <li>Verify ticket type and quantity before completing purchase</li>
          <li>Ensure availability to attend on the scheduled date</li>
          <li>Read all terms and conditions thoroughly</li>
          <li>
            Contact us with any questions
            <strong>before</strong> making a purchase
          </li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Refund and Return Policy, please
          contact us before making your purchase:
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

        <p>
          For more information about ticket usage and rules, please refer to our
          <nuxt-link to="/ticket-terms-and-conditions"
            >Ticket Terms and Conditions</nuxt-link
          >.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
usePageMeta(null, {
  title: "Ticket Refund and Return Policy",
  description:
    "Understand our ticket refund and return policy. All ticket sales are final with no refunds or exchanges.",
});

const config = useAppConfig();
const eventTitle = config.event.title;
const email = config.contact.email;
const whatsapp = config.contact.whatsapp;
const whatsappLink = `https://api.whatsapp.com/send?phone=${whatsapp}`;
const whatsappDisplay = `+${whatsapp.slice(0, 2)} ${whatsapp.slice(2, 5)}-${whatsapp.slice(5, 9)}-${whatsapp.slice(9)}`;
const lastUpdate = config.settings.terms.lastUpdate;
</script>
