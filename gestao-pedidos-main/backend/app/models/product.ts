import { ProductSchema } from '#database/schema'
import CamelSerializationStrategy from '#models/utils/camel_serialization_strategy'

export default class Product extends ProductSchema {
  static namingStrategy = new CamelSerializationStrategy()
}
