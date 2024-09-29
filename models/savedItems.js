const mongoose = require('mongoose')
const Schema = mongoose.Schema

const savedItemsSchema = new Schema({
    user_id : String,
    items : [{
        product_id: {type: String, required: true},
        saved_at: {type: Date, default: Date.now}
    }],
    createdAt: {type: Date, default: Date.now}
}, {collection: 'SavedItems'})

const model = mongoose.model('savedItems', savedItemsSchema)
module.exports = model