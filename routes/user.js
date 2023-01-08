const { response } = require('express');
var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelper = require('../helpers/user-helpers');
const verifylogin = (req, res, next) => {
  if (req.session.userloggedIn) {
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
    productHelpers.leatestpro().then((latest) => {
      productHelpers.getbigestpro().then((bigest) => {
        productHelpers.secondBigestPro().then((secondbigest) => {
          res.render('user/view-products', { products, latest, user, bigest, secondbigest, cartCount, use: true })
        })
      })
    })
  })
});
router.get('/login', (req, res) => {
  if (req.session.userloggedIn) {
    res.redirect('/')
  } else {
    res.render('user/login', { "loginErr": req.session.loginErr, use: true })
    req.session.loginErr = false
  }
})
router.get('/signup', (req, res) => {
  res.render('user/signup', { use: true })
})
router.post('/signup', async (req, res) => {
  userHelper.Dosignup(req.body).then((user) => {
    console.log(user);
    if (user != 0) {
      let ji = "this email already exist"
      res.render('user/signup', { ji })
    } else {
      req.session.userloggedIn = true
      req.session.user = req.body
      res.redirect('/')
    }
  })
})
router.post('/login', (req, res) => {

  userHelper.Dologin(req.body).then((response) => {
    if (response.status) {
      req.session.userloggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.LoginErr = "Invaild user name or password"
      res.redirect('/login')
    }
  })
})
router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userloggedIn = false
  res.redirect('/')
})
router.get('/cart', verifylogin, async (req, res) => {
  let products = await userHelper.getCartProducts(req.session.user._id)
  let totalValue = 0
  if (products.length > 0) {

    totalValue = await userHelper.GetTotalAmount(req.session.user._id)
  }
  res.render('user/cart', { products, user: req.session.user._id, totalValue, use: true })
})
router.get('/aboutus', (req, res) => {
  res.render('user/aboutus', { use: true })
})
router.get('/add-to-cart/:id', (req, res) => {
  console.log("kannan");
  userHelper.addToCart(req.params.id, req.session.user._id).then((response) => {
    console.log("ivide und");
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
  let  total = await userHelper.GetTotalAmount(req.session.user._id)
    userHelper.getaddress(req.session.user._id).then((adderss) => {
      res.render('user/place-order', { adderss, total, user: req.session.user })
    })
  
})
router.post('/place-order', async (req, res) => {
  userHelper.inseAddres(req.body, req.session.user._id)
  let products = await userHelper.getCartProList(req.body.userId)
  let total = await userHelper.GetTotalAmount(req.body.userId)
  userHelper.placeOrder(req.body, products, total).then((orderId) => {
    if (req.body['payment-method'] === 'COD') {
      res.json({ codSuccess: true })
    } else {
      console.log("My@#$#%");
      userHelper.genaratRaz(orderId, total).then((response) => {
        console.log("ithokke enth");
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
  res.render('user/order-success', { user: req.session.userlogin, use: true })
})
router.get('/orders', async (req, res) => {
  let orders = await userHelper.getUserOreders(req.session.user._id)
  res.render('user/orders', { user: req.session.user, orders, use: true })
})
router.get('/view-order-products/:id', async (req, res) => {
  let products = await userHelper.getorderProd(req.params.id)
  res.render('user/View-order-products', { user: req.session.userlogin, products, use: true })
})
router.post('/verify-Payment', (req, res) => {

  userHelper.verifypayment(req.body).then(() => {
    userHelper.changepaymentstats(req.body['order[receipt]']).then(() => {
      console.log("payment successfull");
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log("kannan", err);
    res.json({ status: false, errmsg: '' })
  })
})
router.get('/profile', verifylogin, async (req, res) => {
  let orders = await userHelper.getUserOreders(req.session.user._id)
  userHelper.couponlist().then((coupon)=>{
    res.render('user/myprofile', { user: req.session.user,coupon, orders, use: true })
  })
})
router.get('/wishlist', verifylogin, async (req, res) => {
  let wishPro = await userHelper.getwish(req.session.user._id)
  console.log(wishPro);
  res.render('user/wishlist', { wishPro, use: true })
})
router.get('/addtowish/:id', (req, res) => {
  userHelper.adtowish(req.params.id, req.session.user._id).then((response) => {

  })

})
router.get('/removewish/:id', (req, res) => {
  userHelper.removewish(req.params.id, req.session.user._id).then((response) => {
    res.json({ status: true })
  })
})
router.get('/shop', (req, res) => {
  productHelpers.GetAllProducts().then((products) => {
    res.render('user/shop', { products, use: true })
  })
})
router.get('/macbook', (req, res) => {
  userHelper.macbook().then((macbook) => {
    res.render('user/shop', { macbook, use: true })
  })
})
router.get('/asus', (req, res) => {
  userHelper.asus().then((asus) => {
    res.render('user/shop', { asus, use: true })
  })
})
router.get('/lenovo', (req, res) => {
  userHelper.lenovo().then((lenovo) => {
    console.log(lenovo);
    res.render('user/shop', { lenovo, use: true })
  })
})
router.get('/hp', (req, res) => {
  userHelper.hp().then((hp) => {
    console.log(hp);
    res.render('user/shop', { hp, use: true })
  })
})
router.get('/dell', (req, res) => {
  userHelper.dell().then((dell) => {
    console.log(dell);
    res.render('user/shop', { dell, use: true })
  })
})
router.get('/acer', (req, res) => {
  userHelper.acer().then((acer) => {
    console.log(acer);
    res.render('user/shop', { acer, use: true })
  })
})
router.get('/jumper', (req, res) => {
  userHelper.jumper().then((jumper) => {
    console.log(jumper);
    res.render('user/shop', { jumper, use: true })
  })
})
router.get('/sumsung', (req, res) => {
  userHelper.sumsung().then((sumsung) => {
    console.log(sumsung);
    res.render('user/shop', { sumsung, use: true })
  })
})
router.get('/newproduct', (req, res) => {
  productHelpers.leatestproshop().then((latest) => {
    console.log(latest);
    res.render('user/shop', { latest, use: true })
  })
})
router.get('/tenthuo', (req, res) => {
  productHelpers.tenthuo().then((tenthuo) => {
    console.log(tenthuo);
    res.render('user/shop', { tenthuo, use: true })
  })
})
router.get('/fivethuo', (req, res) => {
  productHelpers.fivethuo().then((fivethuo) => {
    console.log(fivethuo);
    res.render('user/shop', { fivethuo, use: true })
  })
})
router.get('/twentythuo', (req, res) => {
  productHelpers.twentythuo().then((twentythuo) => {
    console.log(twentythuo);
    res.render('user/shop', { twentythuo, use: true })
  })
})   
router.get('/thirtythuo', (req, res) => {
  productHelpers.thirtythuo().then((thirtythuo) => {
    console.log(thirtythuo);
    res.render('user/shop', { thirtythuo, use: true })
  })
})
router.get('/fourtythuo', (req, res) => {
    productHelpers.fourtythuo().then((fourtythuo) => {
      console.log(fourtythuo);
      res.render('user/shop', { fourtythuo, use: true })
    })
})
router.get('/fiftyabove', (req, res) => {
  productHelpers.fiftyabove().then((fiftyabove) => {
    console.log(fiftyabove);
    res.render('user/shop', { fiftyabove, use: true })
  })
})
router.post('/catagorys', (req, res) => {
  productHelpers.catagorys(req.body).then((macbook) => {
    res.render('user/shop', { macbook, use: true })
  })
})
router.get('/submitAddress/:id', (req, res) => {
  console.log(req.params.id);
  console.log(req.session.user._id);
  productHelpers.submitAddress(req.params.id, req.session.user._id).then(() => {

  })
})
router.post('/verifycoupon', (req, res) => {
  let couponcode = req.body.couponcode
  let total = req.body.subtotal
  productHelpers.verifycoupon(couponcode, total).then((coupon) => {
    if (coupon) {
      let CutOff = parseInt(coupon.CutOff)
      let coupontype = coupon.CouponType
      let minicartamAmount = parseInt(coupon.minAmount)
      let generateCount = parseInt(coupon.generateCount)
      if (generateCount != 0) {
        if (coupontype == 'Amount') {
          if (total < minicartamAmount) {
            let couponMsg = 'minimumum Rs.' + minicartamAmount + ' need to apply this coupon';
            console.log(couponMsg);
          } else {
            let grandtotal = Math.round(total - CutOff)
            console.log(grandtotal);
            let response = {
              status: true,
              grandtotal: grandtotal,
              cutOff: CutOff
            }
            res.json(response)
            console.log(response);
            console.log("njan kannan ");
          }
        } 
      }
    }
  })   
  // userHelper.insertcoupon(coupon).then(()=>{

  // })
})
router.get('/forgotmypass', (req, res) => {
  res.render('user/forgotmypass')
})
router.post('/numverify', (req, res) => {
  let num = req.body.number
  req.session.passnum = num
  console.log(num);
  userHelper.sendsms(num).then(() => {
    res.render('user/verifyotp')
  })
})
router.post('/verifyOtp', (req, res) => {
  let number = req.session.passnum
  let otp = req.body
  userHelper.verifyotp(number, otp).then((response) => {
    if (response ) {
      console.log("sangathi polichu");
      res.render('user/passresubmission')
    } else {
      console.log("eallam poyiy");
    }
    console.log("vannu njan....");
    res.render('user/verifyotp',{})
  })

})


module.exports = router;