var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelper = require('../helpers/user-helpers');
const verifylogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}
/* Get home page */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  let cartCount = null
  if (user) {
    cartCount = await userHelper.getCartCount(req.session.user._id)
  }
  productHelpers.GetAllProducts().then((products) => {
    res.render('user/view-products', { products, user, cartCount, use: true })
  })
});
router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/login', { "loginErr": req.session.loginErr })
    req.session.loginErr = false
  }
})
router.get('/signup', (req, res) => {
  res.render('user/signup')
})
router.post('/signup', (req, res) => {
  userHelper.Dosignup(req.body).then((response) => {
    req.session.loggedIn = true
    req.session.user = req.body
    res.redirect('/')
  })
})
router.post('/login', (req, res) => {
  userHelper.Dologin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.loginErr = "Invaild user name or password"
      res.redirect('/login')
    }
  })
})
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})
router.get('/cart', verifylogin, async (req, res) => {
  let products = await userHelper.getCartProducts(req.session.user._id)
  let totalValue=0
  if (products.length>0) {
    totalValue = await userHelper.GetTotalAmount(req.session.user._id)
  }
  res.render('user/cart', { products, user: req.session.user._id, totalValue, use: true })

})
router.get('/add-to-cart/:id', (req, res) => {
  userHelper.addToCart(req.params.id, req.session.user._id).then((response) => {
    res.json({ status: true })
  })
})
router.post('/changeproductquantity', (req, res, next) => {
  userHelper.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelper.GetTotalAmount(req.body.user)
    res.json(response)
  })
})
router.get('/removepro/:id', (req, res) => {
  console.log(req.params);
  userHelper.removecartPro(req.params.id, req.session.user._id).then((response) => {
    res.json({ status: true })
  })
})
router.get('/place-order', verifylogin, async (req, res) => {
  let total = await userHelper.GetTotalAmount(req.session.user._id)
  res.render('user/place-order', { total, user: req.session.user })
})
router.post('/place-order', async (req, res) => {
  let products = await userHelper.getCartProList(req.body.userId)
  let totalPrice = await userHelper.GetTotalAmount(req.body.userId)
  userHelper.placeOrder(req.body, products, totalPrice).then((orderId) => {
    if (req.body['payment-method'] === 'COD') {
      res.json({ codSuccess: true })
    } else {
      userHelper.genaratRaz(orderId, totalPrice).then((response) => {
        res.json(response)
      })
    }
  })
})
router.get('/removeprod/:id', (req, res) => {
  userHelper.removePro(req.params.id, req.session.user._id).then((response) => {
    res.redirect('/')
  })
})
router.get('/order-success', (req, res) => {
  res.render('user/order-success', { user: req.session.user })
})
router.get('/orders', async (req, res) => {
  let orders = await userHelper.getUserOreders(req.session.user._id)
  res.render('user/orders', { user: req.session.user, orders })
})
router.get('/view-order-products/:id', async (req, res) => {
  let products = await userHelper.getorderProd(req.params.id)
  res.render('user/View-order-products', { user: req.session.user, products })
})
router.post('/verify-Payment', (req, res) => {

  userHelper.verifypayment(req.body).then(() => {
    console.log("njan kannan");
    console.log(req.body);
    userHelper.changepaymentstats(req.body['order[receipt]']).then(() => {
      console.log("payment successfull");
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log("kannan", err);
    res.json({ status: false, errmsg: '' })
  })
})

module.exports = router;
