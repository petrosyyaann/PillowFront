export function createDeque(maxLength = 80) {
  return {
    deque: [] as number[],
    max: -1,
    last: null as number | null,
    push(item: number) {
      this.deque.push(item)
      this.last = item

      if (this.deque.length > maxLength) {
        const removedItem = this.deque.shift()
        if (removedItem === this.max) {
          this.max = Math.max(...this.deque)
        }
      } else {
        this.max = Math.max(this.max, item)
      }
    },
    clear() {
      this.deque = []
      this.last = null
      this.max = -1
    },
    toArray() {
      return this.deque.slice()
    },
  }
}
