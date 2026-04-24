<template>
  <section id="experiences" class="space-y-8 lg:space-y-16">
    <div v-for="(category, index) in categories" :key="index">
      <div class="container">
        <h1 class="section-title">{{ category.title }}</h1>
        <p v-if="category.description" class="section-description mt-2">
          {{ category.description }}
        </p>
      </div>

      <ExperienceSlider class="mt-4 lg:mt-6" :items="category.list" />
    </div>
  </section>
</template>

<script setup>
const experiences = useExperienceStore();

const categories = [
  {
    title: "Chill & Heal",
    description:
      "Mau camping atau sekadar main seharian? Bisa banget! Pilih paket yang paling pas buat kamu, mau sendiri, berdua, atau sama geng kecilmu. Dijamin seru!",
    list: experiences.getItemsByCategories("Paket Personal"),
  },
  {
    title: "Let's Get Active!",
    description:
      "Yuk, gerak! Taklukkan danau Jatiluhur dengan berbagai water activities dari CampX. Challenge yourself dan rasain sensasi petualangan yang beda!",
    list: experiences.getItemsByCategories("Activity"),
  },
  {
    title: "Rame-rame Lebih Asik!",
    description:
      "Mau ngadain outing kantor, community gathering, atau liburan bareng geng segambreng? Paket grup kami siap bikin acaramu jadi memorable dan anti ribet. The more the merrier!",
    list: experiences.getItemsByCategories("Paket Grup"),
  },
];
</script>
