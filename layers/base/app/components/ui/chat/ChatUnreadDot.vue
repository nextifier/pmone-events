<!--
  A dot for a launcher whose panel is shut while something arrived.

  Pure presentation: the count lives with whichever chat owns it. On a
  launcher there is no room for a number, and one dot says what matters -
  something is waiting, open it.
-->
<template>
  <span
    data-slot="chat-unread-dot"
    class="pointer-events-none absolute -top-0.5 -right-0.5 flex size-3"
    aria-hidden="true"
  >
    <span
      class="bg-destructive absolute inline-flex size-full animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full opacity-75"
    />
    <span class="bg-destructive ring-background relative inline-flex size-3 rounded-full ring-2" />
  </span>
</template>
