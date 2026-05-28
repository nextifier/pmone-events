<template>
  <div>
    <div class="flex items-end justify-between gap-x-2.5">
      <div
        v-if="filteredBrands"
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
        <!-- Grid skeleton -->
        <GridFill
          v-if="viewMode === 'grid'"
          :count="12"
          min-col-width="260px"
          rounded="lg"
          :cols="2"
        >
          <div
            v-for="i in 12"
            :key="i"
            class="flex h-full flex-col gap-4 p-4 sm:p-5"
          >
            <div class="flex flex-col items-center gap-y-2">
              <Skeleton class="size-12 rounded-full" />
              <div class="flex w-full flex-col items-center gap-y-1.5 overflow-hidden">
                <Skeleton class="h-4 w-2/3" />
                <Skeleton class="h-3 w-1/2" />
              </div>
            </div>
            <div class="flex items-start justify-between gap-2">
              <Skeleton class="h-14 w-16 rounded-xl sm:rounded-2xl" />
              <div class="flex -space-x-5">
                <Skeleton class="size-16 rounded-2xl" />
                <Skeleton class="size-16 rounded-2xl" />
              </div>
            </div>
          </div>
        </GridFill>

        <!-- Card skeleton -->
        <div
          v-else-if="viewMode === 'card'"
          class="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:gap-x-2"
        >
          <div
            v-for="i in 12"
            :key="i"
            class="border-border flex h-full flex-col gap-4 rounded-lg border p-4 sm:p-5"
          >
            <div class="flex flex-col items-center gap-y-2">
              <Skeleton class="size-11 rounded-full" />
              <div class="flex w-full flex-col items-center gap-y-1.5 overflow-hidden">
                <Skeleton class="h-4 w-2/3" />
                <Skeleton class="h-3 w-1/2" />
              </div>
            </div>
            <div class="flex items-start justify-between gap-2">
              <Skeleton class="h-14 w-16 rounded-xl sm:rounded-2xl" />
              <div class="flex -space-x-5">
                <Skeleton class="size-16 rounded-2xl" />
                <Skeleton class="size-16 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>

        <!-- Table skeleton -->
        <div v-else class="frame">
          <div
            class="frame-panel bg-background -m-px overflow-hidden rounded-lg p-4"
          >
            <div class="space-y-3">
              <Skeleton
                v-for="i in 12"
                :key="i"
                class="h-12 w-full rounded-md"
              />
            </div>
          </div>
        </div>
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
          <TableData
            v-if="filteredBrands?.length"
            :data="filteredBrands"
            :columns="brandTableColumns"
            :meta="{}"
            :pending="pending"
            model="brands"
            :searchable="false"
            :column-toggle="false"
            :show-add-button="false"
            :show-refresh-button="false"
            :display-only="true"
            :page-sizes="[]"
            :initial-pagination="{ pageIndex: 0, pageSize: 9999 }"
            :initial-sorting="[{ id: 'brand_name', desc: false }]"
          />
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

        <!-- ============ GRID VIEW ============ -->
        <div v-if="viewMode === 'grid'">
          <!-- Search mode: flat list -->
          <div v-if="debouncedSearchInput">
            <GridFill
              v-if="filteredBrands?.length"
              :count="filteredBrands.length"
              min-col-width="260px"
              rounded="lg"
              :cols="2"
            >
              <NuxtLink
                v-for="brand in filteredBrands"
                :key="brand.slug"
                :to="localePath(`${brandBasePath}/${brand.slug}`)"
                class="group @container flex h-full flex-col gap-4 p-4 sm:p-5"
                :aria-label="brand.brand_name"
              >
                <div class="flex flex-col items-center text-center gap-y-2">
                  <Avatar
                    :model="{
                      name: brand.brand_name,
                      profile_image: brand.brand_logo,
                    }"
                    class="size-12"
                    rounded="rounded-full"
                    :colorful="false"
                    :gradient-frame="hasInstagram(brand)"
                  />
                  <div
                    class="flex flex-col items-center gap-y-0.5 overflow-hidden"
                  >
                    <p
                      class="text-foreground truncate font-medium tracking-tight"
                    >
                      {{ brand.brand_name }}
                    </p>
                    <p
                      v-if="brand.business_categories?.length"
                      class="text-muted-foreground line-clamp-2 text-sm tracking-tight"
                    >
                      {{ brand.business_categories.join(", ") }}
                    </p>
                  </div>
                </div>

                <div
                  class="flex items-start justify-center gap-2 @3xs:justify-between"
                >
                  <div
                    class="bg-muted flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 sm:h-full sm:rounded-2xl"
                    v-tippy="brand.booth_number"
                  >
                    <div class="flex items-center gap-1">
                      <IconShop class="size-3.5 shrink-0" />
                      <span class="line-clamp-1 text-xs tracking-tight">{{
                        $t("ui.booth")
                      }}</span>
                    </div>
                    <span
                      class="text-primary line-clamp-1 font-semibold tracking-tight"
                      >{{ brand.booth_number || "-" }}</span
                    >
                  </div>

                  <div
                    v-if="brand.promotions?.length"
                    class="relative isolate flex flex-col items-center justify-end -space-y-13 @3xs:flex-row @3xs:space-y-0 @3xs:-space-x-5"
                  >
                    <div
                      v-for="(item, index) in brand.promotions.slice(0, 2)"
                      :key="index"
                      class="flex size-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-white shadow-md nth-2:scale-90 @3xs:nth-2:scale-100"
                      :class="{
                        '@3xs:odd:-rotate-12 @3xs:even:rotate-12':
                          brand.promotions.length == 2,
                        '@3xs:first:-rotate-12 @3xs:even:-translate-y-2':
                          brand.promotions.length > 2,
                      }"
                      :style="`z-index: ${brand.promotions.length - index}`"
                    >
                      <img
                        v-if="item.sm || item.md"
                        :src="item.sm || item.md"
                        :alt="item.alt || brand.brand_name"
                        loading="lazy"
                        class="h-full w-full object-cover"
                      />
                    </div>

                    <div
                      v-if="brand.promotions.length > 2"
                      class="z-0 hidden size-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-gray-200/50 @3xs:flex @3xs:rotate-12 dark:border-transparent dark:bg-gray-800"
                    >
                      <span class="text-primary text-base"
                        >+{{ brand.promotions.length - 2 }}</span
                      >
                    </div>
                  </div>
                </div>
                <!-- <div class="mt-auto">
                  <div class="w-full">
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span
                        class="text-muted-foreground line-clamp-1 text-xs tracking-tight"
                        v-tippy="
                          $dayjs(brand.created_at).format('MMMM D, YYYY [at] h:mm A')
                        "
                      >
                        <span class="hidden sm:inline">{{ $t("ui.created") }} </span>
                        {{ $dayjs(brand.created_at).fromNow() }}
                      </span>

                      <span
                        v-if="brand.views_count"
                        class="text-muted-foreground line-clamp-1 flex items-center gap-x-0.5 text-xs tracking-tight"
                        v-tippy="
                          $t('ui.views', brand.views_count, {
                            n: brand.views_count,
                          })
                        "
                      >
                        <Icon name="hugeicons:view" class="size-4" />
                        <span>{{ brand.views_count }}</span>
                      </span>
                    </div>
                  </div>
                </div> -->
              </NuxtLink>
            </GridFill>
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

          <!-- Grouped view -->
          <div v-else class="space-y-10">
            <template
              v-for="(group, groupIndex) in brandGroups"
              :key="groupIndex"
            >
              <BrandConjunctionSeparator
                v-if="!group.is_primary && groupedBrandsAt(groupIndex)?.length"
                :group="group"
                :get-img="getConjunctionImg"
              />
              <GridFill
                v-if="groupedBrandsAt(groupIndex)?.length"
                :count="groupedBrandsAt(groupIndex).length"
                min-col-width="260px"
                rounded="lg"
                :cols="2"
              >
                <NuxtLink
                  v-for="brand in groupedBrandsAt(groupIndex)"
                  :key="brand.slug"
                  :to="localePath(`${brandBasePath}/${brand.slug}`)"
                  class="group @container flex h-full flex-col gap-4 p-4 sm:p-5"
                  :aria-label="brand.brand_name"
                >
                  <div class="flex flex-col items-center text-center gap-y-2">
                    <Avatar
                      :model="{
                        name: brand.brand_name,
                        profile_image: brand.brand_logo,
                      }"
                      class="size-12"
                      rounded="rounded-full"
                      :colorful="false"
                      :gradient-frame="hasInstagram(brand)"
                    />
                    <div
                      class="flex flex-col items-center gap-y-0.5 overflow-hidden"
                    >
                      <p
                        class="text-foreground truncate font-medium tracking-tight"
                      >
                        {{ brand.brand_name }}
                      </p>
                      <p
                        v-if="brand.business_categories?.length"
                        class="text-muted-foreground line-clamp-2 text-sm tracking-tight"
                      >
                        {{ brand.business_categories.join(", ") }}
                      </p>
                    </div>
                  </div>

                  <div
                    class="flex items-start justify-center gap-2 @3xs:justify-between"
                  >
                    <div
                      class="bg-muted flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 sm:h-full sm:rounded-2xl"
                      v-tippy="brand.booth_number"
                    >
                      <div class="flex items-center gap-1">
                        <IconShop class="size-3.5 shrink-0" />
                        <span class="line-clamp-1 text-xs tracking-tight">{{
                          $t("ui.booth")
                        }}</span>
                      </div>
                      <span
                        class="text-primary line-clamp-1 font-semibold tracking-tight"
                        >{{ brand.booth_number || "-" }}</span
                      >
                    </div>

                    <div
                      v-if="brand.promotions?.length"
                      class="relative isolate flex flex-col items-center justify-end -space-y-13 @3xs:flex-row @3xs:space-y-0 @3xs:-space-x-5"
                    >
                      <div
                        v-for="(item, index) in brand.promotions.slice(0, 2)"
                        :key="index"
                        class="flex size-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-white shadow-md nth-2:scale-90 @3xs:nth-2:scale-100"
                        :class="{
                          '@3xs:odd:-rotate-12 @3xs:even:rotate-12':
                            brand.promotions.length == 2,
                          '@3xs:first:-rotate-12 @3xs:even:-translate-y-2':
                            brand.promotions.length > 2,
                        }"
                        :style="`z-index: ${brand.promotions.length - index}`"
                      >
                        <img
                          v-if="item.sm || item.md"
                          :src="item.sm || item.md"
                          :alt="item.alt || brand.brand_name"
                          loading="lazy"
                          class="h-full w-full object-cover"
                        />
                      </div>

                      <div
                        v-if="brand.promotions.length > 2"
                        class="z-0 hidden size-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-gray-200/50 @3xs:flex @3xs:rotate-12 dark:border-transparent dark:bg-gray-800"
                      >
                        <span class="text-primary text-base"
                          >+{{ brand.promotions.length - 2 }}</span
                        >
                      </div>
                    </div>
                  </div>
                  <!-- <div class="mt-auto">
                    <div class="w-full">
                      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span
                          class="text-muted-foreground line-clamp-1 text-xs tracking-tight"
                          v-tippy="
                            $dayjs(brand.created_at).format('MMMM D, YYYY [at] h:mm A')
                          "
                        >
                          <span class="hidden sm:inline">{{ $t("ui.created") }} </span>
                          {{ $dayjs(brand.created_at).fromNow() }}
                        </span>

                        <span
                          v-if="brand.views_count"
                          class="text-muted-foreground line-clamp-1 flex items-center gap-x-0.5 text-xs tracking-tight"
                          v-tippy="
                            $t('ui.views', brand.views_count, {
                              n: brand.views_count,
                            })
                          "
                        >
                          <Icon name="hugeicons:view" class="size-4" />
                          <span>{{ brand.views_count }}</span>
                        </span>
                      </div>
                    </div>
                  </div> -->
                </NuxtLink>
              </GridFill>
            </template>
            <BrandAndManyMore />
          </div>
        </div>

        <!-- ============ CARD VIEW ============ -->
        <div v-if="viewMode === 'card'">
          <!-- Search mode: flat list -->
          <div v-if="debouncedSearchInput">
            <div
              v-if="filteredBrands?.length"
              class="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:gap-x-2"
            >
              <CardNotch
                v-for="brand in filteredBrands"
                :key="brand.slug"
                :to="localePath(`${brandBasePath}/${brand.slug}`)"
                auto-pad
                border-color="var(--color-border)"
                class="@container h-full hover:scale-100 active:scale-100"
                body-class="flex h-full flex-col gap-4 p-4 sm:p-5"
                :class="{
                  'col-span-2 sm:col-span-1': filteredBrands.length === 1,
                }"
              >
                <template #notch>
                  <Icon name="hugeicons:arrow-up-right-03" class="size-5" />
                </template>

                <div class="flex flex-col items-center text-center gap-y-2">
                  <Avatar
                    :model="{
                      name: brand.brand_name,
                      profile_image: brand.brand_logo,
                    }"
                    class="size-11"
                    rounded="rounded-full"
                    :colorful="false"
                    :gradient-frame="hasInstagram(brand)"
                  />
                  <div
                    class="flex flex-col items-center gap-y-0.5 overflow-hidden"
                  >
                    <p
                      class="text-foreground truncate font-medium tracking-tight"
                    >
                      {{ brand.brand_name }}
                    </p>
                    <p
                      v-if="brand.business_categories?.length"
                      class="text-muted-foreground line-clamp-2 text-sm tracking-tight"
                    >
                      {{ brand.business_categories.join(", ") }}
                    </p>
                  </div>
                </div>

                <div
                  class="flex items-start justify-center gap-2 @3xs:justify-between"
                >
                  <div
                    class="bg-muted flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 sm:h-full sm:rounded-2xl"
                    v-tippy="brand.booth_number"
                  >
                    <div class="flex items-center gap-1">
                      <IconShop class="size-3.5 shrink-0" />
                      <span class="line-clamp-1 text-xs tracking-tight">{{
                        $t("ui.booth")
                      }}</span>
                    </div>
                    <span
                      class="text-primary line-clamp-1 font-semibold tracking-tight"
                      >{{ brand.booth_number || "-" }}</span
                    >
                  </div>

                  <div
                    v-if="brand.promotions?.length"
                    class="relative isolate flex flex-col items-center justify-end -space-y-13 @3xs:flex-row @3xs:space-y-0 @3xs:-space-x-5"
                  >
                    <div
                      v-for="(item, index) in brand.promotions.slice(0, 2)"
                      :key="index"
                      class="flex size-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-white shadow-md nth-2:scale-90 @3xs:nth-2:scale-100"
                      :class="{
                        '@3xs:odd:-rotate-12 @3xs:even:rotate-12':
                          brand.promotions.length == 2,
                        '@3xs:first:-rotate-12 @3xs:even:-translate-y-2':
                          brand.promotions.length > 2,
                      }"
                      :style="`z-index: ${brand.promotions.length - index}`"
                    >
                      <img
                        v-if="item.sm || item.md"
                        :src="item.sm || item.md"
                        :alt="item.alt || brand.brand_name"
                        loading="lazy"
                        class="h-full w-full object-cover"
                      />
                    </div>

                    <div
                      v-if="brand.promotions.length > 2"
                      class="z-0 hidden size-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-gray-200/50 @3xs:flex @3xs:rotate-12 dark:border-transparent dark:bg-gray-800"
                    >
                      <span class="text-primary text-base"
                        >+{{ brand.promotions.length - 2 }}</span
                      >
                    </div>
                  </div>
                </div>
                <!-- <div class="mt-auto">
                  <div class="w-full">
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span
                        class="text-muted-foreground line-clamp-1 text-xs tracking-tight"
                        v-tippy="
                          $dayjs(brand.created_at).format('MMMM D, YYYY [at] h:mm A')
                        "
                      >
                        <span class="hidden sm:inline">{{ $t("ui.created") }} </span>
                        {{ $dayjs(brand.created_at).fromNow() }}
                      </span>

                      <span
                        v-if="brand.views_count"
                        class="text-muted-foreground line-clamp-1 flex items-center gap-x-0.5 text-xs tracking-tight"
                        v-tippy="
                          $t('ui.views', brand.views_count, {
                            n: brand.views_count,
                          })
                        "
                      >
                        <Icon name="hugeicons:view" class="size-4" />
                        <span>{{ brand.views_count }}</span>
                      </span>
                    </div>
                  </div>
                </div> -->
              </CardNotch>
            </div>
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

          <!-- Grouped view -->
          <div v-else class="space-y-10">
            <template
              v-for="(group, groupIndex) in brandGroups"
              :key="groupIndex"
            >
              <BrandConjunctionSeparator
                v-if="!group.is_primary && groupedBrandsAt(groupIndex)?.length"
                :group="group"
                :get-img="getConjunctionImg"
              />
              <div
                v-if="groupedBrandsAt(groupIndex)?.length"
                class="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:gap-x-2"
              >
                <CardNotch
                  v-for="brand in groupedBrandsAt(groupIndex)"
                  :key="brand.slug"
                  :to="localePath(`${brandBasePath}/${brand.slug}`)"
                  auto-pad
                  border-color="var(--color-border)"
                  class="@container h-full hover:scale-100 active:scale-100"
                  body-class="flex h-full flex-col gap-4 p-4 sm:p-5"
                  :class="{
                    'col-span-2 sm:col-span-1':
                      groupedBrandsAt(groupIndex).length === 1,
                  }"
                >
                  <template #notch>
                    <Icon name="hugeicons:arrow-up-right-03" class="size-5" />
                  </template>

                  <div class="flex flex-col items-center text-center gap-y-2">
                    <Avatar
                      :model="{
                        name: brand.brand_name,
                        profile_image: brand.brand_logo,
                      }"
                      class="size-11"
                      rounded="rounded-full"
                      :colorful="false"
                      :gradient-frame="hasInstagram(brand)"
                    />
                    <div
                      class="flex flex-col items-center gap-y-0.5 overflow-hidden"
                    >
                      <p
                        class="text-foreground truncate font-medium tracking-tight"
                      >
                        {{ brand.brand_name }}
                      </p>
                      <p
                        v-if="brand.business_categories?.length"
                        class="text-muted-foreground line-clamp-2 text-sm tracking-tight"
                      >
                        {{ brand.business_categories.join(", ") }}
                      </p>
                    </div>
                  </div>

                  <div
                    class="flex items-start justify-center gap-2 @3xs:justify-between"
                  >
                    <div
                      class="bg-muted flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 sm:h-full sm:rounded-2xl"
                      v-tippy="brand.booth_number"
                    >
                      <div class="flex items-center gap-1">
                        <IconShop class="size-3.5 shrink-0" />
                        <span class="line-clamp-1 text-xs tracking-tight">{{
                          $t("ui.booth")
                        }}</span>
                      </div>
                      <span
                        class="text-primary line-clamp-1 font-semibold tracking-tight"
                        >{{ brand.booth_number || "-" }}</span
                      >
                    </div>

                    <div
                      v-if="brand.promotions?.length"
                      class="relative isolate flex flex-col items-center justify-end -space-y-13 @3xs:flex-row @3xs:space-y-0 @3xs:-space-x-5"
                    >
                      <div
                        v-for="(item, index) in brand.promotions.slice(0, 2)"
                        :key="index"
                        class="flex size-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-white shadow-md nth-2:scale-90 @3xs:nth-2:scale-100"
                        :class="{
                          '@3xs:odd:-rotate-12 @3xs:even:rotate-12':
                            brand.promotions.length == 2,
                          '@3xs:first:-rotate-12 @3xs:even:-translate-y-2':
                            brand.promotions.length > 2,
                        }"
                        :style="`z-index: ${brand.promotions.length - index}`"
                      >
                        <img
                          v-if="item.sm || item.md"
                          :src="item.sm || item.md"
                          :alt="item.alt || brand.brand_name"
                          loading="lazy"
                          class="h-full w-full object-cover"
                        />
                      </div>

                      <div
                        v-if="brand.promotions.length > 2"
                        class="z-0 hidden size-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-gray-200/50 @3xs:flex @3xs:rotate-12 dark:border-transparent dark:bg-gray-800"
                      >
                        <span class="text-primary text-base"
                          >+{{ brand.promotions.length - 2 }}</span
                        >
                      </div>
                    </div>
                  </div>
                  <!-- <div class="mt-auto">
                    <div class="w-full">
                      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span
                          class="text-muted-foreground line-clamp-1 text-xs tracking-tight"
                          v-tippy="
                            $dayjs(brand.created_at).format('MMMM D, YYYY [at] h:mm A')
                          "
                        >
                          <span class="hidden sm:inline">{{ $t("ui.created") }} </span>
                          {{ $dayjs(brand.created_at).fromNow() }}
                        </span>

                        <span
                          v-if="brand.views_count"
                          class="text-muted-foreground line-clamp-1 flex items-center gap-x-0.5 text-xs tracking-tight"
                          v-tippy="
                            $t('ui.views', brand.views_count, {
                              n: brand.views_count,
                            })
                          "
                        >
                          <Icon name="hugeicons:view" class="size-4" />
                          <span>{{ brand.views_count }}</span>
                        </span>
                      </div>
                    </div>
                  </div> -->
                </CardNotch>
              </div>
            </template>
            <BrandAndManyMore />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { h, computed, resolveComponent } from "vue";
import GridFill from "./ui/grid-fill/GridFill.vue";
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
