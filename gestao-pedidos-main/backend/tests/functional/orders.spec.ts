import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Customer from '#models/customer'
import Product from '#models/product'

async function createFixtures() {
  const customer = await Customer.create({ name: 'João Silva', phone: '11912345678' })
  const burger = await Product.create({ name: 'X-Burger', price: 25, isActive: true })
  const soda = await Product.create({ name: 'Refrigerante', price: 6, isActive: true })
  const discontinued = await Product.create({ name: 'Sobremesa Antiga', price: 10, isActive: false })
  return { customer, burger, soda, discontinued }
}

test.group('Orders API - criação', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('calcula o total no backend e grava o preço unitário em cada item', async ({
    client,
    assert,
  }) => {
    const { customer, burger, soda } = await createFixtures()

    const response = await client.post('/orders').json({
      customerId: customer.id,
      items: [
        { productId: burger.id, quantity: 2 },
        { productId: soda.id, quantity: 1 },
      ],
    })

    response.assertStatus(201)
    const order = response.body().data
    assert.equal(order.status, 'PENDING')
    assert.equal(order.totalAmount, 56)
    assert.equal(order.customer.name, 'João Silva')
    assert.equal(order.items.length, 2)
    assert.equal(order.items[0].unitPrice, 25)
    assert.equal(order.items[0].totalPrice, 50)
  })

  test('ignora total e preço enviados pelo cliente', async ({ client, assert }) => {
    const { customer, burger } = await createFixtures()

    const response = await client.post('/orders').json({
      customerId: customer.id,
      totalAmount: 1,
      items: [{ productId: burger.id, quantity: 1, unitPrice: 0.01 }],
    })

    response.assertStatus(201)
    assert.equal(response.body().data.totalAmount, 25)
  })

  test('mantém o preço antigo no pedido depois que o produto é reajustado', async ({
    client,
    assert,
  }) => {
    const { customer, burger } = await createFixtures()
    const created = await client.post('/orders').json({
      customerId: customer.id,
      items: [{ productId: burger.id, quantity: 2 }],
    })

    burger.price = 30
    await burger.save()

    const response = await client.get(`/orders/${created.body().data.id}`)

    response.assertStatus(200)
    assert.equal(response.body().data.items[0].unitPrice, 25)
    assert.equal(response.body().data.totalAmount, 50)
  })

  test('exige um cliente', async ({ client }) => {
    const { burger } = await createFixtures()

    const response = await client.post('/orders').json({
      items: [{ productId: burger.id, quantity: 1 }],
    })

    response.assertStatus(422)
  })

  test('rejeita cliente que não existe', async ({ client }) => {
    const { burger } = await createFixtures()

    const response = await client.post('/orders').json({
      customerId: 999,
      items: [{ productId: burger.id, quantity: 1 }],
    })

    response.assertStatus(422)
  })

  test('exige pelo menos um produto', async ({ client }) => {
    const { customer } = await createFixtures()

    const response = await client.post('/orders').json({ customerId: customer.id, items: [] })

    response.assertStatus(422)
  })

  test('exige quantidade mínima de 1 por item', async ({ client }) => {
    const { customer, burger } = await createFixtures()

    const response = await client.post('/orders').json({
      customerId: customer.id,
      items: [{ productId: burger.id, quantity: 0 }],
    })

    response.assertStatus(422)
  })

  test('não aceita produto inativo e não grava nada do pedido', async ({ client, assert }) => {
    const { customer, burger, discontinued } = await createFixtures()

    const response = await client.post('/orders').json({
      customerId: customer.id,
      items: [
        { productId: burger.id, quantity: 1 },
        { productId: discontinued.id, quantity: 1 },
      ],
    })

    response.assertStatus(422)
    assert.include(response.body().message, 'inativo')

    const list = await client.get('/orders')
    assert.lengthOf(list.body().data, 0)
  })

  test('rejeita produto que não existe', async ({ client }) => {
    const { customer } = await createFixtures()

    const response = await client.post('/orders').json({
      customerId: customer.id,
      items: [{ productId: 999, quantity: 1 }],
    })

    response.assertStatus(422)
  })
})

