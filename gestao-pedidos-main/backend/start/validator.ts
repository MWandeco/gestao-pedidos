/*
|--------------------------------------------------------------------------
| Validator file
|--------------------------------------------------------------------------
|
| Configuração global do VineJS: conversão de datas para Luxon e mensagens
| de validação em português.
|
*/

import { DateTime } from 'luxon'
import vine, { SimpleMessagesProvider, VineDate } from '@vinejs/vine'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))

vine.messagesProvider = new SimpleMessagesProvider(
  {
    required: 'O campo {{ field }} é obrigatório.',
    string: 'O campo {{ field }} deve ser um texto.',
    number: 'O campo {{ field }} deve ser um número.',
    boolean: 'O campo {{ field }} deve ser verdadeiro ou falso.',
    enum: 'O valor informado em {{ field }} é inválido.',
    regex: 'O campo {{ field }} está em um formato inválido.',
    exists: 'O valor informado em {{ field }} não existe.',
    min: 'O campo {{ field }} deve ser no mínimo {{ min }}.',
    max: 'O campo {{ field }} deve ser no máximo {{ max }}.',
    minLength: 'O campo {{ field }} deve ter no mínimo {{ min }} caracteres.',
    maxLength: 'O campo {{ field }} deve ter no máximo {{ max }} caracteres.',
    withoutDecimals: 'O campo {{ field }} deve ser um número inteiro.',
    'array.minLength': 'O campo {{ field }} deve ter ao menos {{ min }} item.',
    'items.array.minLength': 'Um pedido deve possuir pelo menos um produto.',
    'items.*.quantity.min': 'A quantidade mínima de cada item é 1.',
    'customerId.required': 'Um pedido deve possuir um cliente.',
  },
  {
    name: 'nome',
    phone: 'telefone',
    price: 'preço',
    isActive: 'status',
    customerId: 'cliente',
    items: 'itens',
    status: 'status',
  }
)
