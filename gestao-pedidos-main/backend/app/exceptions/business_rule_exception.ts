import { Exception } from '@adonisjs/core/exceptions'

/**
 * Violação de regra de negócio (ex.: produto inativo, transição de status inválida).
 * Respondida pelo handler global como HTTP 422 com `{ message }`.
 */
export default class BusinessRuleException extends Exception {
  static status = 422
  static code = 'E_BUSINESS_RULE'
}
