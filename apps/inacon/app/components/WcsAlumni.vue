<template>
  <section class="container">
    <div class="flex flex-col items-center text-center">
      <h2 class="section-title">{{ $t("icgp.wallOfFame") }}</h2>

      <p
        class="mt-2 text-lg tracking-tight text-black sm:text-xl dark:text-white"
      >
        {{ $t("icgp.wallOfFameSubtitle") }}
      </p>
    </div>

    <Stepper
      orientation="vertical"
      class="mt-6 grid w-full grid-cols-1 gap-y-8 lg:mt-16 lg:gap-y-20"
    >
      <StepperItem
        v-for="(item, index) in items.slice().reverse()"
        :key="index"
        class="relative flex w-full items-start gap-x-3 lg:gap-x-6"
        :step="index + 1"
        v-slot="{ state }"
      >
        <StepperSeparator
          class="absolute top-0 left-[1.25rem] block w-px shrink-0 rounded-full bg-gray-200 !opacity-100 group-data-[state=active]:bg-gray-200 group-data-[state=completed]:bg-gray-200 group-data-[state=inactive]:bg-gray-200 dark:bg-gray-800 dark:group-data-[state=active]:bg-gray-800 dark:group-data-[state=completed]:bg-gray-800 dark:group-data-[state=inactive]:bg-gray-800"
          :class="
            index != Object.keys(items).length - 1
              ? 'h-[calc(100%+2rem)] lg:h-[calc(100%+5rem)]'
              : 'h-full'
          "
        />

        <StepperTrigger as-child>
          <Button
            variant="outline"
            size="icon"
            class="z-10 size-10 shrink-0 rounded-full border-gray-300 bg-white !opacity-100 dark:border-gray-800 dark:bg-gray-950"
          >
            <Dot />
          </Button>
        </StepperTrigger>

        <div class="flex flex-col">
          <StepperTitle></StepperTitle>
          <StepperDescription> </StepperDescription>

          <div
            class="3xl:gap-x-12 grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2 xl:gap-x-8"
          >
            <div class="flex flex-col lg:pt-2">
              <span
                class="text-xl font-bold tracking-tighter text-black sm:text-2xl dark:text-white"
                >{{ item.title }}</span
              >

              <span
                class="mt-1 text-base font-medium tracking-tight text-black sm:text-lg dark:text-white"
                >{{ item.names }}</span
              >

              <div
                class="mt-4 aspect-[1620/1080] w-full overflow-hidden rounded-lg bg-gray-100 lg:hidden dark:bg-gray-900"
              >
                <NuxtImg
                  :src="item.img"
                  :alt="item.title"
                  class="h-full w-full object-cover"
                  width="1620"
                  height="1080"
                  loading="lazy"
                  format="webp"
                />
              </div>

              <div class="hidden w-full grid-cols-1 lg:grid">
                <div>
                  <div
                    class="format-html tracking-tight [&_iframe]:aspect-video [&_iframe]:w-full"
                    v-html="item.body"
                  ></div>
                </div>

                <div
                  v-if="item.notes"
                  class="text-xs !leading-normal text-gray-500 italic sm:text-sm dark:text-gray-400"
                  v-html="item.notes"
                ></div>
              </div>
            </div>

            <div class="grid w-full grid-cols-1 lg:hidden">
              <div>
                <div
                  class="format-html tracking-tight"
                  v-html="item.body"
                ></div>
              </div>

              <div
                v-if="item.notes"
                class="text-xs !leading-normal text-gray-500 italic sm:text-sm dark:text-gray-400"
                v-html="item.notes"
              ></div>
            </div>

            <div
              class="hidden aspect-[1620/1080] w-full overflow-hidden rounded-lg bg-gray-100 lg:order-first lg:block dark:bg-gray-900"
            >
              <NuxtImg
                :src="item.img"
                :alt="item.title"
                class="h-full w-full object-cover"
                width="1620"
                height="1080"
                loading="lazy"
                format="webp"
              />
            </div>
          </div>
        </div>
      </StepperItem>
    </Stepper>

    <div class="mt-10 flex flex-col items-center lg:mt-16">
      <LogoIcgp class="h-32 w-auto text-black dark:text-white" />

      <h2 class="section-title mt-6 text-center">
        {{ $t("icgp.wallOfFameCta") }}
      </h2>
    </div>
  </section>
