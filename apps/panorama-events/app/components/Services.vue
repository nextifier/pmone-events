<template>
  <section>
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span class="tracking-tight"
          ><span class="text-gradient-accent font-mediumt bg-linear-to-r"
            >Services </span
          >✨</span
        >
        <h2 class="section-title">
          Personalized Service,
          <span class="text-gradient-accent">Perfect Events</span>
        </h2>
        <p class="section-description mt-3">
          Choose only the service you need! We're flexible. Contact us with your
          requirements, and we'll find the perfect solution for you.
        </p>
      </div>

      <div
        class="mt-10 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      >
        <div
          v-for="(item, index) in services"
          :key="index"
          class="bg-muted/50 flex flex-col items-start gap-y-3 rounded-2xl px-4 py-8 sm:px-6"
        >
          <Icon
            v-if="item.iconName"
            :name="item.iconName"
            class="text-accent mb-1 size-7"
          />
          <span
            class="text-primary text-lg font-semibold tracking-tighter sm:text-xl"
            >{{ item.title }}</span
          >
          <span class="text-primary/70 tracking-tight">{{
            item.description
          }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const services = [
  {
    title: "Team Building & Retreats",
    description: `We design dynamic team building activities and inspiring retreats that strengthen bonds and supercharge collaboration within your team.`,
    iconName: "hugeicons:user-group",
  },
  {
    title: "Employee Engagement Journeys",
    description: `Crafting immersive and memorable journeys packed with engaging experiences designed to deeply connect employees with your company values and each other.`,
    iconName: "hugeicons:user-star-01",
  },
  {
    title: "Wellness & Motivation Camps",
    description: `Recharge and motivate your team with our wellness camps, offering activities that promote well-being, reduce stress, and inspire a positive mindset.`,
    iconName: "hugeicons:stars",
  },
  {
    title: "Leadership & Development Workshops",
    description: `We seamlessly integrate impactful leadership and development workshops into your outing, fostering new skills and perspectives in an engaging, non-traditional setting.`,
    iconName: "hugeicons:champion",
  },
  {
    title: "CSR & Social Impact Outings",
    description: `Create a meaningful impact together with our CSR outings, allowing your team to contribute to important social causes while building stronger internal connections.`,
    iconName: "hugeicons:give-blood",
  },
  {
    title: "Family Days & Large Gatherings",
    description: `We organize fun-filled Family Days and large corporate gatherings that celebrate your team and foster an inclusive, welcoming company community for employees and their loved ones.`,
    iconName: "hugeicons:favourite-square",
  },
  {
    title: "Venue & Hotel Finding",
    description: `Let us expertly source and secure the perfect backdrop for your outing, from inspiring venues to comfortable hotels, all tailored to your needs and budget.`,
    iconName: "hugeicons:hotel-01",
  },
  {
    title: "Talent Production",
    description: `We source and manage talented performers, engaging speakers, and expert facilitators to add that extra spark and professional polish to your corporate outing.`,
    iconName: "hugeicons:star-circle",
  },
  {
    title: "Creative Design & Documentation",
    description: `Our creative team handles everything from compelling event theme design and branding to capturing all your best moments with professional photos and videos.`,
    iconName: "hugeicons:blend",
  },
  {
    title: "Show & Production Team",
    description: `Our expert show and production team ensures any performances, awards segments, or key presentations during your outing are flawlessly executed with professional flair.`,
    iconName: "hugeicons:layers-01",
  },
  {
    title: "Ground Handling",
    description: `We meticulously manage all on-the-ground logistics at your chosen destination, including local transportation and coordination, for a smooth experience from arrival to departure.`,
    iconName: "hugeicons:bus-01",
  },
  {
    title: "Budget Management",
    description: `We provide transparent and meticulous budget management throughout the planning process, ensuring your corporate outing delivers maximum value without any surprises.`,
    iconName: "hugeicons:money-bag-02",
  },
  {
    title: "On-site Management",
    description: `Our dedicated and experienced on-site management team is always present to oversee every detail during your outing, ensuring everything runs smoothly so you can relax and participate.`,
    iconName: "hugeicons:system-update-02",
  },
  {
    title: "Travel Agent",
    description: `As your dedicated corporate travel agent, we expertly handle all your group's travel bookings, from flights and visas to complex multi-destination itineraries.`,
    iconName: "hugeicons:airplane-01",
  },
];
</script>
