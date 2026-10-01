import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Customer from '#models/customer'

test.group('Customers API', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('cadastra um cliente com nome e telefone', async ({ client, assert }) => {
    const response = await client.post('/customers').json({ name: 'João Silva', phone: '(11) 91234-5678' })

    response.assertStatus(201)
    assert.equal(response.body().data.name, 'João Silva')
    assert.equal(response.body().data.phone, '(11) 91234-5678')
  })

  test('rejeita cadastro sem nome ou com telefone inválido', async ({ client }) => {
    const semNome = await client.post('/customers').json({ phone: '11912345678' })
    semNome.assertStatus(422)

    const telefoneInvalido = await client.post('/customers').json({ name: 'Maria', phone: 'abc' })
    telefoneInvalido.assertStatus(422)
  })

  test('edita um cliente existente', async ({ client, assert }) => {
    const customer = await Customer.create({ name: 'Maria', phone: '11911112222' })

    const response = await client.put(`/customers/${customer.id}`).json({ name: 'Maria Santos' })

    response.assertStatus(200)
    assert.equal(response.body().data.name, 'Maria Santos')
    assert.equal(response.body().data.phone, '11911112222')
  })

  test('retorna 404 ao editar um cliente que não existe', async ({ client }) => {
    const response = await client.put('/customers/999').json({ name: 'Ninguém' })

    response.assertStatus(404)
  })

  test('lista os clientes em ordem alfabética', async ({ client, assert }) => {
    await Customer.createMany([
      { name: 'Zélia', phone: '11911112222' },
      { name: 'Ana', phone: '11933334444' },
    ])

    const response = await client.get('/customers')

    response.assertStatus(200)
    assert.deepEqual(
      response.body().data.map((c: { name: string }) => c.name),
      ['Ana', 'Zélia']
    )
  })
})
