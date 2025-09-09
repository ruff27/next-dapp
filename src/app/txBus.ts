type Listener = (hash: `0x${string}`) => void;

const listeners = new Set<Listener>();

export function onNewTx(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function notifyNewTx(hash: `0x${string}`) {
  for (const l of Array.from(listeners)) l(hash);
}
