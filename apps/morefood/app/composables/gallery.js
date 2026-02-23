import { defineStore } from "pinia";

export const useGalleryStore = defineStore("gallery", {
  state: () => ({
    images: [],
  }),
});
