const db = require('../config/connection')
const collections = require('../config/collections')
const bcrypt = require('bcrypt')
const Razorpay = require('razorpay')
const { resolve } = require('path')
const { response } = require('express')
const objectId = require('mongodb').ObjectId
var instance = new Razorpay({
    key_id: 'rzp_test_2KevjUREiq5hiq',
    key_secret: 'ZpQUxhvR0TE9Z8LzIMZj8AeK',
})

module.exports = {
    sendsms: (p) => {
        return new Promise((resolve, reject) => {
            const Service_SID = 'VA46b13a823c6950c9ff1f0a701ad6d761';

            const Account_SID = 'ACe0d1f0b73ca0d55b9e76e4bc5826fa8e';

            const Auth_Token = '8db3a1d451587f20152f9e8da514b377';
            console.log(p);
            const client = require('twilio')(Account_SID, Auth_Token, Service_SID);
            client.verify.v2.services(Service_SID)
                .verifications
                .create({ to: `+91${p}`, channel: 'sms' })
            resolve(response)
            console.log(response);
            console.log("vannu njan....");
        })
    },
    verifyotp: (num, otp) => {
        const Service_SID = 'VA46b13a823c6950c9ff1f0a701ad6d761';

        const Account_SID = 'ACe0d1f0b73ca0d55b9e76e4bc5826fa8e';

        const Auth_Token = '8db3a1d451587f20152f9e8da514b377';
        const client = require('twilio')(Account_SID, Auth_Token, Service_SID);
        return new Promise((resolve, reject) => {
            client.verify.v2.services(Service_SID)
                .verificationChecks
                .create({ to: `+91${num}`, code: otp })
            resolve(response)
            console.log("kannan");
            console.log(response);
        })
    },
    Dosignup: (userData) => {
        userData.access = true
        return new Promise(async (resolve, reject) => {
            let email = userData.email
            let user = await db.get().collection(collections.USER_COLLECTION)
                .find({ email }).toArray()
            resolve(user)
            if (user != 0) {
                console.log("kannan");
            } else {
                userData.password = await bcrypt.hash(userData.password, 10)
                db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve(data.insertedId)
                })
            }




        })
    },
    Dologin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ name: userData.name })
            if (user) {
                if (user.access == true) {
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
                    console.log("user blocked");
                    resolve({ status: false })
                }
            } else {
                console.log("login failed");
                resolve({ status: false })
            }
        })
    },
    // inseAddres: (userAd, userId) => {
    //     userAd.default = false
    //     return new Promise(async (resolve, reject) => {
    //         let userd = await db.get().collection(collections.DETAILS_COLLECTION).findOne({ user: objectId(userId) })
    //         if (userd) {
    //             db.get().collection(collections.DETAILS_COLLECTION)
    //                 .updateOne({ user: objectId(userId) },
    //                     {
    //                         $push: { addreess: userAd }
    //                     }
    //                 )
    //         } else {
    //             let userObj = {
    //                 user: objectId(userId),
    //                 addreess: [userAd]
    //             }
    //             db.get().collection(collections.DETAILS_COLLECTION)
    //                 .insertOne(userObj)
    //         }
    //     })
    // },
    getaddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let addreess = await db.get().collection(collections.DETAILS_COLLECTION)
                .aggregate([
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$addreess'
                    }
                ]).toArray()
            resolve(addreess)
        })
    },
    addToCart: (proId, userId) => {
        console.log(proId, userId);
        console.log("pappan");
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
                    $group: {
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
            let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetils: {
                    mobile: order.mobile,
                    address: order.address,
                    totalAmount: total,
                    pincode: order.pincode,
                    name: order.name
                },
                userId: objectId(order.userId),
                paymentmethod: order['payment-method'],
                products: products,
                status: status,
                date: new Date()
            }
            db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collections.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })
                resolve(response.insertedId)
            })
        })
    },
    getCartProList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            resolve(cart.products)
        })
    },
    removePro: (proId, cartId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CART_COLLECTION).
                updateOne({ _id: objectId(proId) },
                    {
                        $pull: { products: { item: objectId(cartId) } }
                    }
                ).then((response) => {
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
    getUserOreders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collections.ORDER_COLLECTION)
                .find({ userId: objectId(userId) }).toArray()
            console.log(orders);
            resolve(orders)
        })
    },
    getorderProd: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collections.ORDER_COLLECTION)
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
    genaratRaz: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId
            };
            console.log("ivanaara!");
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                    console.log("ivide err");
                } else {
                    resolve(order)
                    console.log("successes");
                }
            })
        })
    },
    verifypayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', 'ZpQUxhvR0TE9Z8LzIMZj8AeK')
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },
    changepaymentstats: (orderId) => {
        console.log("kannan", orderId);
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION)
                .updateOne({ _id: objectId(orderId) },
                    {
                        $set: {
                            status: 'placed'
                        }
                    }
                ).then(() => {
                    resolve()
                })
        })
    },
    getaccounts: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collections.USER_COLLECTION)
                .find()
                .toArray()
            resolve(users)
        })
    },
    getallorders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collections.ORDER_COLLECTION)
                .find()
                .toArray()
            resolve(orders)
            console.log(orders);
        })
    },
    adtowish: (proId, userId) => {
        proObj = {
            item: objectId(proId)
        }
        return new Promise(async (resolve, reject) => {
            let userwish = await db.get().collection(collections.WISH_COLLECTION).findOne({ user: objectId(userId) })
            if (userwish) {
                db.get().collection(collections.WISH_COLLECTION)
                    .updateOne({ user: objectId(userId) },
                        {
                            $push: { products: proObj }
                        }
                    ).then((response) => {
                        resolve(response)
                    })
            } else {
                let wishObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collections.WISH_COLLECTION)
                    .insertOne(wishObj).then((response) => {
                        resolve(response)
                    })
            }

        })
    },
    getwish: (userId) => {
        return new Promise(async (resolve, reject) => {

            let wishPro = await db.get().collection(collections.WISH_COLLECTION)
                .aggregate([
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item'
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
                            item: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    }
                ]).toArray()
            resolve(wishPro)
            console.log("kannan");
        })
    },
    removewish: (proId, userId) => {
        console.log(proId, userId);
        return new Promise((resolve, reject) => {
            db.get().collection(collections.WISH_COLLECTION)
                .updateOne({ user: objectId(userId) },
                    {
                        $pull: { products: { item: objectId(proId) } }
                    }
                ).then((response) => {
                    resolve(response)
                    console.log(response);
                })
        })
    },
    macbook: () => {
        return new Promise(async (resolve, reject) => {
            let macbook = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find({ name: "MAC BOOK" })
                .toArray()
            resolve(macbook)
            console.log(macbook);
        })
    },
    asus: () => {
        return new Promise(async (resolve, reject) => {
            let asus = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find({ name: "ASUS" })
                .toArray()
            resolve(asus)
        })
    },
    lenovo: () => {
        return new Promise(async (resolve, reject) => {
            let lenovo = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find({ name: "LENOVO" })
                .toArray()
            resolve(lenovo)
        })
    },
    hp: () => {
        return new Promise(async (resolve, reject) => {
            let hp = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find({ name: "HP" })
                .toArray()
            resolve(hp)
        })
    },
    dell: () => {
        return new Promise(async (resolve, reject) => {
            let dell = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find({ name: "DELL" })
                .toArray()
            resolve(dell)
        })
    },
    acer: () => {
        return new Promise(async (resolve, reject) => {
            let acer = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find({ name: "ACER" })
                .toArray()
            resolve(acer)
        })
    },
    jumper: () => {
        return new Promise(async (resolve, reject) => {
            let jumper = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find({ name: "JUMPER" })
                .toArray()
            resolve(jumper)
        })
    },
    sumsung: () => {
        return new Promise(async (resolve, reject) => {
            let sumsung = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find({ name: "SUMSUNG" })
                .toArray()
            resolve(sumsung)
        })
    },
    blockuser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION)
                .updateOne({ _id: objectId(userId) },
                    {
                        $set:
                        {
                            access: false
                        }
                    },
                )
        })
    },
    unblockuser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION)
                .updateOne({ _id: objectId(userId) },
                    {
                        $set:
                        {
                            access: true
                        }
                    },
                )
        })
    },
    getAllusers: () => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collections.USER_COLLECTION)
                .find({ access: true })
                .count()
            resolve(user)
            console.log(user);
        })
    },
    getAllcanceld: () => {
        return new Promise(async (resolve, reject) => {
            let cancel = await db.get().collection(collections.ORDER_COLLECTION)
                .find({ status: "Shipped" })
                .count()
            resolve(cancel)
            console.log(cancel);
        })
    },
    getAllshiped: () => {
        return new Promise(async (resolve, reject) => {
            let shiped = await db.get().collection(collections.ORDER_COLLECTION)
                .find({ status: "Delivered" })
                .count()
            resolve(shiped)
            console.log(shiped);
        })
    },
    getAllpending: () => {
        return new Promise(async (resolve, reject) => {
            let pending = await db.get().collection(collections.ORDER_COLLECTION)
                .find({ status: "pending" })
                .count()
            resolve(pending)
            console.log(pending);
        })
    },
    allorder: () => {
        return new Promise(async (resolve, reject) => {
            let allorder = await db.get().collection(collections.ORDER_COLLECTION)
                .find({ status: "placed" })
                .count()
            resolve(allorder)
            console.log(allorder);
        })
    },
    // totalsale: () => {
    //     return new Promise(async (resolve, reject) => {
    //         let totalsale = await db.get().collection(collections.ORDER_COLLECTION)
    //             .aggregate([
    //                 {
    //                     $match: {
    //                         status: "placed"
    //                     }
    //                 },
    //                 {
    //                     $group: {
    //                         _id: null,
    //                         Amount: { $sum: '$totalAmount' }
    //                     }
    //                 }
    //             ]).toArray()
    //         resolve(totalsale[0].Amount)
    //         console.log(totalsale[0].Amount);
    //     })
    // },
    latestorder: () => {
        return new Promise(async (resolve, reject) => {
            let latest = await db.get().collection(collections.ORDER_COLLECTION)
                .find()
                .sort({ _id: -1 })
                .limit(1).toArray()
            resolve(latest)
            console.log(latest);
        })
    },
    couponlist: () => {
        return new Promise(async (resolve, reject) => {
            let coupons = await db.get().collection(collections.COPUN_COLLECTION)
                .find().toArray()
            resolve(coupons)
        })
    },
    // insertcoupon:(coupon)=>{
    //     return new Promise((resolve,reject)=>{
    //         couponLists={
    //             coupon:objectId(coupon)
    //     }
    //     couponobject={
    //         coupon:[couponLists]
    //     }
    //     db.get().collection(collections.COPUN_COLLECTION)
    //     .insertOne(couponobject)
    //     resolve(response)
    //     console.log(response);
    //     })
    // }

}       
