const { response } = require('express');
var express = require('express');
const { MongoUnexpectedServerResponseError } = require('mongodb');
const productHelpers = require('../helpers/product-helpers');
const userHelper=require('../helpers/user-helpers')
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('admin/login')
});
router.post('/adminlogin',(req,res)=>{
  productHelpers.admindetils(req.body).then((response)=>{
    if (response.status) {
      req.session.adminloggedIn = true
      req.session.admin = response.admin
      res.redirect('/admi/addm') 
    }else{
      req.session.LoginErr = "Invaild user name or password"
      res.redirect('/admi')
    }
    })
  })
router.get('/addm', function (req, res, next) {
  userHelper.getAllusers().then((users)=>{
    userHelper.getAllcanceld().then((Shipped)=>{
      userHelper.getAllshiped().then((Delivered)=>{
        userHelper.getAllpending().then((pending)=>{
          userHelper.allorder().then((order)=>{
          //  userHelper.totalsale().then((totalsale)=>{
              userHelper.latestorder().then((latestorder)=>{
    let admin=  req.session.admin
    res.render('admin/dashbord', {users,order,pending,Shipped,Delivered,latestorder, admin, admin: true })
              })
            })
          })
        })
    })  
    })
  }) 
  //})
router.get('/products', function (req, res, next) {
  productHelpers.GetAllProducts().then((products) => {
  let admin=  req.session.admin
    res.render('admin/view-products', { products,admin, admin: true })
  })
});
router.get('/all-orders', async (req, res) => {
  let orders = await userHelper.getUserOreders(req.session.user._id)
   res.render('user/orders', { orders })
})
router.get('/add-products', (req, res) => {
  res.render('admin/add-products', { admin: true }) 
})
router.post('/add-products', (req, res) => {
  productHelpers.addProduct(req.body, (id) => {
    res.redirect('add-products')
    let image = req.files.image  
    image.mv('./public/product-image/' + id + '.jpg', (err) => {
      if (!err) {
        res.render("admi/add-products")
      } else {
        console.log(err);
      }
    })
  })
})
router.get('/delete-product/:id', (req, res) => {
  let porId = req.params.id
  console.log(porId);
  productHelpers.deletePorduct(porId).then((response) => {
    res.redirect('/admi/addm')  
  })
})
router.get('/edit-products/:id', async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id)
  res.render('admin/edit-products', { product, admin: true })
})
router.post('/edit-products/:id', (req, res) => {   
  let id = req.params.id  
  console.log(id); 
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    console.log("kannan");
    res.redirect('/admi/addm') 
        if (req.files.image) {
      let Image = req.files.image
      Image.mv('./public/product-image/' + id + '.jpg')
    }
  })
})
router.get('/account', async (req, res) => {
   userHelper.getaccounts().then((accounts)=>{
    res.render('admin/allusers',{accounts,admin:true})
  })
})
router.get('/allorders',(req,res)=>{
  userHelper.getallorders().then((allorders)=>{
    res.render('admin/all-orders',{allorders,admin:true})
  })
})
router.get('/Dashbord',(req,res)=>{
  res.redirect('/admi/addm')
})
router.get('/couponList',(req,res)=>{
  res.render('admin/coupons',{admin:true})
})
router.get('/salesreport',(req,res)=>{
  userHelper.getallorders().then((allorders)=>{
  res.render('admin/sales-report',{allorders,admin:true})
})
})
router.get('/addcoupon',(req,res)=>{
  res.render('admin/addcoupon',{admin:true})
})
router.get('/banners',(req,res)=>{
  res.render('admin/baners',{admin:true})
})
router.get('/addBanner',(req,res)=>{
  res.render('admin/addbaner',{admin:true})
})
router.get('/blockUser/:id',(req,res)=>{
  userHelper.blockuser(req.params.id)
  res.redirect('/admi/account')
})
router.get('/unblockUser/:id',(req,res)=>{
  userHelper.unblockuser(req.params.id)
  res.redirect('/admi/account')
})
router.post('/order-status',(req,res)=>{
  let oid=req.body.oid
  let value=req.body.value
  console.log(oid,value);
  productHelpers.changestatus(oid,value).then((response)=>{
  res.redirect('/admi/account')
})
})
router.post('/addcoupon',(req,res)=>{
  // console.log(req.body);
  productHelpers.adddcopun(req.body).then((response)=>{
    res.redirect('/admi/addcoupon')
  })
  })

module.exports = router;