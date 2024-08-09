const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    fullname : String, 
    email: String, 
    password: String
}, {collection: 'User'})

const model = mongoose.model('users', userSchema)
module.exports = model