import { CustomerSchema } from '#database/schema'
import CamelSerializationStrategy from '#models/utils/camel_serialization_strategy'

export default class Customer extends CustomerSchema {
  static namingStrategy = new CamelSerializationStrategy()
}
