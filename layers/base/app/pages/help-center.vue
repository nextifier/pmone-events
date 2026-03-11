<template>
  <div class="pt-6 pb-16 lg:pt-10 lg:pb-24">
    <div class="container">
      <div class="format-html mx-auto">
        <h1>Help Center</h1>

        <p>
          Welcome to the {{ eventTitle }} Help Center. We're here to assist you
          with any questions or concerns you may have. Choose from the options
          below to get the help you need.
        </p>

        <h2>Contact Us</h2>
        <p>
          Our support team is available to help you with ticketing inquiries,
          event information, and general questions.
        </p>

        <div class="not-prose my-8">
          <div class="grid gap-2.5 sm:grid-cols-2">
            <a
              :href="whatsappLink"
              target="_blank"
              class="border-border hover:border-foreground flex items-center justify-start gap-x-3 rounded-xl border px-6 py-4 transition-colors"
            >
              <div
                class="squircle flex size-12 shrink-0 items-center justify-center bg-linear-to-b from-green-500 to-green-600 text-white"
              >
                <Icon name="hugeicons:whatsapp" class="size-6" />
              </div>
              <div>
                <h4 class="text-foreground leading-tight! font-semibold">
                  WhatsApp
                </h4>
                <p class="text-muted-foreground mt-1 text-sm">
                  {{ whatsappDisplay }}
                </p>
              </div>
            </a>

            <a
              :href="`mailto:${email}`"
              class="border-border hover:border-foreground flex items-center justify-start gap-x-3 rounded-xl border px-6 py-4 transition-colors"
            >
              <div
                class="squircle flex size-12 shrink-0 items-center justify-center bg-linear-to-b from-blue-500 to-blue-600 text-white"
              >
                <Icon name="hugeicons:mail-01" class="size-6" />
              </div>
              <div>
                <h4 class="text-foreground leading-tight! font-semibold">
                  Email
                </h4>
                <p class="text-muted-foreground mt-1 text-sm">
                  {{ email }}
                </p>
              </div>
            </a>
          </div>
        </div>

        <h2>Quick Links</h2>
        <p>Find answers to common questions and important information:</p>
        <ul>
          <li>
            <nuxt-link :to="localePath('/faq')">Frequently Asked Questions (FAQ)</nuxt-link> -
            Find answers to common questions about the event
          </li>
          <li>
            <nuxt-link :to="localePath('/ticket-terms-and-conditions')"
              >Ticket Terms and Conditions</nuxt-link
            >
            - Learn about ticket usage rules and policies
          </li>
          <li>
            <nuxt-link :to="localePath('/ticket-refund-and-return-policy')"
              >Ticket Refund and Return Policy</nuxt-link
            >
            - Understand our refund and return policy
          </li>
          <li>
            <nuxt-link :to="localePath('/event-policy')">Event Policy</nuxt-link> - Review
            event rules and regulations
          </li>
          <li>
            <nuxt-link :to="localePath('/privacy')">Privacy Policy</nuxt-link> - Learn how we
            handle your personal information
          </li>
          <li>
            <nuxt-link :to="localePath('/terms')">Terms of Service</nuxt-link> - Read our terms
            and conditions for using this website
          </li>
        </ul>

        <h2>Common Topics</h2>

        <h3>Ticketing</h3>
        <ul>
          <li>How do I purchase tickets?</li>
          <li>Where can I find my e-ticket after purchase?</li>
          <li>What should I do if I didn't receive my e-ticket?</li>
          <li>Can I transfer my ticket to someone else?</li>
        </ul>
        <p>
          For detailed answers, please visit our
          <nuxt-link :to="localePath('/faq')">FAQ page</nuxt-link> or contact us directly.
        </p>

        <h3>Event Information</h3>
        <ul>
          <li>Event date: {{ eventDate }}</li>
          <li>Event time: {{ eventTime }}</li>
          <li>
            Venue:
            <a :href="locationLink" target="_blank">{{ location }}</a>
          </li>
        </ul>

        <h3>Response Time</h3>
        <p>
          We strive to respond to all inquiries within 24 hours during business
          days. For urgent matters, we recommend contacting us via WhatsApp for
          faster response.
        </p>

        <h2>Business Inquiries</h2>
        <p>
          For exhibitor registration, sponsorship, or media partnership
          inquiries, please contact us through the channels above or visit our
          <nuxt-link :to="localePath('/contact')">Contact page</nuxt-link>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
usePageMeta(null, {
  title: "Help Center",
  description:
    "Get help with ticketing, event information, and general inquiries. Contact us via WhatsApp or email for assistance.",
});

const localePath = useLocalePath();
const config = useAppConfig();
const eventTitle = config.event.title;
const email = config.contact.email;
const whatsapp = config.contact.whatsapp;
const shortName = config.app.shortName;
const whatsappLink = `https://api.whatsapp.com/send?phone=${whatsapp}&text=Halo, ${shortName}!`;
const whatsappDisplay = `+${whatsapp.slice(0, 2)} ${whatsapp.slice(2, 5)}-${whatsapp.slice(5, 9)}-${whatsapp.slice(9)}`;
const eventDate = config.event.date;
const eventTime = config.event.time;
const location = config.event.location;
const locationLink = config.event.locationLink;
</script>
