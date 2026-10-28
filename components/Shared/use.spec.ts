import { createApp, defineComponent, type InjectionKey } from 'vue'
import { mount } from '@vue/test-utils'
import { expectTypeOf } from 'vitest'
import { use } from '@/components/Shared/use'

it('returns the provided dependency with its inferred type and identity', () => {
  const key: InjectionKey<{ readonly value: number }> = Symbol('test dependency')
  const dependency = { value: 42 }
  const app = createApp(() => null)

  app.provide(key, dependency)

  const result = app.runWithContext(() => use(key))

  expectTypeOf(result).toEqualTypeOf<{ readonly value: number }>()
  expect(result).toBe(dependency)
})

it('throws a descriptive error containing the symbol description when a dependency is missing', () => {
  const key: InjectionKey<object> = Symbol('missing dependency')
  const app = createApp(() => null)

  expect(() => app.runWithContext(() => use(key))).toThrow('Required dependency "missing dependency" is unavailable')
})

it('rejects explicitly provided null and undefined values', () => {
  const key: InjectionKey<object | null | undefined> = Symbol('required dependency')

  for (const value of [
    null,
    undefined,
  ]) {
    const app = createApp(() => null)

    app.provide(key, value)

    expect(() => app.runWithContext(() => use(key))).toThrow('Required dependency "required dependency" is unavailable')
  }
})

it('preserves valid falsy values', () => {
  for (const value of [
    false,
    0,
    '',
  ]) {
    const key: InjectionKey<typeof value> = Symbol('falsy dependency')
    const app = createApp(() => null)

    app.provide(key, value)

    expect(app.runWithContext(() => use(key))).toBe(value)
  }
})

it('narrows nullable dependency types to a guaranteed value', () => {
  const key: InjectionKey<{ id: number } | null | undefined> = Symbol('nullable dependency')
  const app = createApp(() => null)

  app.provide(key, { id: 1 })

  const dependency = app.runWithContext(() => use(key))

  expectTypeOf(dependency).toEqualTypeOf<{ id: number }>()
  expect(dependency.id).toBe(1)
})

it('reports an unnamed symbol descriptively when its dependency is missing', () => {
  const key: InjectionKey<object> = Symbol()
  const app = createApp(() => null)

  expect(() => app.runWithContext(() => use(key))).toThrow('Required dependency "unnamed" is unavailable')
})

it('resolves dependencies in an Options API component through the real Vue provider', () => {
  const key: InjectionKey<number> = Symbol('component dependency')

  const wrapper = mount(
    defineComponent({
      data() {
        return { dependency: use(key) }
      },

      render() {
        return null
      },
    }),
    { global: { provide: { [key]: 42 } } },
  )

  expect(wrapper.vm.dependency).toBe(42)

  wrapper.unmount()
})
