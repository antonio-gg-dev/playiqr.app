import { mount } from '@vue/test-utils'
import SelectField from '@/components/Shared/Forms/SelectField.vue'
import { Language } from '@/lib/Shared/Preferences/Language'

it('associates its label with a native select and emits the selected value', async () => {
  const wrapper = mount(SelectField, {
    props: {
      id: 'language',
      label: 'Language',
      modelValue: Language.English,
      options: [
        {
          value: Language.English,
          label: 'English',
        },
        {
          value: Language.Spanish,
          label: 'Español',
        },
      ],
    },
  })

  expect(wrapper.get('label').attributes('for')).toBe(wrapper.get('select').attributes('id'))
  expect(wrapper.get('select').element.value).toBe(Language.English)

  await wrapper.get('select').setValue(Language.Spanish)

  expect(wrapper.emitted('update:modelValue')).toEqual([[Language.Spanish]])

  await wrapper.setProps({ disabled: true })

  expect(wrapper.get('select').element.disabled).toBe(true)
})
