import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import { createProductValidator, updateProductValidator } from '#validators/product'

export default class ProductsController {
  async index() {
    return { data: await Product.query().orderBy('id') }
  }

  async store({ request, response }: HttpContext) {
    const { isActive = true, ...payload } = await request.validateUsing(createProductValidator)
    const product = await Product.create({ ...payload, isActive })

    return response.created({ data: product })
  }

  async update({ params, request }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    const payload = await request.validateUsing(updateProductValidator)

    product.merge(payload)
    await product.save()

    return { data: product }
  }
}
