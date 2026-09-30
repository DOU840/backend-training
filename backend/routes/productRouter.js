const express = require('express')
const { getProducts, getProduct , updateProduct, deleteProduct} = require('../controllers/productController')

const router = express.Router()

router.get('/', getProducts)
router.get('/:id', getProduct)
router.patch('/:id', updateProduct)
router.delete('/:id', deleteProduct)
module.exports = router