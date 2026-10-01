import db from '@adonisjs/lucid/services/db'
import Order from '#models/order'
import Product from '#models/product'
import BusinessRuleException from '#exceptions/business_rule_exception'
import { canTransition, ORDER_STATUS_LABELS, type OrderStatus } from '#enums/order_status'

export interface CreateOrderPayload {
  customerId: number
  items: { productId: number; quantity: number }[]
}

export interface ListOrdersFilters {
  status?: OrderStatus
  search?: string
}

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

export default class OrderService {
  async list({ status, search }: ListOrdersFilters = {}) {
    const query = Order.query().preload('customer').preload('items').orderBy('id', 'desc')

    if (status) {
      query.where('status', status)
    }

    if (search) {
      query.where((builder) => {
        builder.whereHas('customer', (customer) => customer.whereLike('name', `%${search}%`))
        if (/^\d+$/.test(search)) {
          builder.orWhere('id', Number(search))
        }
      })
    }

    return await query
  }

  async findOrFail(id: number | string) {
    return await Order.query().where('id', id).preload('customer').preload('items').firstOrFail()
  }

  /**
   * Cria o pedido dentro de uma transação. O total e os preços vêm sempre do banco:
   * o que o cliente enviar além de produto e quantidade é ignorado.
   */
  async create({ customerId, items }: CreateOrderPayload) {
    const orderId = await db.transaction(async (trx) => {
      const productIds = [...new Set(items.map((item) => item.productId))]
      const products = await Product.query({ client: trx }).whereIn('id', productIds)
      const productsById = new Map(products.map((product) => [product.id, product]))

      const lines = items.map((item) => {
        const product = productsById.get(item.productId)

        if (!product) {
          throw new BusinessRuleException(`Produto #${item.productId} não encontrado.`)
        }
        if (!product.isActive) {
          throw new BusinessRuleException(
            `O produto "${product.name}" está inativo e não pode ser adicionado a um pedido.`
          )
        }

        const unitPrice = Number(product.price)
        return {
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice,
          totalPrice: roundMoney(unitPrice * item.quantity),
        }
      })

      const totalAmount = roundMoney(lines.reduce((sum, line) => sum + line.totalPrice, 0))

      const order = await Order.create({ customerId, status: 'PENDING', totalAmount }, { client: trx })
      await order.related('items').createMany(lines)

      return order.id
    })

    return await this.findOrFail(orderId)
  }

  async changeStatus(id: number | string, newStatus: OrderStatus) {
    const order = await Order.findOrFail(id)

    if (!canTransition(order.status, newStatus)) {
      const message =
        order.status === 'CANCELED'
          ? 'Um pedido cancelado não pode voltar para outro status.'
          : `Não é possível mudar um pedido de "${ORDER_STATUS_LABELS[order.status]}" para "${ORDER_STATUS_LABELS[newStatus]}".`
      throw new BusinessRuleException(message)
    }

    order.status = newStatus
    await order.save()

    return await this.findOrFail(order.id)
  }
}
