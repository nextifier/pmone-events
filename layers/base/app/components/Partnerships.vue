<template>
  <section id="partnerships">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <h2
          class="section-title-large !leading-[1] font-semibold tracking-tighter text-balance"
          v-html="content.title"
        ></h2>

        <p class="section-description mt-4">
          {{ content.description }}
        </p>
      </div>

      <div
        class="bg-border *:bg-background mt-16 grid grid-cols-2 gap-px p-px *:relative lg:grid-rows-3"
      >
        <div class="col-span-2 lg:col-span-1 lg:row-span-3">
          <div
            class="flex flex-col items-center px-4 pb-8 text-center lg:pb-12"
          >
            <NuxtImg
              src="/img/exhibitor-booth.png"
              alt=""
              class="pointer-events-none -mt-6 w-full max-w-[480px] select-none"
              width="1000"
              height="813"
              sizes="480px"
              loading="lazy"
              format="webp"
            />

            <h3
              class="text-primary mt-8 text-[clamp(2rem,2.5vw,6rem)] !leading-[1.2] font-semibold tracking-tighter text-balance"
            >
              {{ content.exhibitor.title }}
            </h3>

            <p class="section-description mt-3">
              {{ content.exhibitor.description }}
            </p>

            <nuxt-link
              :to="lp(content.exhibitor.cta.url)"
              :target="
                content.exhibitor.cta.url.startsWith('http') ? '_blank' : ''
              "
              class="bg-primary text-primary-foreground hover:bg-primary/80 mt-6 flex items-center justify-center rounded-lg px-4 py-3 text-center font-semibold tracking-tight transition active:scale-98"
              v-ripple
              >{{ content.exhibitor.cta.label }}</nuxt-link
            >
          </div>
          <Cross position="top-left" />
        </div>

        <div
          v-for="(item, index) in content.partnerships"
          :key="index"
          class="col-span-1 flex flex-col items-center gap-3 p-3 lg:col-span-1 lg:row-span-1 lg:flex-row"
        >
          <Cross v-if="index == 0" position="top-left" />
          <Cross v-if="index == 0" position="bottom-right" />
          <Cross v-if="index == 1" position="top-right" />

          <nuxt-link
            :to="lp(item.link)"
            :target="item.link.startsWith('http') ? '_blank' : ''"
            :aria-label="item.title"
            class="bg-muted aspect-square w-full shrink-0 overflow-hidden rounded-xl lg:size-32"
          >
            <NuxtImg
              :src="item.image"
              alt=""
              class="pointer-events-none size-full object-cover select-none"
              width="400"
              height="400"
              sizes="200px sm:400px"
              loading="lazy"
              format="webp"
            />
          </nuxt-link>

          <div
            class="flex h-full flex-col items-start justify-between gap-y-2 lg:h-auto lg:justify-normal"
          >
            <div class="flex flex-col items-start">
              <h3
                class="text-primary text-base !leading-[1.2] font-semibold tracking-tighter text-pretty lg:text-xl"
              >
                {{ item.title }}
              </h3>

              <p class="section-description mt-1.5 !text-sm !leading-[1.35]">
                {{ item.description }}
              </p>
            </div>

            <nuxt-link
              :to="lp(item.link)"
              :target="item.link.startsWith('http') ? '_blank' : ''"
              class="bg-muted text-primary hover:bg-primary hover:text-primary-foreground flex items-center justify-center gap-x-1 rounded-lg px-3 py-2 text-center text-sm font-semibold tracking-tight transition active:scale-98"
              v-ripple
            >
              <span>{{ item.ctaLabel }}</span>
            </nuxt-link>
          </div>
        </div>

        <div
          class="bg-pattern-diagonal col-span-2 flex items-center justify-center px-6 py-8 lg:col-span-1"
        >
          <Cross position="bottom-left" />

          <div
            class="flex flex-col items-center text-center [--pattern-fg:var(--color-accent)]"
          >
            <div
              class="text-primary dark:text-muted-foreground text-3xl font-semibold tracking-tighter text-balance sm:text-4xl"
            >
              {{ content.reservedSpace.title }}
            </div>

            <nuxt-link
              :to="lp(reservedSpaceUrl)"
              :target="reservedSpaceUrl.startsWith('http') ? '_blank' : ''"
              class="bg-muted hover:bg-primary hover:text-primary-foreground mt-5 rounded-lg border px-4 py-2 text-sm font-semibold tracking-tight transition active:scale-98"
              >{{ content.reservedSpace.cta.label }}</nuxt-link
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const localePath = useLocalePath();
const lp = (path) => (path?.startsWith("http") ? path : localePath(path));

const appConfig = useAppConfig();
const profile = useProjectProfile();

const content = computed(() => useContentStore().components.partnerships);

// Built here (not in the content store) so the WhatsApp number can come from PM
// One via useProjectProfile instead of a hardcoded app.config contact.
const reservedSpaceUrl = computed(() => {
  const number = profile.whatsappNumber;
  if (!number) return "";
  const shortName = appConfig.app?.shortName || appConfig.app?.name || "";
  return `https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(`Halo, ${shortName}!`)}`;
});
</script>
