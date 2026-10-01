import vine from '@vinejs/vine'
import { ORDER_STATUSES } from '#enums/order_status'

export const createOrderValidator = vine.create({
  customerId: vine.number().exists(async (db, value) => {
    const customer = await db.from('customers').where('id', value).first()
    return !!customer
  }),
  items: vine
    .array(
      vine.object({
        productId: vine.number(),
        quantity: vine.number().withoutDecimals().min(1),
      })
    )
    .minLength(1),
})

export const updateOrderStatusValidator = vine.create({
  status: vine.enum(ORDER_STATUSES),
})

export const listOrdersValidator = vine.create({
  status: vine.enum(ORDER_STATUSES).optional(),
  search: vine.string().trim().maxLength(100).optional(),
})
