export { default as QRCode } from "./QRCode.vue";
export { default as QRCodeScannedBadge } from "./QRCodeScannedBadge.vue";

export {
  buildQRSvgString,
  loadQRCodeLib,
  useQRCode,
  useQRCodeStyle,
} from "./useQRCode";

export type { QRStyleVariant, QRSvgOptions } from "./useQRCode";
