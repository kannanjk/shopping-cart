var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();

router.get('/', function (req, res, next) {
  productHelpers.GetAllProducts().then((products) => {
    res.render('admin/view-products', { admin: true, products })
  })
});
router.get('/add-products', (req, res) => {
  res.render('admin/add-products', { admin: true })
})
router.post('/add-products', (req, res) => {
  productHelpers.addProduct(req.body, (id) => {

    let image = req.files.image  
    image.mv('./public/product-image/' + id + '.jpg', (err) => {
      if (!err) {
        res.render("admin/add-products")
      } else {
        console.log(err);
      }
    })
  })
})
router.get('/delete-product/:id', (req, res) => {
  let porId = req.params.id
  productHelpers.deletePorduct(porId).then((response) => {
    res.redirect('/admin/')
  })
})
router.get('/edit-products/:id', async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id)
  res.render('admin/edit-products', { product, admin: true })
})
router.post('/edit-products/:id', (req, res) => {
  let id = req.params.id
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    if (req.files.image) {
      let Image = req.files.image
      Image.mv('./public/product-image/' + id + '.jpg')
    }
  })
})

module.exports = router;