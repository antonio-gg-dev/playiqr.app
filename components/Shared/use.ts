import { inject, type InjectionKey } from 'vue'

export function use<T>(key: InjectionKey<T>): NonNullable<T> {
  const dependency = inject(key)

  if (dependency === undefined || dependency === null) {
    throw new Error(`Required dependency "${key.description ?? 'unnamed'}" is unavailable`)
  }

  return dependency
}
