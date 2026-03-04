import { ref } from 'vue';
import type { QueuedMessage } from '../types/index.js';

export function useMessageQueue() {
  const queue = ref<QueuedMessage[]>([]);

  function enqueue(item: QueuedMessage): void {
    queue.value.push(item);
  }

  function dequeue(): QueuedMessage | undefined {
    return queue.value.shift();
  }

  function remove(index: number): void {
    queue.value.splice(index, 1);
  }

  function clear(): void {
    queue.value = [];
  }

  return {
    queue,
    enqueue,
    dequeue,
    remove,
    clear
  };
}
