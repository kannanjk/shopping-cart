var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelper=require('../helpers/user-helpers');
const verifylogin=(req,res,next)=>{
  if (req.session.loggedIn) {
    next()
  }else{
    res.redirect('/login')
  }
}
    /* Get home page */
router.get('/',async function (req, res, next) {
  let user=req.session.user
  let cartCount=null
  if (user) {
  cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  productHelpers.GetAllProducts().then((products)=>{
    res.render('user/view-products',{products,user,cartCount})
    }) 
});
router.get('/login',(req,res)=>{
  if (req.session.loggedIn) {
    res.redirect('/')
  }else{
  res.render('user/login',{"loginErr":req.session.loginErr})
  req.session.loginErr=false
  }
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
   userHelper.Dosignup(req.body).then((response)=>{
    req.session.loggedIn=true
    req.session.user=req.body
    res.redirect('/')
   })
})
router.post('/login',(req,res)=>{
   userHelper.Dologin(req.body).then((response)=>{
    if (response.status) {
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }else{
      req.session.loginErr="Ivilad user name or password"
      res.redirect('/login')
    }
   })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})
router.get('/cart',verifylogin ,async(req,res)=>{
  let products=await userHelper.getCartProducts(req.session.user._id)
   console.log(products);
  res.render('user/cart',{products,user:req.session.user})
})
router.get('/add-to-cart/:id',(req,res)=>{
  console.log("api call");
  userHelper.addToCart(req.params.id,req.session.user._id).then((response)=>{
    res.json({status:true})
  })
})
router.post('/change-product-quantity',(req,res,next)=>{
  userHelper.changeProductQuantity(req.body).then(()=>{
  })
})


module.exports = router;
