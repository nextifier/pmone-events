import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

/**
 * `[&>*:not([data-slot=field-label])]:w-full` rather than `*:w-full`: the label is
 * the one child that must not be stretched. `<FieldLabel>` ships `w-fit`, but
 * `*:w-full` outranks it (0-2-0 against 0-1-0), so every label was silently
 * running the full width of its field - 598px of clickable label for 58px of
 * "Country". Activating a label relays a real click to its control, which is how
 * a click on empty space beside a label ended up opening comboboxes and toggling
 * inputs. Labels that wrap a whole `<Field>` (the 12 checkbox cards) still take
 * `w-full` from FieldLabel's own `has-[>[data-slot=field]]` rule, which outranks
 * `w-fit` in turn.
 */
export const fieldVariants = cva("cn-field group/field flex w-full", {
  variants: {
    orientation: {
      vertical:
        "cn-field-orientation-vertical flex-col [&>*:not([data-slot=field-label])]:w-full [&>.sr-only]:w-auto",
      horizontal:
        "cn-field-orientation-horizontal flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px "
        + "not-has-[>[data-slot=field-content]]:has-[>[role=checkbox]]:items-baseline not-has-[>[data-slot=field-content]]:has-[>[role=radio]]:items-baseline not-has-[>[data-slot=field-content]]:has-[>[role=switch]]:items-baseline not-has-[>[data-slot=field-content]]:[&>[role=checkbox]]:translate-y-[16%] not-has-[>[data-slot=field-content]]:[&>[role=radio]]:translate-y-[16%] not-has-[>[data-slot=field-content]]:[&>[role=switch]]:translate-y-[16%] not-has-[>[data-slot=field-content]]:[&_[data-slot=checkbox-indicator]]:absolute not-has-[>[data-slot=field-content]]:[&_[data-slot=checkbox-indicator]]:top-1/2 not-has-[>[data-slot=field-content]]:[&_[data-slot=checkbox-indicator]]:left-1/2 not-has-[>[data-slot=field-content]]:[&_[data-slot=checkbox-indicator]]:-translate-x-1/2 not-has-[>[data-slot=field-content]]:[&_[data-slot=checkbox-indicator]]:-translate-y-1/2 not-has-[>[data-slot=field-content]]:[&_[data-slot=radio-group-indicator]]:absolute not-has-[>[data-slot=field-content]]:[&_[data-slot=radio-group-indicator]]:top-1/2 not-has-[>[data-slot=field-content]]:[&_[data-slot=radio-group-indicator]]:left-1/2 not-has-[>[data-slot=field-content]]:[&_[data-slot=radio-group-indicator]]:-translate-x-1/2 not-has-[>[data-slot=field-content]]:[&_[data-slot=radio-group-indicator]]:-translate-y-1/2",
      responsive:
        "cn-field-orientation-responsive flex-col [&>*:not([data-slot=field-label])]:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

export type FieldVariants = VariantProps<typeof fieldVariants>

export { default as Field } from "./Field.vue"
export { default as FieldContent } from "./FieldContent.vue"
export { default as FieldDescription } from "./FieldDescription.vue"
export { default as FieldError } from "./FieldError.vue"
export { default as FieldGroup } from "./FieldGroup.vue"
export { default as FieldLabel } from "./FieldLabel.vue"
export { default as FieldLegend } from "./FieldLegend.vue"
export { default as FieldSeparator } from "./FieldSeparator.vue"
export { default as FieldSet } from "./FieldSet.vue"
export { default as FieldTitle } from "./FieldTitle.vue"
