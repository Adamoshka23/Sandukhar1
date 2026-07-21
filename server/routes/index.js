const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/admin', require('./admin'));
router.use('/products', require('./products'));
router.use('/categories', require('./categories'));
router.use('/materials', require('./materials'));
router.use('/translations', require('./translations'));
router.use('/wishlist', require('./wishlist'));
router.use('/orders', require('./orders'));
router.use('/reviews', require('./reviews'));
router.use('/addresses', require('./addresses'));
router.use('/users', require('./users'));
router.use('/contacts', require('./contacts'));
router.use('/newsletter', require('./newsletter'));
router.use('/tailoring', require('./tailoring'));
router.use('/faq', require('./faq'));
router.use('/gallery', require('./gallery'));

module.exports = router;
