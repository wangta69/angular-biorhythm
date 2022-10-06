export function set(key: string, value: any) {
  return window.localStorage.setItem(key, JSON.stringify(value));
}

export function get(key: string) {
  return JSON.parse(window.localStorage.getItem(key));
}
