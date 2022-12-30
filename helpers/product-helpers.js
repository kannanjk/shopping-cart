var db = require('../config/connection')
const collections = require('../config/collections');
const bcrypt = require('bcrypt');
var objectId = require('mongodb').ObjectId

module.exports = {
    addProduct: (product, callback) => {
        product.prize = parseInt(product.prize, 10);
        db.get().collection(collections.PRODUCT_COLLECTION)
            .insertOne(product).then((data) => {
                callback(data.insertedId)
            })
    },
    getbigestpro: () => {
        return new Promise(async (resolve, reject) => {
            let bigest = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find().sort({ prize: -1 })
                .limit(1)
                .toArray()
            resolve(bigest)
        })

    },
    secondBigestPro: () => {
        return new Promise(async (resolve, reject) => {
            let secbigest = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find().sort({ prize: -1 })
                .limit(4)
                .toArray()
            resolve(secbigest)
        })

    },
    GetAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find()
                .sort({ prize: -1 })
                .toArray()
            resolve(products)
        })
    },
    deletePorduct: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({ _id: objectId(prodId) }).then((response) => {
                resolve(response)
            })
        })
    },
    getProductDetails: (njan) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(njan) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateProduct: (proId, productDetails) => {
        productDetails.prize = parseInt(productDetails.prize, 10);
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(proId) }, {
                    $set: {
                        name: productDetails.name,
                        Model: productDetails.Model,
                        prize: productDetails.prize
                    }
                }).then((response) => {
                    console.log(response);
                    resolve()
                })
        })
    },
    leatestpro: () => {
        return new Promise(async (resolve, reject) => {
            let latest = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find()
                .sort({ _id: -1 })
                .limit(1).toArray()
            resolve(latest)
        })
    },
    leatestproshop: () => {
        return new Promise(async (resolve, reject) => {
            let latest = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find()
                .sort({ _id: -1 })
                .limit(10).toArray()
            resolve(latest)
        })
    },
    admindetils: (adminId) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({ name: adminId.name })
            if (admin) {
                bcrypt.compare(adminId.password, admin.password).then((status) => {
                    if (status) {
                        console.log("login succsses");
                        response.admin = admin
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
    fivethuo: () => {
        return new Promise(async (resolve, reject) => {
            let fivethuo = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find({ "prize": { "$gt": 5000, "$lt": 10000 } })
                .toArray()
            resolve(fivethuo)
        })
    },
    tenthuo: () => {
        return new Promise(async (resolve, reject) => {
            let tenthuo = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find({ "prize": { "$gt": 10000, "$lt": 20000 } })
                .toArray()
            resolve(tenthuo)
        })
    },
    twentythuo: () => {
        return new Promise(async (resolve, reject) => {
            let twentythuo = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find({ "prize": { "$gt": 20000, "$lt": 30000 } })
                .toArray()
            resolve(twentythuo)
        })
    },
    thirtythuo: () => {
        return new Promise(async (resolve, reject) => {
            let thirtythuo = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find({ "prize": { "$gt": 30000, "$lt": 40000 } })
                .toArray()
            resolve(thirtythuo)
        })
    },
    fourtythuo: () => {
        return new Promise(async (resolve, reject) => {
            let fourtythuo = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find({ "prize": { "$gt": 40000, "$lt": 50000 } })
                .toArray()
            resolve(fourtythuo)
        })
    },
    fourtythuo: () => {
        return new Promise(async (resolve, reject) => {
            let fourtythuo = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find({ "prize": { "$gt": 40000, "$lt": 50000 } })
                .toArray()
            resolve(fourtythuo)
        })
    },
    fiftyabove: () => {
        return new Promise(async (resolve, reject) => {
            let fiftyabove = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find({ "prize": { "$gte": 50000 } })
                .toArray()
            resolve(fiftyabove)
        })
    },
    changestatus: (oid, value) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION)
                .updateOne({ _id: objectId(oid) },
                    {
                        $set: {
                            status: value,
                            orderStatus: value
                        }
                    }
                ).then((response) => {
                    console.log(response);
                })
        })
    },
    catagorys: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let sumsung = await db.get().collection(collections.PRODUCT_COLLECTION)
                .find({ name: userId })
                .toArray()
            resolve(sumsung)
            console.log(sumsung);
        })
    },
    submitAddress: (proId, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.DETAILS_COLLECTION)
                .updateOne({ user: userId, "addreess.default": true },
                    {
                        $set: { "addreess.$.default": false }
                    }
                )
            db.get().collection(collections.DETAILS_COLLECTION)
                .updateOne({ user: userId, "_id": proId },
                    {
                        $set: { "addreess.$.default": true }
                    }
                )
        })
    },
    adddcopun: (proId) => {
        console.log(proId);
        return new Promise(async (resolve, reject) => {
            db.get().collection(collections.COPUN_COLLECTION)
                .insertOne(proId)
            resolve()
        })
    },
    verifycoupon: (couponcode, total) => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collections.COPUN_COLLECTION)
                .findOne({ Code: couponcode })
            resolve(coupon)
        })
    }


}