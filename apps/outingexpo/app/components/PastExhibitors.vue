<template>
  <section id="past-exhibitors">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <h2 class="section-title" v-html="$t('pastExhibitors.title')"></h2>

        <p class="section-description mt-3 max-w-2xl">
          {{ $t("pastExhibitors.description") }}
        </p>
      </div>
    </div>

    <Carousel
      v-slot="{ scrollPrev, scrollNext, canScrollPrev, canScrollNext }"
      class="focusable relative overflow-hidden py-5 lg:py-8"
      :opts="{
        loop: true,
        align: 'start',
        dragFree: true,
      }"
      :plugins="[
        $wheelGesturesPlugin(),
        AutoScroll({
          speed: 0.8,
          startDelay: 200,
          stopOnInteraction: false,
        }),
      ]"
    >
      <CarouselContent class="carousel-mx -ml-3 *:select-none">
        <CarouselItem
          v-for="(exhibitor, index) in exhibitors"
          :key="index"
          class="carousel-item basis-auto pl-3"
        >
          <component
            :is="exhibitor.instagram ? 'a' : 'div'"
            :href="
              exhibitor.instagram
                ? `https://instagram.com/${exhibitor.instagram}`
                : undefined
            "
            :target="exhibitor.instagram ? '_blank' : undefined"
            :rel="exhibitor.instagram ? 'noopener noreferrer' : undefined"
            class="group flex flex-col items-center gap-2"
          >
            <div
              class="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full p-[2px] transition sm:size-20 sm:p-[3px]"
              :class="
                exhibitor.instagram
                  ? 'gradient-insta bg-linear-to-tr'
                  : 'bg-border'
              "
            >
              <!-- With profile picture -->
              <NuxtImg
                v-if="exhibitor.instagram_profile_picture"
                :src="`/img/brands/ioe-2025/${exhibitor.instagram_profile_picture}`"
                :alt="exhibitor.brand_name"
                class="size-full rounded-full border-2 border-white bg-white object-cover dark:border-gray-900"
                width="150"
                height="150"
                sizes="80px sm:100px"
                loading="lazy"
                format="webp"
              />
              <!-- Without profile picture - show brand name -->
              <span
                v-else
                class="bg-muted text-foreground border-background flex size-full items-center justify-center rounded-full border-2 px-1 text-center text-[8px] !leading-tight font-medium tracking-tight sm:text-[10px]"
              >
                {{ exhibitor.brand_name }}
              </span>
            </div>
            <span
              class="line-clamp-2 max-w-20 text-center text-xs tracking-tight transition sm:max-w-24 sm:text-sm"
              :class="
                exhibitor.instagram
                  ? 'text-muted-foreground group-hover:text-primary'
                  : 'text-muted-foreground'
              "
            >
              {{ exhibitor.brand_name }}
            </span>
          </component>
        </CarouselItem>
      </CarouselContent>

      <!-- <div class="mt-8 h-8">
        <div
          v-if="canScrollPrev || canScrollNext"
          class="container flex h-full items-center justify-center"
        >
          <ButtonGroup>
            <Button
              variant="outline"
              size="iconSm"
              :disabled="!canScrollPrev"
              aria-label="previous"
              @click="scrollPrev"
            >
              <Icon name="lucide:arrow-left" class="size-4" />
            </Button>
            <Button
              variant="outline"
              size="iconSm"
              :disabled="!canScrollNext"
              aria-label="next"
              @click="scrollNext"
            >
              <Icon name="lucide:arrow-right" class="size-4" />
            </Button>
          </ButtonGroup>
        </div>
      </div> -->
    </Carousel>
  </section>
</template>

<script setup>
import AutoScroll from "embla-carousel-auto-scroll";

