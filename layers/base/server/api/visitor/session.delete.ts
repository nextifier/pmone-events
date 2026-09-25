/** Sign out: end the session at PM One and drop the cookie. */
export default defineEventHandler(async (event) => {
  try {
    if (visitorToken(event)) {
      await visitorFetch(event, "/visitor-session", { method: "DELETE" });
    }
  } catch {
    // Already gone upstream; the cookie still goes.
  }
  clearVisitorToken(event);
  return { message: "Signed out" };
});
