const mongoose = require('mongoose')
const Schema = mongoose.Schema

const savedItemSchema = new Schema({
    user_id : String,
    items : [{
        product_id: {type: String, required: true},
        name: {type: String, require: true},
        price: {type: Number, required: true},
        category: {type: String, required: true},
        saved_at: {type: Date, default: Date.now}
    }],
    createdAt: {type: Date, default: Date.now}
}, {collection: 'SavedItem'})

const model = mongoose.model('savedItems', savedItemSchema)
module.exports = model