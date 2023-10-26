export function isAsyncFunction(fn: Function): boolean {
  return Object.getPrototypeOf(fn)?.constructor?.name === 'AsyncFunction';
}
