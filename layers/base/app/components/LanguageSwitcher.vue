<template>
  <DropdownMenu>
    <DropdownMenuTrigger
      class="text-primary hover:bg-muted relative flex size-8 items-center justify-center rounded-lg"
      aria-label="Switch Language"
    >
      <Icon name="lucide:languages" class="size-4.5 shrink-0" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem
        v-for="loc in availableLocales"
        :key="loc.code"
        as-child
      >
        <NuxtLink
          :to="switchLocalePath(loc.code)"
          class="cursor-pointer"
        >
          <div class="flex w-full items-center justify-between gap-2">
            <span class="text-sm">{{ loc.name }}</span>
            <Icon v-if="locale === loc.code" name="lucide:check" class="size-4" />
          </div>
        </NuxtLink>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup>
const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const availableLocales = computed(() => locales.value);
</script>
