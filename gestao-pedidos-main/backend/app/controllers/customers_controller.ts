import type { HttpContext } from '@adonisjs/core/http'
import Customer from '#models/customer'
import { createCustomerValidator, updateCustomerValidator } from '#validators/customer'

export default class CustomersController {
  async index() {
    return { data: await Customer.query().orderBy('name') }
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createCustomerValidator)
    const customer = await Customer.create(payload)

    return response.created({ data: customer })
  }

  async update({ params, request }: HttpContext) {
    const customer = await Customer.findOrFail(params.id)
    const payload = await request.validateUsing(updateCustomerValidator)

    customer.merge(payload)
    await customer.save()

    return { data: customer }
  }
}
