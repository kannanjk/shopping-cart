var db=require('../config/connection')
const collections = require('../config/collections')
var objectId=require('mongodb').ObjectId

module.exports={
    addProduct:(product,callback)=>{
        product.prize = parseInt(product.prize, 10);
        db.get().collection(collections.PRODUCT_COLLECTION)
        .insertOne(product).then((data) => {
        callback(data.insertedId)
    }) 
    },
    GetAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collections.PRODUCT_COLLECTION)
            .find()
            .sort({prize:-1})
            .toArray()
            resolve(products)
        })
    },
    deletePorduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection
          (collections.PRODUCT_COLLECTION).deleteOne({_id:objectId(prodId)}).then((response)=>{
            resolve(response)
          })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proId,productDetails)=>{
        productDetails.prize = parseInt(productDetails.prize, 10);
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(proId)},{
                $set:{
                    name:productDetails.name,
                    Model:productDetails.Model,
                    prize:productDetails.prize
                }
            }).then((response)=>{
                resolve()
            })
        })
    }
}