const exhibitors = [
  {
    brand_name: "Caldera Adventure",
    slug: "caldera-adventure",
    instagram: "calderaindo",
    instagram_profile_picture: "profile-pictures/caldera-adventure.jpg",
  },
  {
    brand_name: "Camp de Katarina",
    slug: "camp-de-katarina",
    instagram: "campdekatarina",
    instagram_profile_picture: "profile-pictures/camp-de-katarina.jpg",
  },
  {
    brand_name: "Tanjung Lesung Beach & Resort",
    slug: "tanjung-lesung",
    instagram: "tanjunglesung.resort",
    instagram_profile_picture: "profile-pictures/tanjung-lesung.jpg",
  },
  {
    brand_name: "Trans Studio & Trans Snow World",
    slug: "trans-studio-trans-snow",
    instagram: "transstudio.cibubur",
    instagram_profile_picture: "profile-pictures/trans-studio-trans-snow.jpg",
  },
  {
    brand_name: "Sobek Bali",
    slug: "sobek-adventure",
    instagram: "sobek_adventure",
    instagram_profile_picture: "profile-pictures/sobek-adventure.jpg",
  },
  {
    brand_name: "Arei Outdoor Gear",
    slug: "arei-outdoor-gear",
    instagram: "areioutdoorgear",
    instagram_profile_picture: "profile-pictures/arei-outdoor-gear.jpg",
  },
  {
    brand_name: "The Holograil",
    slug: "the-holograil",
    instagram: "theholograil",
    instagram_profile_picture: "profile-pictures/the-holograil.jpg",
  },
  {
    brand_name: "Museum Pasifika",
    slug: "museum-pasifika",
    instagram: "museumpasifika",
    instagram_profile_picture: "profile-pictures/museum-pasifika.jpg",
  },
  {
    brand_name: "Sunsetfalls Gardens & Resort",
    slug: "sunsetfalls-gardens-resort",
    instagram: "sunsetfalls.gardens.resort",
    instagram_profile_picture:
      "profile-pictures/sunsetfalls-gardens-resort.jpg",
  },
  {
    brand_name: "SuperPark Indonesia",
    slug: "superpark-indonesia",
    instagram: "superpark_indo",
    instagram_profile_picture: "profile-pictures/superpark-indonesia.jpg",
  },
  {
    brand_name: "Bobobox",
    slug: "bobobox",
    instagram: "bobobox_id",
    instagram_profile_picture: "profile-pictures/bobobox.jpg",
  },
  {
    brand_name: "BWH Hotels",
    slug: "bwh-hotels",
    instagram: "bestwesternindo",
    instagram_profile_picture: "profile-pictures/bwh-hotels.jpg",
  },
  {
    brand_name: "Atourin",
    slug: "atourin",
    instagram: "atourin",
    instagram_profile_picture: "profile-pictures/atourin.jpg",
  },
  {
    brand_name: "GWK Cultural Park",
    slug: "gwk-cultural-park",
    instagram: "gwkbali",
    instagram_profile_picture: "profile-pictures/gwk-cultural-park.jpg",
  },
  {
    brand_name: "Legenda Khatulistiwa",
    slug: "legenda-khatulistiwa",
    instagram: "legendakhatulistiwa",
    instagram_profile_picture: "profile-pictures/legenda-khatulistiwa.jpg",
  },
  {
    brand_name: "White Horse",
    slug: "white-horse",
    instagram: "whitehorsegroup",
    instagram_profile_picture: "profile-pictures/white-horse.jpg",
  },
  {
    brand_name: "LIT House",
    slug: "lit-house",
    instagram: "lithouse.jkt",
    instagram_profile_picture: "profile-pictures/lit-house.jpg",
  },
  {
    brand_name: "PIK Tourism Board",
    slug: "pik-tourism-board",
    instagram: "piktourism",
    instagram_profile_picture: "profile-pictures/pik-tourism-board.jpg",
  },
  {
    brand_name: "Beanbagjkt",
    slug: "beanbagjkt",
    instagram: "beanbagjkt",
    instagram_profile_picture: "profile-pictures/beanbagjkt.jpg",
  },
  {
    brand_name: "Luna's Doughnuts",
    slug: "luna-s-doughnut",
    instagram: "lunasdoughnuts",
    instagram_profile_picture: "profile-pictures/luna-s-doughnut.jpg",
  },
  {
    brand_name: "Golden Thorn",
    slug: "golden-thorn",
    instagram: "goldenthorn.official",
    instagram_profile_picture: "profile-pictures/golden-thorn.jpg",
  },
  {
    brand_name: "Batoo Farm Adventure",
    slug: "batoo-farm-adventure",
    instagram: "batoo.farmadventure",
    instagram_profile_picture: "profile-pictures/batoo-farm-adventure.jpg",
  },
  {
    brand_name: "Kopi Gans",
    slug: "kopi-gans",
    instagram: "kopi_gans_oemaheyang",
    instagram_profile_picture: "profile-pictures/kopi-gans.jpg",
  },
  {
    brand_name: "SARGA Earthing Resort",
    slug: "sarga-earthing-resort",
    instagram: "sarga.resort",
    instagram_profile_picture: "profile-pictures/sarga-earthing-resort.jpg",
  },
  {
    brand_name: "Rumah Batik Palbatu",
    slug: "rumah-batik-palbatu",
    instagram: "kampoengbatikpalbatu",
    instagram_profile_picture: "profile-pictures/rumah-batik-palbatu.jpg",
  },
  {
    brand_name: "Chef Vincenzo",
    slug: "cucu-oma-elly",
    instagram: "chefvincenzo.id",
    instagram_profile_picture: "profile-pictures/cucu-oma-elly.jpg",
  },
  {
    brand_name: "Kertabumi Recycling Center",
    slug: "kertabumi-recycling-center",
    instagram: "kertabumirecyclingcenter",
    instagram_profile_picture:
      "profile-pictures/kertabumi-recycling-center.jpg",
  },
  {
    brand_name: "Eminence Global",
    slug: "le-eminence",
    instagram: "eminencelembang",
    instagram_profile_picture: "profile-pictures/le-eminence.jpg",
  },
  {
    brand_name: "Bluebird Group",
    slug: "blue-bird",
    instagram: "bluebirdgroup",
    instagram_profile_picture: "profile-pictures/blue-bird.jpg",
  },
  {
    brand_name: "Re.juve",
    slug: "rejuve",
    instagram: "rejuveid",
    instagram_profile_picture: "profile-pictures/rejuve.jpg",
  },
  {
    brand_name: "Pantai Pandawa Bali",
    slug: "pantai-pandawa",
    instagram: "pantaipandawabali",
    instagram_profile_picture: "profile-pictures/pantai-pandawa.jpg",
  },
  {
    brand_name: "JOOi Indonesia",
    slug: "jooi-indonesia",
    instagram: "jooi.id",
    instagram_profile_picture: "profile-pictures/jooi-indonesia.jpg",
  },
  {
    brand_name: "CampX",
    slug: "campx",
    instagram: "campx.id",
    instagram_profile_picture: "profile-pictures/campx.jpg",
  },
  {
    brand_name: "Royal Safari Garden",
    slug: "royal-safari-garden",
    instagram: "royalsafari_garden",
    instagram_profile_picture: "profile-pictures/royal-safari-garden.jpg",
  },
  {
    brand_name: "Pesona Wisata Globalindo",
    slug: "pesona-wisata-globalindo",
    instagram: "pesonawisataglobalindo",
    instagram_profile_picture: "profile-pictures/pesona-wisata-globalindo.jpg",
  },
  {
    brand_name: "Satguru Travel Indonesia",
    slug: "satguru-travel-indonesia",
    instagram: "satgurutravel.id",
    instagram_profile_picture: "profile-pictures/satguru-travel-indonesia.jpg",
  },
  {
    brand_name: "Hotel Borobudur Jakarta",
    slug: "hotel-borobudur-jakarta",
    instagram: "hotelborobudurjakarta",
    instagram_profile_picture: "profile-pictures/hotel-borobudur-jakarta.jpg",
  },
  {
    brand_name: "EazyGo",
    slug: "eazygo",
    instagram: "eazygo_id",
    instagram_profile_picture: "profile-pictures/eazygo.jpg",
  },
  {
    brand_name: "PT Inti Jasa Kreatif",
    slug: "pt-inti-jasa-kreatif",
    instagram: "pt.intijasakreatif",
    instagram_profile_picture: "profile-pictures/pt-inti-jasa-kreatif.jpg",
  },
  {
    brand_name: "Indonesia Science Center",
    slug: "indonesia-science-center-pp-iptek-tmii-jakartaindonesia-science-center-pp-iptek-tmii-jakarta",
    instagram: "ppiptek",
    instagram_profile_picture:
      "profile-pictures/indonesia-science-center-pp-iptek-tmii-jakartaindonesia-science-center-pp-iptek-tmii-jakarta.jpg",
  },
  {
    brand_name: "Go Virtual Enjoy Jakarta",
    slug: "go-virtual-enjoy-jakarta",
    instagram: "govirtualindonesia",
    instagram_profile_picture: "profile-pictures/go-virtual-enjoy-jakarta.jpg",
  },
  {
    brand_name: "OneAsia Tours Indonesia",
    slug: "oneasia-tours-indonesia",
    instagram: "oneasiatoursindonesia",
    instagram_profile_picture: "profile-pictures/oneasia-tours-indonesia.jpg",
  },
  {
    brand_name: "Jakarta Experience Board",
    slug: "jakarta-experience-board",
    instagram: "jxboard",
    instagram_profile_picture: "profile-pictures/jakarta-experience-board.jpg",
  },
  {
    brand_name: "Transjakarta",
    slug: "transjakarta",
    instagram: "pt_transjakarta",
    instagram_profile_picture: "profile-pictures/transjakarta.jpg",
  },
  {
    brand_name: "Wisata Kreatif Jakarta",
    slug: "wisata-kreatif-jakarta",
    instagram: "wisatakreatifjakarta",
    instagram_profile_picture: "profile-pictures/wisata-kreatif-jakarta.jpg",
  },
  // Brands without profile pictures
  {
    brand_name: "AELI DPD D.I Yogyakarta",
    slug: "aeli-dpd-d-i-yogyakarta",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "Duta Asa Indonesia",
    slug: "duta-asa-indonesia",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "Red Avenue Indonesia",
    slug: "red-avenue-indonesia-alugada",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "Kaniki Action Partner",
    slug: "kaniki-action-partner",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "DUAGE Management",
    slug: "duage-management",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "AELI DPD Jawa Barat",
    slug: "aeli-dpd-jawa-barat",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "AELI DPD Jawa Timur",
    slug: "aeli-dpd-jawa-timur",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "DEBOER",
    slug: "deboer",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "Decathlon",
    slug: "decathlon",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "Souvenirs & Co",
    slug: "souvenir-co",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "Biznet",
    slug: "biznet",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "UNDANGIN",
    slug: "undangin",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "DVS Event",
    slug: "sda",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "Panorama Events",
    slug: "panorama-events",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "Orange Incentive House",
    slug: "orange-incentive-house",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "Panorama Lounge",
    slug: "panorama-lounge",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "MyTrip",
    slug: "mytrip",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "Mitologi Inspira",
    slug: "mitologi-inspira",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "Naugi Tour & Travel",
    slug: "naugi-tour-travel-thephrase-id",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "PHM Hotels",
    slug: "phm-hotels",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "Disparekraf DKI Jakarta",
    slug: "disparekraf-dki-jakarta",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "DPP PUTRI",
    slug: "dpp-putri",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "IVENDO",
    slug: "ivendo",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "AELI",
    slug: "aeli",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "Cleo Pure Water",
    slug: "cleo",
    instagram: null,
    instagram_profile_picture: null,
  },
  {
    brand_name: "Cakrawala Jakarta Kreatif",
    slug: "cakrawala-jakarta-kreatif",
    instagram: null,
    instagram_profile_picture: null,
  },
];
</script>
