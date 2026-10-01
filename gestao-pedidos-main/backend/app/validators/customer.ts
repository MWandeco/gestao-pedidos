import vine from '@vinejs/vine'

const name = () => vine.string().trim().minLength(2).maxLength(100)
const phone = () =>
  vine
    .string()
    .trim()
    .minLength(8)
    .maxLength(20)
    .regex(/^[0-9()+\-\s]+$/)

export const createCustomerValidator = vine.create({
  name: name(),
  phone: phone(),
})

export const updateCustomerValidator = vine.create({
  name: name().optional(),
  phone: phone().optional(),
})
