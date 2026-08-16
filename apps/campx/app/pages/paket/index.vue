<template>
  <div class="container space-y-8 py-10 lg:py-16">
    <header class="max-w-3xl space-y-3">
      <h1 class="text-4xl font-medium tracking-tighter text-balance sm:text-5xl">
        Semua paket CampX
      </h1>
      <p class="text-muted-foreground text-base tracking-tight text-pretty sm:text-lg">
        Menginap, aktivitas air, arung jeram, day trip, dan outing rombongan di dua cabang.
        Saring sesuai lokasi, tipe, dan siapa yang ikut.
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-12 lg:gap-10">
      <!-- Desktop: a rail. With five facet groups a rail beats a popover,
           because everything is visible at once and nothing needs a click to
           discover. -->
      <aside class="hidden lg:col-span-3 lg:block">
        <div class="sticky top-(--navbar-height-desktop) space-y-6 pt-2">
          <PackageFilterPanel :catalog="catalog" />
          <Button v-if="catalog.activeFilterCount.value" variant="outline" size="sm" @click="catalog.reset()">
            Reset semua filter
          </Button>
        </div>
      </aside>

      <div class="space-y-6 lg:col-span-9">
        <div
          class="bg-background/80 sticky top-(--navbar-height-mobile) z-10 -mx-4 flex items-center gap-2 px-4 py-3 backdrop-blur-sm lg:static lg:mx-0 lg:px-0 lg:py-0 lg:backdrop-blur-none"
        >
          <InputGroup class="flex-1">
            <InputGroupAddon>
              <Icon name="hugeicons:search-01" class="size-4 shrink-0" />
            </InputGroupAddon>
            <InputGroupInput v-model="catalog.search.value" placeholder="Cari paket" />
            <InputGroupAddon v-if="catalog.search.value" align="inline-end">
              <InputGroupButton size="icon-xs" variant="ghost" aria-label="Hapus pencarian" @click="catalog.search.value = ''">
                <Icon name="hugeicons:cancel-01" class="size-4 shrink-0" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          <Drawer>
            <DrawerTrigger as-child>
              <Button variant="outline" size="sm" class="h-(--cn-input-h) lg:hidden">
                <Icon name="hugeicons:filter" class="size-4 shrink-0" />
                <span>Filter</span>
                <Badge v-if="catalog.activeFilterCount.value" variant="default" plain>
                  {{ catalog.activeFilterCount.value }}
                </Badge>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <!-- reka-ui requires a labelled dialog; ResponsiveDialog does the
                   same thing with an sr-only title. -->
              <DrawerTitle class="sr-only">Filter paket</DrawerTitle>
              <DrawerDescription class="sr-only">
                Saring paket berdasarkan lokasi, tipe, kategori, dan siapa yang ikut.
              </DrawerDescription>
              <div class="max-h-[70vh] overflow-y-auto px-4 pt-5 pb-8">
                <PackageFilterPanel :catalog="catalog" />
              </div>
              <div class="border-border flex gap-2 border-t px-4 py-3">
                <Button variant="outline" size="lg" class="flex-1" @click="catalog.reset()">Reset</Button>
                <DrawerClose as-child>
                  <Button size="lg" class="flex-1">Tampilkan {{ catalog.results.value.length }} paket</Button>
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" size="sm" class="h-(--cn-input-h)">
                <Icon name="hugeicons:arrange-by-numbers-1-9" class="size-4 shrink-0" />
                <span class="max-sm:sr-only">{{ activeSortLabel }}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                v-for="option in catalog.sortOptions"
                :key="option.value"
                @select="catalog.sort.value = option.value"
              >
                {{ option.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p class="text-muted-foreground text-sm tracking-tight">
          {{ catalog.results.value.length }} paket
          <span v-if="catalog.hasQuery.value">untuk “{{ catalog.search.value }}”</span>
        </p>

        <div
          v-if="catalog.results.value.length"
          class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <PackageCard v-for="pkg in catalog.results.value" :key="pkg.id" :pkg="pkg" />
        </div>

        <Empty v-else class="border-dashed">
          <EmptyMedia>
            <Icon name="hugeicons:search-01" class="size-6" />
          </EmptyMedia>
          <EmptyHeader>Belum ada paket yang cocok</EmptyHeader>
          <EmptyContent>Coba longgarkan filternya, atau hapus kata kuncinya.</EmptyContent>
          <Button variant="outline" @click="catalog.reset()">Reset filter</Button>
        </Empty>

        <section class="border-border space-y-3 border-t pt-8">
          <h2 class="text-base font-medium tracking-tight">Bingung mulai dari mana?</h2>
          <p class="text-muted-foreground max-w-2xl text-sm tracking-tight text-pretty">
            Kalau yang kamu cari suasana danau yang tenang, mulai dari
            <NuxtLink to="/jatiluhur" class="text-brand underline underline-offset-4">CampX Jatiluhur</NuxtLink>
            di Purwakarta. Kalau maunya sungai dan adrenalin, lihat
            <NuxtLink to="/cikidang" class="text-brand underline underline-offset-4">CampX Cikidang</NuxtLink>
            di Sukabumi. Untuk rombongan kantor, semua opsinya dirangkum di halaman
            <NuxtLink to="/outing" class="text-brand underline underline-offset-4">outing</NuxtLink>.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PUBLIC_PACKAGES } from "~/data/packages";

usePageMeta("paket");

defineOptions({ name: "paket" });

const catalog = usePackageCatalog();

const activeSortLabel = computed(
  () => catalog.sortOptions.find((option) => option.value === catalog.sort.value)?.label ?? "Urutkan",
);

/**
 * Every filter combination is one URL. The page itself is prerendered in its
 * unfiltered state and filters on the client, so the canonical always points at
 * the bare listing — otherwise every shareable filter link would look like a
 * separate thin page to a crawler.
 */
useHead({
  link: [{ rel: "canonical", href: `${useAppConfig().app.url}/paket` }],
});

// The full catalog, not the filtered view: the page is prerendered unfiltered,
// and the markup has to describe what a crawler actually receives.
const { buildItemList, buildBreadcrumbList, emit } = useJsonLd();

emit([
  buildItemList(PUBLIC_PACKAGES, "Semua paket CampX"),
  buildBreadcrumbList([
    { label: "Beranda", to: "/" },
    { label: "Paket", to: "/paket" },
  ]),
]);
</script>
