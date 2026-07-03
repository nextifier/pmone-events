# Cloudflare Cache Rule — respect-origin-cache-control

Bagian dari strategi pemangkasan Workers CPU (lihat `layers/base/modules/cf-cache.ts`).
Kode menentukan APA yang boleh di-cache lewat header `cache-control: public, s-maxage=N`;
Cache Rule di tiap zone hanya menyuruh edge CF menghormati header itu untuk SEMUA
content-type (termasuk HTML, yang secara default tidak pernah di-cache CF).

Tanpa rule ini, perubahan kode tetap aman namun edge tidak meng-cache HTML/API —
penghematan hanya dari prerender + OG cache.

## Rule (identik untuk setiap zone / domain event)

- **Name:** `respect-origin-cache-control`
- **When:** Custom filter expression → `(starts_with(http.request.uri.path, "/"))` (semua request)
- **Cache eligibility:** Eligible for cache
- **Edge TTL:** *Use cache-control header if present, bypass cache if not*
- **Browser TTL:** Respect origin
- Sisanya default.

Semantik: hanya response yang kodenya menyetel `s-maxage` yang di-cache.
`/` (redirect i18n), `/tickets/**`, `/hotels/**`, `/api/track/**`, semua POST →
tanpa header → bypass. Keamanan tetap di kode, rule-nya bodoh dan seragam.

## Setup via dashboard

Per zone: **Caching → Cache Rules → Create rule**, isi seperti di atas.

## Setup via API (semua zone sekaligus)

Buat API token scope `Zone → Cache Rules → Edit` untuk semua zone, lalu:

```bash
export CF_API_TOKEN="..."

# Daftar zone (id + name):
curl -s "https://api.cloudflare.com/client/v4/zones?per_page=50" \
  -H "Authorization: Bearer $CF_API_TOKEN" | jq -r '.result[] | "\(.id) \(.name)"'

# Terapkan rule per zone (ganti $ZONE_ID):
curl -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets/phases/http_request_cache_settings/entrypoint" \
  -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  --data '{
    "rules": [{
      "expression": "(starts_with(http.request.uri.path, \"/\"))",
      "description": "respect-origin-cache-control",
      "action": "set_cache_settings",
      "action_parameters": {
        "cache": true,
        "edge_ttl": { "mode": "respect_origin" },
        "browser_ttl": { "mode": "respect_origin" }
      }
    }]
  }'
```

PERHATIAN: `PUT .../entrypoint` MENGGANTI seluruh ruleset cache zone tersebut.
Kalau sebuah zone sudah punya Cache Rules lain, GET dulu ruleset-nya dan gabungkan.
Verifikasi enum `edge_ttl.mode` dengan membuat satu rule via dashboard lalu
`GET` ruleset-nya — samakan mode yang muncul.

## Verifikasi per site

```bash
curl -sI https://<domain>/news | grep -iE "cf-cache-status|cache-control"
# request 1: MISS/EXPIRED → request 2: HIT
curl -sI https://<domain>/ | grep -i cf-cache-status
# harus: BYPASS atau DYNAMIC (root tidak pernah di-cache)
```

## Sekali per akun

Notifications → tambah **usage alert Workers CPU** di ~25M CPU-ms
(kuota included paket $5 = 30M).
