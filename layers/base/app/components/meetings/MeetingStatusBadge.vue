<template>
  <Badge :variant="MEETING_STATUS_VARIANT[status] || 'muted'">
    {{ awaitsVisitor ? $t("meetings.status.invited") : $t(`meetings.status.${status}`) }}
  </Badge>
</template>

<script setup>
import { Badge } from "../ui/badge";

defineProps({
  status: { type: String, required: true },
  /** An exhibitor's invitation the visitor has not answered yet. */
  awaitsVisitor: { type: Boolean, default: false },
});
</script>
