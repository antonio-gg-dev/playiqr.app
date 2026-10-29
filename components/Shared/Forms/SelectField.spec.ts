import { mount } from '@vue/test-utils'
import SelectField from '@/components/Shared/Forms/SelectField.vue'
import { Language } from '@/lib/Shared/Preferences/Language'

it('renders a labeled custom combobox backed by a hidden native select', () => {
  const wrapper = mount(SelectField, {
    props: {
      id: 'language',
      label: 'Language',
      modelValue: Language.English,
      options: [
        Language.English,
        Language.Spanish,
      ],
    },
  })

  const combobox = wrapper.get('button[role="combobox"]')
  const select = wrapper.get('select')

  expect(combobox.attributes('aria-labelledby')).toBe('language-label')
  expect(combobox.attributes('aria-expanded')).toBe('false')
  expect(wrapper.get('#language-label').text()).toBe('Language')
  expect(select.attributes('aria-hidden')).toBe('true')
  expect(select.attributes('tabindex')).toBe('-1')
  expect(select.attributes('id')).toBe('language')
  expect(select.element.value).toBe(Language.English)
})

it('commits a custom option to the native select and emits its value', async () => {
  const wrapper = mount(SelectField, {
    props: {
      id: 'language',
      label: 'Language',
      modelValue: Language.English,
      options: [
        Language.English,
        Language.Spanish,
      ],
    },
  })
  const input = vi.fn()
  const change = vi.fn()

  wrapper.get('select').element.addEventListener('input', input)
  wrapper.get('select').element.addEventListener('change', change)

  await wrapper.get('button[role="combobox"]').trigger('click')
  await wrapper.get('[role="option"][data-value="es"]').trigger('click')

  expect(wrapper.emitted('update:modelValue')).toEqual([[Language.Spanish]])

  await wrapper.setProps({ modelValue: Language.Spanish })

  expect(wrapper.get('select').element.value).toBe(Language.Spanish)
  expect(input).toHaveBeenCalledOnce()
  expect(change).toHaveBeenCalledOnce()
  expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
})

it('tracks pointer hover as the active option and commits it on click', async () => {
  const wrapper = mount(SelectField, {
    props: {
      id: 'language',
      label: 'Language',
      modelValue: Language.English,
      options: [
        Language.English,
        Language.Spanish,
      ],
    },
  })
  const combobox = wrapper.get('button[role="combobox"]')

  await combobox.trigger('click')

  const option = wrapper.get('[role="option"][data-value="es"]')

  await option.trigger('mouseenter')

  expect(combobox.attributes('aria-activedescendant')).toBe('language-option-1')
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()

  await option.trigger('click')

  expect(wrapper.emitted('update:modelValue')).toEqual([[Language.Spanish]])
  expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
})

it('changes the selected value with closed arrows and Home or End without opening', async () => {
  const wrapper = mount(SelectField, {
    props: {
      id: 'language',
      label: 'Language',
      modelValue: Language.English,
      options: [
        Language.English,
        Language.Spanish,
      ],
    },
  })
  const combobox = wrapper.get('button[role="combobox"]')

  await combobox.trigger('keydown', { key: 'ArrowDown' })

  expect(wrapper.emitted('update:modelValue')).toEqual([[Language.Spanish]])
  expect(wrapper.find('[role="listbox"]').exists()).toBe(false)

  await wrapper.setProps({ modelValue: Language.Spanish })
  await combobox.trigger('keydown', { key: 'Home' })

  expect(wrapper.emitted('update:modelValue')).toEqual([
    [Language.Spanish],
    [Language.English],
  ])

  await wrapper.setProps({ modelValue: Language.English })
  await combobox.trigger('keydown', { key: 'End' })

  expect(wrapper.emitted('update:modelValue')).toEqual([
    [Language.Spanish],
    [Language.English],
    [Language.Spanish],
  ])
  expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
})

it('opens with Space and renders the selected value and options through one scoped slot', async () => {
  const wrapper = mount(SelectField, {
    props: {
      id: 'language',
      label: 'Language',
      modelValue: Language.English,
      options: [
        Language.English,
        Language.Spanish,
      ],
    },
    slots: {
      option: ({ value, context }: { value: string; context: string }) => `${context}:${value}`,
    },
  })
  const combobox = wrapper.get('button[role="combobox"]')

  expect(combobox.text()).toContain(`selected:${Language.English}`)

  await combobox.trigger('keydown', { key: ' ' })

  expect(combobox.attributes('aria-expanded')).toBe('true')
  expect(wrapper.get('[role="listbox"]').text()).toContain(`option:${Language.English}`)
  expect(wrapper.get('[role="listbox"]').text()).toContain(`option:${Language.Spanish}`)
})

