import { watch } from "vue";
import { countries } from "./countries";

/**
 * Keeps a country answer in step with the respondent's phone number until they
 * pick a country themselves.
 *
 * Someone who has just typed a +62 number should not have to say they are in
 * Indonesia too, so a blank country is filled from the dial code. It keeps
 * following the number for as long as the answer is still the one filled in -
 * correcting the dial code from +62 to +86 moves it to China - and stops for
 * good once the respondent chooses something else. A country that arrived with
 * the record is theirs from the start and is never touched.
 *
 * `phone` and `country` are getters so this works against any value map;
 * `apply` writes the new answer back however the caller stores it.
 * `usePhoneCountry` is auto-imported; every repo sharing this folder ships it.
 */
export function usePhoneSeededCountry(
  phone: () => string | null | undefined,
  country: () => unknown,
  apply: (label: string) => void
): void {
  const { getCountryCode } = usePhoneCountry();
  let filledIn: string | null = null;

  watch(
    phone,
    (number) => {
      if (!number) return;

      const current = country();
      if (current && current !== filledIn) return;

      const iso = getCountryCode(number);
      const label = iso ? (countries.find((row) => row.value === iso)?.label ?? "") : "";
      if (!label) return;

      filledIn = label;
      if (label !== current) apply(label);
    },
    { immediate: true }
  );
}
