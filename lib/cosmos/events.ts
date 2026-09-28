// Interaction events for audio/haptics hooks — subscribe to add sound without touching the engine.
export type CosmosEventMap = {
  ready: undefined;
  burst: { strength: number };
  "hold-start": undefined;
  release: { charge: number };
  shape: { key: string };
  warp: undefined;
};

type Handler<T> = (payload: T) => void;

const handlers = new Map<keyof CosmosEventMap, Set<Handler<never>>>();

export function onCosmos<K extends keyof CosmosEventMap>(type: K, handler: Handler<CosmosEventMap[K]>) {
  let set = handlers.get(type);
  if (!set) handlers.set(type, (set = new Set()));
  set.add(handler);
  return () => void set.delete(handler);
}

export function emitCosmos<K extends keyof CosmosEventMap>(type: K, payload: CosmosEventMap[K]) {
  handlers.get(type)?.forEach((h) => (h as Handler<CosmosEventMap[K]>)(payload));
}