</template>

<script setup>
import { Dot } from "lucide-vue-next";

const items = [
  {
    title: "World Cosplay Summit 2012",
    names: "Konnichi Kurenai & Zhuge Kamiya",
    img: "/img/wcs/wcs-2012.jpg",
    body: `
      <p>Konnichi Kurenai and Zhuge Kamiya made history as the first Indonesian duo to represent Indonesia at the World Cosplay Summit 2012.</p>
      <p>Living in Bandung, Konnichi Kurenai joined forces with Zhuge Kamiya from Jakarta for the event. Their cosplay performance featured characters from the Mobile Police Patlabor series, with Konnichi portraying AV-98 Ingram and Zhuge as Type-J9 Griffon. Impressively, they secured Third Place and the Bushiroad Award during the competition.</p>
    `,
  },
  {
    title: "World Cosplay Summit 2013",
    names: "Echow Eko & Zai Naru",
    img: "/img/wcs/wcs-2013.jpg",
    body: `
      <p>Echow Eko and Zai Naru, representatives from Jakarta, emerged victorious in the Indonesia Cosplay Grand Prix competition. Their win secured their spot as Indonesia's second representative at the World Cosplay Summit 2013.</p>
      <p>During the event, they showcased a performance based on Kingdom Hearts by Sleep, with Echow Eko portraying Ventus and Zai Naru as Vanitas. Their character choice stemmed from their mutual admiration for the game, which they brought to life on World Cosplay Summit 2013 stage. Echow Eko has been cosplaying since 2006, while Zai Naru started in 2008.</p>
    `,
  },
  {
    title: "World Cosplay Summit 2014",
    names: "Ryan Ang & Darma",
    img: "/img/wcs/wcs-2014.jpg",
    body: `
      <p>During the World Cosplay Summit 2014, Ryan Ang and Darma proudly represented Indonesia by embodying characters from Onimusha 3: Demon Siege. Darma assumed the role of Oda Nobunaga, while Ryan Ang portrayed Samanosuke.</p>
      <p>Their outstanding performance secured them Third Place in the competition and also garnered them the prestigious Joysound Award.</p>
    `,
  },
  {
    title: "World Cosplay Summit 2015",
    names: "John Switch & Yonchan",
    img: "/img/wcs/wcs-2015.jpg",
    body: `
      <p>John Switch and Yonchan were the representatives of the Yogyakarta region in the Indonesia Cosplay Grand Prix 2015 competition.</p>
      <p>Their remarkable performance led them to claim victory, earning them the opportunity to represent Indonesia at the esteemed World Cosplay Summit 2015 in Nagoya, Japan.</p>
      <p>During this eventful year, they skillfully portrayed characters from Silent Hill, with John Switch embodying Incubus and Yonchan assuming the role of Harry Mason.</p>
    `,
  },
  {
    title: "World Cosplay Summit 2016",
    names: "Rian Cyd & Frea Mai",
    img: "/img/wcs/wcs-2016.jpg",
    body: `
      <p>Rian CYD, a cosplayer from Jakarta, has been cosplaying since 2009, while Frea Mai started in 2006. Together, they formed a team and participated in the Indonesia Cosplay Grand Prix competition, and succeeded in winning the competition and representing Indonesia at the World Cosplay Summit in Nagoya, Japan.</p>
      <p>During the event, they showcased a performance from Trinity Blood, with Rian CYD portraying Cain Knightlord and Frea Mai as Seth. Indonesia achieved a historic milestone by securing the prestigious First Place title at World Cosplay Summit 2016, marking them as the inaugural World Cosplayer Champions from Indonesia.</p>
      <p>During the same event, they were also honored with the Alumni Award and Nico Nico Douga Award.</p>
    `,
  },
  {
    title: "World Cosplay Summit 2017",
    names: "Dimboyz & Wawa",
    img: "/img/wcs/wcs-2017.jpg",
    body: `
      <p>Dimboyz embarked on their cosplay journey in 2011, whereas their partner Wawa started in 2009. They proudly represented Bandung at the Indonesia Cosplay Grand Prix, where they emerged victorious and secured the title of Indonesia's representatives for the World Cosplay Summit 2017.</p>
      <p>In their Dark Souls II presentation, Dimboyz played as Faraam while Wawa took on the role of Nashandra. They selected these characters, due to their appeal to enthusiasts of armor, monsters, and unique character designs.</p>
    `,
  },
  {
    title: "World Cosplay Summit 2018",
    names: "Yumaki & iBun",
    img: "/img/wcs/wcs-2018.jpg",
    body: `
      <p>Yumaki and iBun were chosen as representatives from Yogyakarta at the Indonesia Cosplay Grand Prix and later went on to become Indonesia's representatives at the World Cosplay Summit 2018.</p>
      <p>During the event, they showcased Dynasty Warrior III, with Yumaki portraying Orochi X and iBun as Hanbei Takenaka. Their performance earned them Second Place and Azure Lane Award at World Cosplay Summit 2018.</p>
    `,
  },
  {
    title: "World Cosplay Summit 2019",
    names: "Gerard & Gilbert",
    img: "/img/wcs/wcs-2019.jpg",
    body: `
      <p>Gerard and Gilbert, who represented Yogyakarta in the Indonesia Cosplay Grand Prix 2019, emerged victorious and secured Indonesia's spot at the 2019 World Cosplay Summit, making them the official representatives of Indonesia for the event.</p>
      <p>Aside from being the youngest participants in their cycle, renowned for their distinctive style. The Twins gained popularity among international participants at the World Cosplay Summit 2019. During the event, they portrayed the characters Soulcalibur VI, Gerard played as Yoshimitsu, and Gilbert took on the role of as Nightmare. They have both been cosplaying since 2016.</p>
    `,
  },
  {
    title: "World Cosplay Summit 2021 (Video Competition)",
    names: "Gerard & Gilbert",
    img: "/img/wcs/wcs-2021-video-competition.jpg",
    body: `
      <p>Gerard and Gilbert emerged triumphant in the Indonesia Cosplay Grand Prix online selection, as representatives of Indonesia's.</p>
      <p>Their standout display in the World Cosplay Summit - Video Competition. Gerard assumed the role of Son Gohan, while Gilbert portrayed Cell from Dragon Ball Z. Securing First Place in the Super Massive Global Award category, which is the first category in the long journey of World Cosplay Summit.</p>
    `,
    notes: `
      <p>During the global pandemic COVID-19, the World Cosplay Summit has shifted from its traditional offline format to an online video format in response to the prevailing circumstances.</p>
    `,
  },
  {
    title: "World Cosplay Summit 2022 (Video Competition)",
    names: "Anggoro Dwi & Momo R",
    img: "/img/wcs/wcs-2022-video-competition.jpg",
    body: `
      <p>Amid the ongoing global pandemic Covid-19, World Cosplay Summit still organizing competitions in video format. Through country selection, Anggoro Dwi and Momo R were chosen as the winners and automatically appointed as Indonesia's representatives.</p>
      <p>They showcased a performance inspired by Samurai Warriors 5, with Anggoro portraying Akechi Mitsuhide and Momo R as Oda Nobunaga. Their performance earned them the Action Award category at World Cosplay Summit 2022 - Video Competition.</p>
    `,
    notes: `
      <p>During the global pandemic COVID-19, the World Cosplay Summit has shifted from its traditional offline format to an online video format in response to the prevailing circumstances.</p>
    `,
  },
  {
    title: "World Cosplay Summit 2022 (Saudi Arabia)",
    names: "Rian CYD & Yumaki",
    img: "/img/wcs/wcs-2022-saudi-arabia.jpg",
    body: `
      <p>In 2022, the World Cosplay Summit competition returned after the global pandemic hiatus since 2020, this time hosted in Saudi Arabia.</p>
      <p>Rian CYD and Yumaki had the honorary invitation of representing Indonesia at the World Cosplay Summit in Saudi Arabia. They dove into Dragon Ball Xenoverse, where Rian CYD assumed the role of Goku SSJ4 look while Yumaki transformed into Perfect Cell!</p>
      <p>Indonesia achieved a remarkable victory, securing the top spot out of 36 participating countries. Rian CYD and Yumaki were crowned as the World Cosplayer Champions, bringing glory to Indonesia once again.</p>
    `,
  },
  {
    title: "World Cosplay Summit 2023",
    names: "Mizuki & Bale",
    img: "/img/wcs/wcs-2023.jpg",
    body: `
      <p>Mizuki and Bale, representing Bandung, have qualified successfully. Their victory at the Indonesia Cosplay Grand Prix earned them the opportunity to represent Indonesia at the World Cosplay Summit 2023 in Nagoya, Japan.</p>
      <p>Their performance, themed around Ninja Gaiden, featured Mizuki as Hayabusa and Bale as Yaiba. Moreover, they were awarded the Best Action category at World Cosplay Summit 2023.</p>
      <p>Mizuki has been cosplaying since 2011, while Bale started in 2013.</p>
      <figure>
        <iframe
        src="https://www.youtube.com/embed/FPTj8q3OCSs"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
        loading="lazy"
        ></iframe>  
        <figcaption class="text-center">Official Trailer - World Cosplay Summit 2023</figcaption>
      </figure>
      <figure>
        <iframe
        src="https://www.youtube.com/embed/q5zr0vj5MCk"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
        loading="lazy"
        ></iframe>
        <figcaption class="text-center">End Credit - World Cosplay Summit 2023</figcaption>
      </figure>
    `,
  },
  {
    title: "Gamers8 Cosplay Cup (Saudi Arabia) － Supported by WCS",
    names: "Unu & Ochi",
    img: "/img/wcs/wcs-2023-saudi-arabia.jpg",
    body: `
      <p>Unu and Ochi, who represented Malang, clinched Second Place in the ICGP 2023 finals at the Indonesia Comic Con – Pop Asia event.</p>
      <p>In 2023, the World Cosplay Summit for the first time it was held twice in Nagoya, Japan, and Saudi Arabia. Unu and Ochi were chosen as Indonesia's representatives for the World Cosplay Summit - Saudi Arabia.</p>
      <p>In their performance based on Princess Mononoke, Unu took on the role of Princess Mononoke while Ochi portrayed Ashitaka, leading them to secure Fourth Place in the competition.</p>
    `,
  },
  {
    title: "World Cosplay Summit 2024",
    names: "Allie Nia & Nanami",
    img: "/img/wcs/wcs-2024.jpg",
    body: `
      <p>From Pekanbaru, Allie Nia and Nanami dazzled the stage, claiming First Place in the Indonesia Cosplay Grand Prix finals and proudly representing Indonesia at the World Cosplay Summit.</p>
      <p>Their breathtaking performance brought Puella Magi Madoka Magica to life, with Allie Nia embodying the stoic resolve of Homura Akemi and Nanami radiating the pure spirit of Madoka Kaname. The duo’s artistry and emotional storytelling captivated audiences, weaving magic and intensity into every moment.</p>
      <p>Making history as the first all-female team from Indonesia to embark on this journey, they carried not only their characters but also the hopes of a nation, proving that passion and creativity know no boundaries.</p>
      <figure>
        <iframe
        src="https://www.youtube.com/embed/QqBe8EndbLI"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
        loading="lazy"
        ></iframe>
        <figcaption class="text-center">Official Trailer - World Cosplay Summit 2024</figcaption>
      </figure>
      <figure>
        <iframe
        src="https://www.youtube.com/embed/vNzS4Xz-2wk"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
        loading="lazy"
        ></iframe> 
        <figcaption class="text-center">Final & Costume Judging World Cosplay Summit 2024</figcaption>
      </figure>
      <figure>
        <iframe
        src="https://www.youtube.com/embed/AqOu2UvDIMA"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
        loading="lazy"
        ></iframe>
        <figcaption class="text-center">End Credit - World Cosplay Summit 2024</figcaption>
      </figure>
      <figure>
        <iframe
        src="https://www.youtube.com/embed/S3DEYY5Y07A"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
        loading="lazy"
        ></iframe>
        <figcaption class="text-center">WORLD COSPLAY SUMMIT 2025｜World Cosplay Championship ver. Official Trailer (English Ver.)</figcaption>
      </figure>
      <figure>
        <iframe
        src="https://www.youtube.com/embed/5NwencBmg6g"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
        loading="lazy"
        ></iframe> 
        <figcaption class="text-center">インドネシア / INDONESIA - WORLD COSPLAY CHAMPIONSHIP 2024 | WORLD COSPLAY SUMMIT2024 (世界コスプレサミット2024)</figcaption>
      </figure>
    `,
  },
  {
    title: "World Cosplay Summit 2025",
    names: "Camellia Zahra & Kagami Yuuto",
    img: "/img/wcs/wcs-2025.jpg",
    body: `
      <p>From the heart of Central Java, Camellia Zahra and Kagami Yuuto rose to victory, claiming First Place in the Indonesia Cosplay Grand Prix finals and earning the honor of representing Indonesia at the World Cosplay Summit.</p>
      <p>Their electrifying performance brought the world of Jujutsu Kaisen to life, leaving the audience breathless with its intensity. Camellia Zahra embodied the fierce determination of Maki Zenin, while Kagami Yuuto captured the cunning presence of Naoya Zenin. Together, they delivered a spectacle of weapon-based combat and striking character design that resonated deeply with fans.</p>
      <p>This dynamic duo now carries Indonesia’s flag to the global stage, continuing the legacy of unforgettable performances and proving once again that Indonesian cosplayers are a force to be reckoned with.</p>
      <figure>
        <iframe
        src="https://www.youtube.com/embed/ILtS6NDAGPk"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
        loading="lazy"
        ></iframe> 
        <figcaption class="text-center">インドネシア / Indonesia - WORLD COSPLAY CHAMPIONSHIP 2025 | WORLD COSPLAY SUMMIT2025 (世界コスプレサミット2025)</figcaption>
      </figure>
      <figure>
        <iframe
        src="https://www.youtube.com/embed/ZLdRdIUOyBU"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
        loading="lazy"
        ></iframe> 
        <figcaption class="text-center">世界コスプレサミット 2026 公式トレーラー | WORLD COSPLAY SUMMIT 2026 OFFICIAL TRAILER</figcaption>
      </figure>
      <figure>
        <iframe
        src="https://www.youtube.com/embed/G0ot7GvgDxM"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
        loading="lazy"
        ></iframe> 
        <figcaption class="text-center">[3rd Aug. 2:30 PM (JST)] World Cosplay Championship 2025 | ワールドコスプレチャンピオンシップ | World Cosplay Summit</figcaption>
      </figure>
      <figure>
        <iframe
        src="https://www.youtube.com/embed/S3DEYY5Y07A"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
        loading="lazy"
        ></iframe> 
        <figcaption class="text-center">WORLD COSPLAY SUMMIT 2025｜World Cosplay Championship ver. Official Trailer (English Ver.)</figcaption>
      </figure>
    `,
  },
];
</script>
