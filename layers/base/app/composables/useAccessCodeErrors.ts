/**
 * Human-readable mapping for access code validation error codes.
 * Mirrors the error codes returned by /api/public/tickets/validate-access-code.
 */
export const useAccessCodeErrors = () => ({
  INVALID_CODE: "Access code not found.",
  REVOKED: "This access code has been revoked.",
  NOT_YET_VALID: "This access code is not yet valid.",
  EXPIRED: "This access code has expired.",
  USAGE_LIMIT_REACHED: "This access code has reached its usage limit.",
  PER_EMAIL_LIMIT_REACHED:
    "You've already used this access code the maximum number of times.",
  BIND_EMAIL_MISMATCH: "This access code is tied to a different email address.",
  BIND_PHONE_MISMATCH: "This access code is tied to a different phone number.",
  TICKET_NOT_UNLOCKED: "This access code does not unlock the selected ticket.",
  QTY_EXCEEDS_REDEMPTION_LIMIT: "You've requested more tickets than this code allows.",
  STACKING_NOT_ALLOWED: "This access code cannot be combined with a promo code.",
  WRONG_EVENT: "This access code is for a different event.",
  TOO_MANY_ATTEMPTS:
    "Too many incorrect codes were tried from your connection. Wait a few minutes and try again.",
} as Record<string, string>);
