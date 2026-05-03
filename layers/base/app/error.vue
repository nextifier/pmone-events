<template>
  <div
    class="fixed inset-0 grid place-items-center overflow-auto bg-white text-black dark:bg-gray-950 dark:text-white"
  >
    <div
      class="container flex flex-col items-center justify-center gap-y-3 px-4 py-8 text-center"
    >
      <span v-if="error.statusCode" class="text-sm">
        {{ error.statusCode }}
      </span>

      <h1
        v-if="error.statusMessage"
        class="text-primary text-4xl font-semibold tracking-tighter"
      >
        {{ error.statusMessage }}
      </h1>

      <p v-if="error.message" class="mx-auto mt-1 max-w-2xl text-balance">
        {{
          error.statusCode === 404
            ? "We couldn’t find the page you’re looking for. It might have moved, been renamed, or maybe it never existed in the first place."
            : error.message
        }}
      </p>

      <pre
        v-if="error.stack && error.statusCode === 500"
        class="text-muted-foreground mt-3 w-full max-w-xl overflow-auto rounded-2xl border px-4 py-6 text-left text-xs leading-normal!"
        >{{ error.stack }}</pre
      >

      <Button class="mt-4" @click="handleError">
        <Icon name="lucide:arrow-left" class="size-4 shrink-0" />
        <span>Back to home</span>
      </Button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object,
});

const headline = computed(() =>
  props.error?.statusCode === 404 ? "Page not found" : "Something went wrong",
);

if (import.meta.server) {
  const event = useRequestEvent();
  if (event) setResponseStatus(event, props.error?.statusCode || 500);
}

useSeoMeta({
  titleTemplate: null,
  title: headline.value,
  robots: "noindex, nofollow",
});

const handleError = () => clearError({ redirect: "/" });
</script>
