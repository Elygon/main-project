const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
    user_id : String,
    items : [{
        product_id: String,
        quantity: {type: Number, required: true},
        price: {type: Number, required: true}
    }],
    total_price: {type: Number, required: true},
    delivery_address: String,
    status: {type: String, default: 'Pending'},
    order_date: {type: Date, default: Date.now}
}, {collection: 'Order'})

const model = mongoose.model('orders', orderSchema)
module.exports = model