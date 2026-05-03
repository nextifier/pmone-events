import { setResponseHeader } from "h3";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("beforeResponse", (event) => {
    const status = event.node.res.statusCode;
    if (status >= 400) {
      setResponseHeader(event, "X-Robots-Tag", "noindex, nofollow");
    }
  });
});
