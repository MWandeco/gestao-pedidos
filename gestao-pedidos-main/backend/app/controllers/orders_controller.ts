import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import OrderService from '#services/order_service'
import {
  createOrderValidator,
  listOrdersValidator,
  updateOrderStatusValidator,
} from '#validators/order'

@inject()
export default class OrdersController {
  constructor(protected orderService: OrderService) {}

  async index({ request }: HttpContext) {
    const filters = await request.validateUsing(listOrdersValidator)
    return { data: await this.orderService.list(filters) }
  }

  async show({ params }: HttpContext) {
    return { data: await this.orderService.findOrFail(params.id) }
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createOrderValidator)
    const order = await this.orderService.create(payload)

    return response.created({ data: order })
  }

  async updateStatus({ params, request }: HttpContext) {
    const { status } = await request.validateUsing(updateOrderStatusValidator)
    return { data: await this.orderService.changeStatus(params.id, status) }
  }
}
