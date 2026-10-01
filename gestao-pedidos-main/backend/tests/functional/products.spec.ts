import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Product from '#models/product'

test.group('Products API', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('cadastra um produto ativo por padrão', async ({ client, assert }) => {
    const response = await client.post('/products').json({ name: 'X-Burger', price: 25 })

    response.assertStatus(201)
    assert.equal(response.body().data.price, 25)
    assert.isTrue(response.body().data.isActive)
  })

  test('rejeita produto sem nome ou com preço inválido', async ({ client }) => {
    const semNome = await client.post('/products').json({ price: 10 })
    semNome.assertStatus(422)

    const precoNegativo = await client.post('/products').json({ name: 'Suco', price: -5 })
    precoNegativo.assertStatus(422)
  })

  test('ativa e desativa um produto', async ({ client, assert }) => {
    const product = await Product.create({ name: 'Suco', price: 8, isActive: true })

    const desativado = await client.put(`/products/${product.id}`).json({ isActive: false })
    desativado.assertStatus(200)
    assert.isFalse(desativado.body().data.isActive)

    const ativado = await client.put(`/products/${product.id}`).json({ isActive: true })
    assert.isTrue(ativado.body().data.isActive)
  })
})
