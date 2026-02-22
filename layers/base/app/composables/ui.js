import { defineStore } from 'pinia'

export const useUiStore = defineStore("ui", {
  state: () => ({
    isEmbedVideoDialogOpen: false,
    embedVideoSrc: null,

    // isInquiryDialogOpen: false,

    dialogRundown: {
      isShow: false,
      data: {},
    },
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

    // openInquiryDialog() {
    //   this.isInquiryDialogOpen = true;
    // },
    // closeInquiryDialog() {
    //   this.isInquiryDialogOpen = false;
    // },

    setDialogRundown({ isShow, data = {} }) {
      this.dialogRundown = { isShow, data };
    },
    clearDialogRundown() {
      this.dialogRundown = {
        isShow: false,
        data: {},
      };
    },
  },
});
