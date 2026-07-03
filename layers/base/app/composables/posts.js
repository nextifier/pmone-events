import { defineStore } from 'pinia'

export const usePostStore = defineStore("posts", {
  state: () => ({
    posts: [],
    pending: false,
    error: null,
    hasFetchedPosts: false,
    lastFetchedLocale: null,
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 50,
      total: 0,
    },
  }),
  actions: {
    /**
     * Mengambil daftar postingan dengan pagination.
     * @param {Object} [options={}] - Opsi untuk fetch.
     * @param {number} [options.page=1] - Halaman yang akan diambil.
     * @param {boolean} [options.force=false] - Paksa fetch ulang bahkan jika data sudah ada.
     */
    async fetchPosts({ page = 1, force = false } = {}) {
      // Skip if already pending
      if (this.pending) {
        return;
      }

      const locale = useNuxtApp().$i18n?.locale?.value || "en";

      // Skip if already fetched same page in the same locale and not forced
      if (
        this.hasFetchedPosts &&
        !force &&
        page === this.meta.current_page &&
        locale === this.lastFetchedLocale
      ) {
        return;
      }

      this.pending = true;
      this.error = null;

      try {
        // Use $fetch instead of useFetch since this action can be called
        // after component is mounted (e.g., during search or pagination)
        const response = await $fetch("/api/blog/posts", {
          query: {
            page,
            per_page: 50,
            sort: "-published_at",
            locale,
          },
        });

        // PM One returns { data: [...], meta: {...} }
        if (response?.data) {
          this.posts = response.data;
          this.hasFetchedPosts = true;
          this.lastFetchedLocale = locale;
        }

        if (response?.meta) {
          this.meta = response.meta;
        }
      } catch (err) {
        this.error = {
          message: err?.message || 'An error occurred',
          status: err?.status || err?.statusCode || null,
        };
        console.error("Fetching posts failed: ", err);
      } finally {
        this.pending = false;
      }
    },

    /**
     * Mengubah halaman dan fetch data.
     * @param {number} page - Halaman yang akan diambil.
     */
    async goToPage(page) {
      await this.fetchPosts({ page, force: true });
    },

    /**
     * Mencari postingan berdasarkan kata kunci.
     * @param {string} searchTerm - Kata kunci pencarian.
     * @param {Object} [options={}] - Opsi untuk search.
     * @param {number} [options.page=1] - Halaman yang akan diambil.
     */
    async searchPosts(searchTerm, { page = 1 } = {}) {
      if (!searchTerm || searchTerm.trim() === "") {
        return;
      }

      this.pending = true;
      this.error = null;

      const locale = useNuxtApp().$i18n?.locale?.value || "en";

      try {
        // Use $fetch instead of useFetch since this action is called
        // after component is mounted (during user search interaction)
        const response = await $fetch("/api/blog/posts", {
          query: {
            search: searchTerm.trim(),
            page,
            per_page: 50,
            sort: "-published_at",
            locale,
          },
        });

        if (response?.data) {
          this.posts = response.data;
          this.lastFetchedLocale = locale;
        }

        if (response?.meta) {
          this.meta = response.meta;
        }
      } catch (err) {
        this.error = {
          message: err?.message || 'An error occurred',
          status: err?.status || err?.statusCode || null,
        };
        console.error("Searching posts failed: ", err);
      } finally {
        this.pending = false;
      }
    },

    /**
     * Reset state dan fetch ulang posts tanpa search.
     */
    async clearSearch() {
      await this.fetchPosts({ page: 1, force: true });
    },
  },
});
