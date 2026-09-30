/**
 * Links something on the site (a rundown item selling a seminar) to that
 * ticket's card on the tickets page. Every card carries `id="<ticket slug>"`,
 * so the link is just `/tickets#<slug>`.
 *
 * From another page the link navigates and the `hashScroll` plugin brings the
 * card into view once the listing has rendered. On the tickets page itself the
 * rundown sits in another tab, where the card is hidden, and following the
 * same hash twice is not a navigation at all. So there the button is a plain
 * button (`to` is null) whose click is handed to the page instead (see `focus`
 * in pages/tickets/index.vue), which opens the Tickets tab and scrolls.
 */
export function useTicketCardLink() {
  const route = useRoute();
  const localePath = useLocalePath();
  const focus = useState("ticket-card-focus", () => null);

  const ticketsPath = computed(() => localePath("/tickets"));

  // A past edition's rundown has no tickets page of its own to send anyone to.
  const available = computed(() => !route.params.edition);

  const onTicketsPage = computed(() => route.path === ticketsPath.value);

  function hrefFor(slug) {
    return onTicketsPage.value ? null : `${ticketsPath.value}#${slug}`;
  }

  function open(slug) {
    if (onTicketsPage.value) focus.value = { slug, at: Date.now() };
  }

  return { available, hrefFor, open, focus };
}