test.group('Orders API - status', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  async function createOrder(client: any) {
    const { customer, burger } = await createFixtures()
    const response = await client.post('/orders').json({
      customerId: customer.id,
      items: [{ productId: burger.id, quantity: 1 }],
    })
    return response.body().data.id as number
  }

  test('percorre Pendente → Em preparação → Pronto → Finalizado', async ({ client, assert }) => {
    const id = await createOrder(client)

    for (const status of ['IN_PREPARATION', 'READY', 'FINISHED']) {
      const response = await client.patch(`/orders/${id}/status`).json({ status })
      response.assertStatus(200)
      assert.equal(response.body().data.status, status)
    }
  })

  test('não permite pular etapas', async ({ client }) => {
    const id = await createOrder(client)

    const response = await client.patch(`/orders/${id}/status`).json({ status: 'READY' })

    response.assertStatus(422)
  })

  test('permite cancelar um pedido em andamento', async ({ client, assert }) => {
    const id = await createOrder(client)
    await client.patch(`/orders/${id}/status`).json({ status: 'IN_PREPARATION' })

    const response = await client.patch(`/orders/${id}/status`).json({ status: 'CANCELED' })

    response.assertStatus(200)
    assert.equal(response.body().data.status, 'CANCELED')
  })

  test('pedido cancelado não volta para outro status', async ({ client, assert }) => {
    const id = await createOrder(client)
    await client.patch(`/orders/${id}/status`).json({ status: 'CANCELED' })

    for (const status of ['PENDING', 'IN_PREPARATION', 'READY', 'FINISHED']) {
      const response = await client.patch(`/orders/${id}/status`).json({ status })
      response.assertStatus(422)
    }
  })

  test('rejeita status que não existe e pedido que não existe', async ({ client }) => {
    const id = await createOrder(client)

    const statusInvalido = await client.patch(`/orders/${id}/status`).json({ status: 'XPTO' })
    statusInvalido.assertStatus(422)

    const naoExiste = await client.patch('/orders/999/status').json({ status: 'IN_PREPARATION' })
    naoExiste.assertStatus(404)
  })
})

test.group('Orders API - consulta e listagem', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('consulta um pedido por id e retorna 404 quando não existe', async ({ client, assert }) => {
    const { customer, burger } = await createFixtures()
    const created = await client.post('/orders').json({
      customerId: customer.id,
      items: [{ productId: burger.id, quantity: 1 }],
    })

    const found = await client.get(`/orders/${created.body().data.id}`)
    found.assertStatus(200)
    assert.equal(found.body().data.customer.name, 'João Silva')

    const missing = await client.get('/orders/999')
    missing.assertStatus(404)
  })

  test('filtra por status e busca por nome do cliente ou id', async ({ client, assert }) => {
    const { customer, burger } = await createFixtures()
    const maria = await Customer.create({ name: 'Maria Santos', phone: '11988887777' })

    const first = await client.post('/orders').json({
      customerId: customer.id,
      items: [{ productId: burger.id, quantity: 1 }],
    })
    const second = await client.post('/orders').json({
      customerId: maria.id,
      items: [{ productId: burger.id, quantity: 1 }],
    })
    await client.patch(`/orders/${second.body().data.id}/status`).json({ status: 'IN_PREPARATION' })

    const porStatus = await client.get('/orders').qs({ status: 'IN_PREPARATION' })
    assert.deepEqual(
      porStatus.body().data.map((o: { id: number }) => o.id),
      [second.body().data.id]
    )

    const porNome = await client.get('/orders').qs({ search: 'maria' })
    assert.deepEqual(
      porNome.body().data.map((o: { id: number }) => o.id),
      [second.body().data.id]
    )

    const porId = await client.get('/orders').qs({ search: String(first.body().data.id) })
    assert.deepEqual(
      porId.body().data.map((o: { id: number }) => o.id),
      [first.body().data.id]
    )
  })
})