it('moves active focus without changing the value until Enter and lets Escape cancel', async () => {
  const wrapper = mount(SelectField, {
    props: {
      id: 'language',
      label: 'Language',
      modelValue: Language.English,
      options: [
        Language.English,
        Language.Spanish,
      ],
    },
  })
  const combobox = wrapper.get('button[role="combobox"]')

  await combobox.trigger('keydown', { key: ' ' })
  await combobox.trigger('keydown', { key: 'ArrowDown' })

  expect(combobox.attributes('aria-activedescendant')).toBe('language-option-1')
  expect(wrapper.get('select').element.value).toBe(Language.English)
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()

  await combobox.trigger('keydown', { key: 'Enter' })

  expect(wrapper.emitted('update:modelValue')).toEqual([[Language.Spanish]])
  expect(wrapper.find('[role="listbox"]').exists()).toBe(false)

  await wrapper.setProps({ modelValue: Language.Spanish })
  await combobox.trigger('keydown', { key: ' ' })
  await combobox.trigger('keydown', { key: 'ArrowUp' })
  await combobox.trigger('keydown', { key: 'Escape' })

  expect(wrapper.get('select').element.value).toBe(Language.Spanish)
  expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  expect(wrapper.emitted('update:modelValue')).toEqual([[Language.Spanish]])
})

it('commits the first or last option on Home or End while keeping the popup open', async () => {
  const wrapper = mount(SelectField, {
    props: {
      id: 'language',
      label: 'Language',
      modelValue: Language.Spanish,
      options: [
        Language.English,
        Language.Spanish,
      ],
    },
  })
  const combobox = wrapper.get('button[role="combobox"]')

  await combobox.trigger('keydown', { key: ' ' })
  await combobox.trigger('keydown', { key: 'Home' })

  expect(wrapper.emitted('update:modelValue')).toEqual([[Language.English]])
  expect(wrapper.find('[role="listbox"]').exists()).toBe(true)

  await wrapper.setProps({ modelValue: Language.English })
  await combobox.trigger('keydown', { key: 'End' })

  expect(wrapper.emitted('update:modelValue')).toEqual([
    [Language.English],
    [Language.Spanish],
  ])
  expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
})

it('uses rendered slot text for typeahead navigation', async () => {
  const labels = new Map<string, string>([
    [
      Language.English,
      'English',
    ],
    [
      Language.Spanish,
      'Español',
    ],
  ])
  const wrapper = mount(SelectField, {
    props: {
      id: 'language',
      label: 'Language',
      modelValue: Language.Spanish,
      options: [
        Language.English,
        Language.Spanish,
      ],
    },
    slots: {
      option: ({ value }: { value: string }) => labels.get(value) ?? value,
    },
  })
  const combobox = wrapper.get('button[role="combobox"]')

  await combobox.trigger('keydown', { key: ' ' })
  await combobox.trigger('keydown', { key: 'e' })

  expect(combobox.attributes('aria-activedescendant')).toBe('language-option-0')
  expect(wrapper.get('select').element.value).toBe(Language.Spanish)

  await combobox.trigger('keydown', { key: 'Enter' })

  expect(wrapper.emitted('update:modelValue')).toEqual([[Language.English]])
})

it('keeps the active option ID valid when option values contain spaces', async () => {
  const wrapper = mount(SelectField, {
    props: {
      id: 'fruit',
      label: 'Fruit',
      modelValue: 'red apple',
      options: [
        'red apple',
        'blue berry',
      ],
    },
  })
  const combobox = wrapper.get('button[role="combobox"]')

  await combobox.trigger('keydown', { key: ' ' })
  await combobox.trigger('keydown', { key: 'ArrowDown' })

  expect(combobox.attributes('aria-activedescendant')).toBe('fruit-option-1')
  expect(wrapper.get('#fruit-option-1').attributes('data-value')).toBe('blue berry')
})

it('disables the custom trigger and backing select', async () => {
  const wrapper = mount(SelectField, {
    props: {
      id: 'language',
      label: 'Language',
      modelValue: Language.English,
      options: [
        Language.English,
        Language.Spanish,
      ],
      disabled: true,
    },
  })

  expect((wrapper.get('button[role="combobox"]').element as HTMLButtonElement).disabled).toBe(true)
  expect(wrapper.get('select').element.disabled).toBe(true)

  await wrapper.get('button[role="combobox"]').trigger('click')

  expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
})

it('closes the open listbox on a pointer event outside the control without changing its value', async () => {
  const wrapper = mount(SelectField, {
    props: {
      id: 'language',
      label: 'Language',
      modelValue: Language.English,
      options: [
        Language.English,
        Language.Spanish,
      ],
    },
  })

  await wrapper.get('button[role="combobox"]').trigger('click')
  document.dispatchEvent(new Event('pointerdown'))
  await wrapper.vm.$nextTick()

  expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
})

it('commits the active option and closes the listbox when Tab moves focus away', async () => {
  const wrapper = mount(SelectField, {
    props: {
      id: 'language',
      label: 'Language',
      modelValue: Language.English,
      options: [
        Language.English,
        Language.Spanish,
      ],
    },
  })
  const combobox = wrapper.get('button[role="combobox"]')

  await combobox.trigger('keydown', { key: ' ' })
  await combobox.trigger('keydown', { key: 'ArrowDown' })
  await combobox.trigger('keydown', { key: 'Tab' })

  expect(wrapper.emitted('update:modelValue')).toEqual([[Language.Spanish]])
  expect(wrapper.find('[role="listbox"]').exists()).toBe(false)

  await wrapper.setProps({ modelValue: Language.Spanish })

  expect(wrapper.get('select').element.value).toBe(Language.Spanish)
})
