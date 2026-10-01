import { SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import type { LucidModel } from '@adonisjs/lucid/types/model'

/**
 * Mantém as colunas do banco em snake_case, mas devolve o JSON da API em camelCase
 * (ex.: coluna `total_amount` → campo `totalAmount`), igual ao que o Angular consome.
 */
export default class CamelSerializationStrategy extends SnakeCaseNamingStrategy {
  serializedName(_model: LucidModel, propertyName: string) {
    return propertyName
  }
}
