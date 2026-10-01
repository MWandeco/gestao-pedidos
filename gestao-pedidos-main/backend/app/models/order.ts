import { OrderSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import type { OrderStatus } from '#enums/order_status'
import Customer from '#models/customer'
import OrderItem from '#models/order_item'
import CamelSerializationStrategy from '#models/utils/camel_serialization_strategy'

export default class Order extends OrderSchema {
  static namingStrategy = new CamelSerializationStrategy()

  declare status: OrderStatus

  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>
}
