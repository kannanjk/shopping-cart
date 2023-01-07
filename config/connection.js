const MongoClient = require('mongodb').MongoClient

const dbl = 'mongodb://localhost:27017'
const db = 'mongodb+srv://jishnu:iV1nYHf77FYnp8Ju@cluster0.zppmaeb.mongodb.net/MyDB?retryWrites=true&w=majority'

const state = {
    db: null
}

module.exports.connect = function (done) {
    const dbname = 'shopping'

    MongoClient.connect(db, (err, data) => {
        if (err) return done(err)
        state.db = data.db(dbname)
        done()
    })
}

module.exports.get = function () {
    return state.db
}
