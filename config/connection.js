const MongoClient = require('mongodb').MongoClient

const dbl = 'mongodb://localhost:27017'
const db = 'mongodb+srv://jishnu:<password>@cluster0.zppmaeb.mongodb.net/?retryWrites=true&w=majority'

const state = {
    db: null
}

module.exports.connect = function (done) {
    const dbname = 'shopping'

    MongoClient.connect(dbl, (err, data) => {
        if (err) return done(err)
        state.db = data.db(dbname)
        done()
    })
}

module.exports.get = function () {
    return state.db
}
