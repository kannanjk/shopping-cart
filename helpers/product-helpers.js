var db=require('../config/connection')
const collections = require('../config/collections')
var objectId=require('mongodb').ObjectId

module.exports={
    addProduct:(product,callback)=>{

        db.get().collection('product').insertOne(product).then((data) => {
        callback(data.insertedId)
    }) 
    },
    GetAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deletePorduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection
          (collections.PRODUCT_COLLECTION).deleteOne({_id:objectId(prodId)}).then((response)=>{
                console.log(response);
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