import router from '@adonisjs/core/services/router'

const CustomersController = () => import('#controllers/customers_controller')
const ProductsController = () => import('#controllers/products_controller')
const OrdersController = () => import('#controllers/orders_controller')

router.get('/', async () => ({ name: 'Gestão de Pedidos API', status: 'online' }))

router.resource('customers', CustomersController).only(['index', 'store', 'update'])
router.resource('products', ProductsController).only(['index', 'store', 'update'])
router.resource('orders', OrdersController).only(['index', 'show', 'store'])
router.patch('/orders/:id/status', [OrdersController, 'updateStatus'])
