const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Vendor = require('../models/vendor')


//endpoint to SignUp
router.post('/signup', async(req, res) =>{
    const {fullname, email, phone_no, password, companyName, ownerName, address} = req.body
    if(!fullname || !email || !phone_no || !password || !companyName || !ownerName || !address)
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'})

    try {
        const check = await Vendor.findOne({email: email})
        if(check)
            return res.status(200).send({status: 'ok', msg: 'An account with this email already exists'})

        const hashedpassword = await bcrypt.hash(password, 10)
        
        const vendor = new Vendor()
        vendor.fullname = fullname
        vendor.companyName = companyName
        vendor.ownerName = ownerName
        vendor.email = email
        vendor.phone_no = phone_no
        vendor.password = hashedpassword
        vendor.address = address
        vendor.gender = ""
        vendor.age = 

        await vendor.save()

        return res.status(200).send({status: 'ok', msg: 'Vendor created successfully', vendor})
        
    } catch (error) {
        if(error.name == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})
    
        return res.status(500).send({status: 'error', msg:'An error occured'})
    }
})

//endpoint to Login
router.post('/login', async(req, res) => {
    const {email, password} = req.body
    if (!email || !password)
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'})

    try {
        // get vendor from database
        let vendor = await Vendor.findOne({email}).lean()
        if(!vendor)
            return res.status(200).send({status: 'ok', msg:'No vendor with this email found'})

        //compare password
        const correct_password = await bcrypt.compare(password, vendor.password)
        if(!correct_password)
            return res.status(200).send({status: 'ok', msg:'Incorrect Password'})

        // create token
        const token = jwt.sign({
            _id: vendor._id,
            email: vendor.email
        }, process.env.JWT_SECRET)

        //update vendor document to online
        vendor = await Vendor.findOneAndUpdate({email}, {is_online: true}, {new: true}).lean()

        //send response
        res.status(200).send({status: 'ok', msg: 'Login Successful', vendor, token})
        
    } catch (error) {
        console.log(error)
        return res.status(500).send({status: 'error', msg:'An error occured'})  
    }
})

//endpoint to Logout
router.post('/logout', async(req, res) => {
    const {token} = req.body
    if(!token)
        return res.status(400).send({status: 'error', msg: 'Token is required'})

    try {
        //verify token
        const mVendor = jwt.verify(token, process.env.JWT_SECRET)
        
        const vendor_id = mVendor._id

        await Vendor.updateOne({_id: vendor_id}, {is_online: false})
        return res.status(200).send({status: 'ok', msg: 'Logout Successful'})
    } catch (error) {
        console.log(error)
        if(error == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'An error occured'})    
    }
})

//endpoint to delete account
router.post('/delete_account', async(req, res) => {
    const {token} = req.body
    if(!token)
        return res.status(400).send({status: 'error', msg: 'Token is required'})

    try {
        //verify token
        const vendor = jwt.verify(token, process.env.JWT_SECRET)

        //Find the vendor and delete the account
        const Duser = await Vendor.findByIdAndDelete(vendor._id)

            //Check if the vendor exists and was deleted
        if(!Duser)
            return res.status(400).send({status: 'error', msg: 'No vendor Found'})

        return res.status(200).send({status: 'ok', msg: 'Account Successfully deleted'})

    } catch (error) {
        console.log(error)

        if(error == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'An error occured'})    
    }

})


module.exports = router