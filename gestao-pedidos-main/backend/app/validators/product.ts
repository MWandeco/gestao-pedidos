import vine from '@vinejs/vine'

const name = () => vine.string().trim().minLength(2).maxLength(100)
const price = () => vine.number().min(0.01).max(99999999.99)

export const createProductValidator = vine.create({
  name: name(),
  price: price(),
  isActive: vine.boolean().optional(),
})

export const updateProductValidator = vine.create({
  name: name().optional(),
  price: price().optional(),
  isActive: vine.boolean().optional(),
})
