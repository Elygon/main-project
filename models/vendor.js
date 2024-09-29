const mongoose = require('mongoose')
const Schema = mongoose.Schema

const vendorSchema = new Schema({
    fullname : String,
    companyName: String,
    ownerName: String,
    email: String, 
    phone_no: String,
    password: String,
    address: String,
    is_online:{type: Boolean, default: false },
    age: Number,
    gender: String,
    img_id: String,
    img_url: String,
    timestamp: Number
}, {collection: 'Vendor'})

const model = mongoose.model('vendors', vendorSchema)
module.exports = model