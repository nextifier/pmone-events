import type { ChartConfig } from "."
import type { Ref } from "vue"
import { isClient } from "@vueuse/core"
import { h, render, unref } from "vue"

// Bounded cache of rendered tooltip HTML.
//
// It is keyed by data + config, so a live dashboard that polls forever mints a
// fresh key on every refresh. Unbounded, that is a leak on the longest-lived
// screens in the product, which is exactly where charts live.
const CACHE_LIMIT = 200
const cache = new Map<string, string>()

function cacheSet(key: string, value: string) {
  // Map preserves insertion order, so the first key is the oldest one.
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined)
      cache.delete(oldest)
  }
  cache.set(key, value)
}

// Convert object to a consistent string key
function serializeKey(key: Record<string, any>): string {
  return JSON.stringify(key, Object.keys(key).sort())
}

interface Constructor<P = any> {
  __isFragment?: never
  __isTeleport?: never
  __isSuspense?: never
  new (...args: any[]): {
    $props: P
  }
}

export function componentToString<P>(config: ChartConfig | Ref<ChartConfig>, component: Constructor<P>, props?: P) {
  if (!isClient)
    return

  // This function will be called once during mount lifecycle
  const id = useId()

  // https://unovis.dev/docs/auxiliary/Crosshair#component-props
  return (_data: any, x: number | Date) => {
    const data = "data" in _data ? _data.data : _data
    // Get current config value (unwrap ref if needed)
    const currentConfig = unref(config)
    const serializedKey = `${id}-${serializeKey(data)}-${serializeKey(currentConfig)}`
    const cachedContent = cache.get(serializedKey)
    if (cachedContent)
      return cachedContent

    const vnode = h<unknown>(component, { ...props, payload: data, config: currentConfig, x })
    const div = document.createElement("div")
    render(vnode, div)
    cacheSet(serializedKey, div.innerHTML)
    return div.innerHTML
  }
}

/**
 * Lift a series colour toward the current foreground.
 *
 * `--chart-1..5` are declared with the SAME values in light and dark (a gray-300
 * to gray-800 ramp), so a step that reads on one theme washes out on the other:
 * gray-300 is a barely-there line on a white card, gray-800 is invisible on a
 * dark one. Mixing the token with `--foreground` gives every mark a component of
 * the colour that always contrasts with the surface, so a line stays legible in
 * both themes without changing the palette or the tokens.
 *
 * Thin marks (lines, dots) need the full lift; fills sit under them and take a
 * lighter one so the line still reads against its own area.
 */
export function liftSeriesColor(color: string, amount = 45): string {
  return `color-mix(in oklab, ${color} ${amount}%, var(--foreground))`
}
