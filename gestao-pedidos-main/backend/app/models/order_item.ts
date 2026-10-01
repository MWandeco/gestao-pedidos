import { OrderItemSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Product from '#models/product'
import CamelSerializationStrategy from '#models/utils/camel_serialization_strategy'

export default class OrderItem extends OrderItemSchema {
  static namingStrategy = new CamelSerializationStrategy()

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}
