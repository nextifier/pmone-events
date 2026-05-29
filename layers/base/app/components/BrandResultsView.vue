<template>
  <div>
    <div class="flex items-end justify-between gap-x-2.5">
      <div
        v-if="!pending"
        class="text-muted-foreground text-sm tracking-tight"
      >
        Showing {{ filteredBrands.length }} brand<span
          v-if="filteredBrands.length !== 1"
          >s</span
        >
      </div>
      <Skeleton v-else class="h-4 w-36" />

      <BrandViewSwitcher v-model="viewMode" />
    </div>

    <div class="mt-3">
      <!-- ===================== LOADING ===================== -->
      <div v-if="pending">
        <BrandGridSkeleton v-if="viewMode === 'grid'" variant="grid" />
        <BrandGridSkeleton v-else-if="viewMode === 'card'" variant="card" />
        <BrandTableSkeleton v-else />
      </div>

      <!-- ===================== ERROR ===================== -->
      <Empty v-else-if="error" class="border-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon name="hugeicons:alert-02" class="text-primary" />
          </EmptyMedia>
          <EmptyTitle>Failed to get the data.</EmptyTitle>
          <EmptyDescription v-if="errorDetail">
            {{ errorDetail }}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>

      <!-- ===================== DATA EMPTY ===================== -->
      <Empty v-else-if="!allBrands?.length" class="border-none">
        <EmptyHeader>
          <EmptyMedia class="perspective-midrange mb-0">
            <BrandListEmptyStateImage
              class="shadow-wrapper w-full max-w-80 rounded-md transition duration-300 hover:rotate-x-40"
            />
          </EmptyMedia>
          <EmptyTitle>Brand list is coming soon. Check back later!</EmptyTitle>
        </EmptyHeader>
      </Empty>

      <!-- ===================== RESULTS ===================== -->
      <template v-else>
        <!-- ============ TABLE VIEW ============ -->
        <div v-if="viewMode === 'table'">
          <ClientOnly v-if="filteredBrands?.length">
            <BrandTableVirtual
              :data="filteredBrands"
              :columns="brandTableColumns"
              :initial-sorting="[{ id: 'brand_name', desc: false }]"
            />
            <template #fallback>
              <BrandTableSkeleton />
            </template>
          </ClientOnly>
          <Empty v-else class="border-none">
            <EmptyHeader>
              <EmptyTitle
                class="text-4xl font-semibold tracking-tighter sm:text-5xl"
              >
                No results found for
                <span class="font-semibold italic"
                  >{{ debouncedSearchInput }}.</span
                >
              </EmptyTitle>
              <EmptyDescription class="text-base tracking-tight sm:text-lg">
                Maybe try a different keyword.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>

        <!-- ============ GRID & CARD VIEW (virtualized) ============ -->
        <div v-else-if="viewMode === 'grid' || viewMode === 'card'">
          <Empty
            v-if="debouncedSearchInput && !filteredBrands?.length"
            class="border-none"
          >
            <EmptyHeader>
              <EmptyTitle
                class="text-4xl font-semibold tracking-tighter sm:text-5xl"
              >
                No results found for
                <span class="font-semibold italic"
                  >{{ debouncedSearchInput }}.</span
                >
              </EmptyTitle>
              <EmptyDescription class="text-base tracking-tight sm:text-lg">
                Maybe try a different keyword.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>

          <ClientOnly v-else>
            <BrandVirtualList
              :variant="viewMode"
              :brand-groups="brandGroups"
              :grouped-filtered-sorted="groupedFilteredSorted"
              :filtered-brands="filteredBrands"
              :debounced-search-input="debouncedSearchInput"
              :brand-base-path="brandBasePath"
              :get-conjunction-img="getConjunctionImg"
            />

            <template #fallback>
              <BrandGridSkeleton :variant="viewMode" />
            </template>
          </ClientOnly>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { h, computed, resolveComponent, watch, nextTick } from "vue";
import { hasInstagram } from "../composables/useBrandHelpers";

const props = defineProps({
  pending: { type: Boolean, default: false },
  error: { type: [Object, null], default: null },
  allBrands: { type: Array, default: () => [] },
  filteredBrands: { type: Array, default: () => [] },
  brandGroups: { type: Array, default: () => [] },
  groupedFilteredSorted: { type: Map, default: () => new Map() },
  debouncedSearchInput: { type: String, default: "" },
  brandBasePath: { type: String, default: "/brands" },
  getConjunctionImg: { type: Function, required: true },
  showProjectColumn: { type: Boolean, default: false },
});

const viewMode = defineModel("viewMode", { type: String, default: "grid" });

// Pertahankan posisi scroll saat ganti view mode. Swap table <-> grid/card
// me-remount list virtual -> tinggi sempat collapse -> browser clamp scroll.
// Tangkap scrollY sebelum DOM update (watcher flush:'pre'), kembalikan setelah
// tinggi view baru siap (atau timeout). No-op untuk grid<->card yang stabil.
watch(viewMode, () => {
  if (typeof window === "undefined") return;
  const savedY = window.scrollY;
  if (savedY <= 0) return;
  const start = Date.now();
  // Poll via setTimeout (bukan rAF: rAF di-throttle saat tab tidak fokus) sampai
  // tinggi view baru cukup untuk menampung savedY, lalu kembalikan posisinya.
  const restore = () => {
    const maxY = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    if (maxY + 1 >= savedY || Date.now() - start > 800) {
      window.scrollTo(0, Math.min(savedY, maxY));
    } else {
      setTimeout(restore, 16);
    }
  };
  nextTick(() => setTimeout(restore, 0));
});

const localePath = useLocalePath();

const NuxtLinkComp = resolveComponent("NuxtLink");
const AvatarComp = resolveComponent("Avatar");

const brandNameCell = (ctx) => {
  const b = ctx.row.original;
  return h("div", { class: "pl-3" }, [
    h(
      NuxtLinkComp,
      {
        to: localePath(`${props.brandBasePath}/${b.slug}`),
        class: "group",
      },
      () => [
        h("div", { class: "flex items-center gap-x-3" }, [
          h(AvatarComp, {
            model: { name: b.brand_name, profile_image: b.brand_logo },
            class: "size-10 shrink-0",
            rounded: "rounded-full",
            colorful: false,
            gradientFrame: hasInstagram(b),
          }),
          h(
            "div",
            { class: "flex flex-col items-start gap-y-0.5 overflow-hidden" },
            [
              h(
                "p",
                {
                  class:
                    "group-hover:text-primary text-foreground truncate text-sm font-medium tracking-tight transition",
                },
                b.brand_name,
              ),
              b.company_name
                ? h(
                    "p",
                    {
                      class:
                        "text-muted-foreground truncate text-xs tracking-tight",
                    },
                    b.company_name,
                  )
                : null,
            ],
          ),
        ]),
      ],
    ),
  ]);
};

const { columns: brandTableColumns } = useBrandTableColumns({
  showProjectColumn: computed(() => props.showProjectColumn),
  nameCell: brandNameCell,
});

const groupedBrandsAt = (idx) => props.groupedFilteredSorted.get(idx);

const errorDetail = computed(() => {
  const err = props.error;
  if (!err) return null;
  return err.statusMessage || err.message || null;
});
</script>
