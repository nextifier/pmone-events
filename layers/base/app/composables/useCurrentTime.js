const now = ref(new Date());

let timer;
let activeInstances = 0;

function scheduleTick() {
  // Align each tick to the next whole-second boundary instead of a fixed 1000ms
  // interval. Same once-per-second update, but no drift and no wasted wakeups.
  const delay = 1000 - (Date.now() % 1000);
  timer = setTimeout(() => {
    now.value = new Date();
    scheduleTick();
  }, delay);
}

export function useCurrentTime() {
  onMounted(() => {
    if (activeInstances === 0) {
      scheduleTick();
    }
    activeInstances++;
  });

  onUnmounted(() => {
    activeInstances--;
    if (activeInstances === 0) {
      clearTimeout(timer);
    }
  });

  return { now };
}
