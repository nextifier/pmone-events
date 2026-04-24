import { defineStore } from "pinia";

export const useUiStore = defineStore("ui", {
  state: () => ({
    isEmbedVideoDialogOpen: false,
    embedVideoSrc: null,

    dialogRundown: {
      isShow: false,
      data: {},
    },

    isContactDialogOpen: false,

    isShortsDialogOpen: false,
    shortsVideoSrc: null,

    isEventGalleryDialogOpen: false,
  }),
  actions: {
    openEmbedVideoDialog(src) {
      this.embedVideoSrc = src;
      this.isEmbedVideoDialogOpen = true;
    },
    closeEmbedVideoDialog() {
      this.isEmbedVideoDialogOpen = false;
      this.embedVideoSrc = null;
    },

    setDialogRundown({ isShow, data = {} }) {
      this.dialogRundown = { isShow, data };
    },
    clearDialogRundown() {
      this.dialogRundown = {
        isShow: false,
        data: {},
      };
    },

    openContactDialog() {
      this.isContactDialogOpen = true;
    },
    closeContactDialog() {
      this.isContactDialogOpen = false;
    },

    openShortsDialog(src) {
      this.shortsVideoSrc = src;
      this.isShortsDialogOpen = true;
    },
    closeShortsDialog() {
      this.isShortsDialogOpen = false;
      this.shortsVideoSrc = null;
    },

    openEventGalleryDialog() {
      this.isEventGalleryDialogOpen = true;
    },
    closeEventGalleryDialog() {
      this.isEventGalleryDialogOpen = false;
    },
  },
});
