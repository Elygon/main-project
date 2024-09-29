const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
dotenv.config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Vendor = require('../models/vendor')

const Cloudinary = require('../utils/cloudinary')
const Uploader = require('../utils/multer')


//edit profile
router.post('/edit_profile', Uploader.single('image'), async(req, res) =>{
    const {token, fullname, email, phone_no, companyName, ownerName, address, age, gender} = req.body
    if(!token)
        return res.status(400).send({status: 'error', msg:'All fields must be filled'})

    try {
        const vendor = jwt.verify(token, process.env.JWT_SECRET)

        let Mvendor = await Vendor.findById({_id: vendor._id}, {fullname: 1, email: 1, phone_no: 1, companyName: 1, ownerName: 1, address: 1, age: 1, gender: 1, img_id: 1, img_url: 1}).lean()
        if(!Mvendor)
            return res.status(200).send({status: 'ok', msg: 'No vendor found'})

        /*let img_id= "", img_url = ""
        // check if vendor passed in an image to upload
        if(req.file)
        // checks if there was a profile picture there before and destory
        if(Mvendor.img_id)
            await Cloudinary.uploader.destroy(Mvendor.img_id)

        //upload new picture
        const{secure_url, public_id} = await Cloudinary.uploader.upload(req.file.path, {
            folder: "vendor-images",
          })
        img_id = public_id
        img_url = secure_url
        */

        //update user document
        Mvendor = await Vendor.findByIdAndUpdate({_id: vendor._id}, {
            fullname: fullname || Mvendor.fullname,
            email: email || Mvendor.email,
            phone_no: phone_no || Mvendor.phone_no,
            companyName: companyName || Mvendor.companyName,
            ownerName: ownerName || Mvendor.ownerName,
            address: address || Mvendor.address,
            age: age || Mvendor.age,
            gender: gender || Mvendor.gender,
            /*img_id: img_id || Mvendor.img_id,
            img_url: img_url || Mvendor.img_url
            */
        }, {new: true}).lean()

        return res.status(200).send({status: 'ok', msg: 'Edited successfully', Mvendor})

    } catch (error) {
        console.log(error)
        if(error.name == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'An error occured'})
    }
})

// endpoint to view profile
router.post('/view_profile', async(req, res) =>{
    const {token }= req.body
    if(!token)
        return res.status(400).send({status: 'error', msg: 'Token required'})

    try {
        const vendor = jwt.verify(token, process.env.JWT_SECRET)

        const Mvendor = await Vendor.findById({_id: vendor._id}).lean()
        if(!Mvendor)
            return res.status(200).send({status: 'ok', msg: 'No vendor Found'})

        return res.status(200).send({status: 'ok', msg: 'Successful', Mvendor})
        
    } catch (error) {
        console.log(error)
        if(error.name == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'An error occured'})
    }
})


module.exports = router