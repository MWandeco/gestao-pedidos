import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Customer from '#models/customer'
import OrderItem from '#models/order_item'
import Order from '#models/order'
import Product from '#models/product'

export default class extends BaseSeeder {
  async run() {
    // Seed de desenvolvimento: recria o catálogo do zero.
    await OrderItem.query().delete()
    await Order.query().delete()
    await Product.query().delete()
    await Customer.query().delete()

    await Customer.createMany([
      { name: 'João Silva', phone: '(11) 91234-5678' },
      { name: 'Maria Santos', phone: '(11) 98765-4321' },
      { name: 'Carlos Oliveira', phone: '(13) 99876-1234' },
      { name: 'Ana Souza', phone: '(13) 99123-4567' },
      { name: 'Lucas Pereira', phone: '(21) 97654-3210' },
    ])

    await Product.createMany([
      { name: 'X-Burger', price: 25, isActive: true },
      { name: 'Refrigerante Lata', price: 6, isActive: true },
      { name: 'Batata Frita Especial', price: 14, isActive: true },
      { name: 'Sobremesa Antiga', price: 10, isActive: false },
    ])
  }
}
