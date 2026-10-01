// Tiny event bus: decouples scenes, UI and (future) tracking/checkout.
export function createBus() {
  const map = new Map();
  return {
    on(type, fn) { if (!map.has(type)) map.set(type, new Set()); map.get(type).add(fn); return () => map.get(type).delete(fn); },
    emit(type, data) { map.get(type)?.forEach((fn) => fn(data)); map.get('*')?.forEach((fn) => fn(type, data)); },
  };
}
