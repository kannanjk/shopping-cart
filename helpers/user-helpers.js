const db = require('../config/connection')
const collections = require('../config/collections')
const bcrypt = require('bcrypt')
const Razorpay = require('razorpay')
const { resolve } = require('path')
const objectId = require('mongodb').ObjectId
var instance= new Razorpay({
    key_id:'rzp_test_2KevjUREiq5hiq',
    key_secret:'ZpQUxhvR0TE9Z8LzIMZj8AeK',
})

module.exports = { 
    Dosignup: (userData) => {   
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.insertedId)
            })
        })
    },
    Dologin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ name: userData.name })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("login succsses");
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("login failed");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("login failed");
                resolve({ status: false })
            }
        })
    },
    addToCart: (proId, userId) => {
        console.log(proId,userId);
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)  // pro=> oro element indexnum kittan  video-29
                if (proExist != -1) {
                    db.get().collection(collections.CART_COLLECTION).
                        updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collections.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {
                                $push: { products: proObj }
                            }
                        ).then((response) => {
                            resolve()
                        })
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length  // length=total
            }
            resolve(count)
        })
    },
    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collections.CART_COLLECTION).
                    updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removproduct: true })
                    })
            } else {
                db.get().collection(collections.CART_COLLECTION).
                    updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true })
                    })
            }
        })
    },
    GetTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $project: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.prize'] } }
                    }
                }
            ]).toArray()
            resolve(total[0].total)
        })
    },
    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            console.log(order, products, total);
            let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetils: {
                    mobile: order.mobile,
                    address: order.address,
                    totalAmount: total,
                    pincode: order.pincode
                },
                userId: objectId(order.userId),
                paymentmethod: order['payment-method'],
                products: products,
                status: status,
                date:new Date()
            }
            db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collections.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })
                console.log("kannan",response.insertedId);
                resolve(response.insertedId)
            })
        })
    },
    getCartProList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            console.log(cart);
            resolve(cart.products)   
        })
    }, 
    removePro: (proId,cartId) => {
        console.log(proId); 
        console.log(cartId); 
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CART_COLLECTION).
                updateOne({ _id: objectId(proId) },
                    {
                        $pull: { products: { item: objectId(cartId) } }
                    } 
                ).then((response)=>{
                    resolve()
                    console.log(response);
                })
        })
    },
    removecartPro: (cartId, userId) => {
        console.log(cartId);
        console.log(userId);
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CART_COLLECTION).
                updateOne({ user: objectId(userId) },
                    {
                        $pull: { products: { item: objectId(cartId) } }
                    }
                ).then((response) => {
                    console.log(response);
                    resolve()
                })  
        })
    },
    getUserOreders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collections.ORDER_COLLECTION)
            .find({userId:objectId(userId)}).toArray()
            console.log(orders);
            resolve(orders)
        })
    },
    getorderProd:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderItems= await db.get().collection(collections.ORDER_COLLECTION)
            .aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(orderItems)
        })
    },
    genaratRaz:(orderId,total)=>{
        return new Promise((resolve,reject)=>{  
            var options={ 
                amount:total*100,
                currency:"INR",
                receipt:""+orderId
            };
            instance.orders.create(options, function(err,order){
                if (err) {
                    console.log(err);
                }else{
                resolve(order)   
                }
            })
        }) 
    },
    verifypayment:(details)=>{
        return new Promise((resolve,reject)=>{
            const crypto=require('crypto')
            let hmac=crypto.createHmac('sha256','ZpQUxhvR0TE9Z8LzIMZj8AeK')
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
            hmac=hmac.digest('hex')
            if (hmac==details['payment[razorpay_signature]']) {
                resolve()  
            }else{
                reject()
            }
        })  
    },
    changepaymentstats:(orderId)=>{
        console.log("kannan",orderId);
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ORDER_COLLECTION)
            .updateOne({_id:objectId(orderId)},
            {
                $set:{
                    status:'placed'
                }
            }
            ).then(()=>{
                resolve()
            })
        })
    }

}       