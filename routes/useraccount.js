const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
dotenv.config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

const cloudinary = require('../utils/cloudinary')
const Uploader = require('../utils/multer')


//edit profile
router.post('/edit_profile', Uploader.single('image'), async(req, res) =>{
    const {token, fullname, email, phone_no, age, gender} = req.body
    if(!token)
        return res.status(400).send({status: 'error', msg:'All fields must be filled'})

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET)

        let Muser = await User.findById({_id: user._id}, {fullname: 1, email: 1, phone_no: 1, age: 1, gender: 1, img_id: 1, img_url: 1}).lean()
        if(!Muser)
            return res.status(200).send({status: 'ok', msg: 'No user found'})

        /*let img_id= "", img_url = ""
        // check if user passed in an image to upload
        if(req.file)
        // checks if there was a profile picture there before and destory
        if(Muser.img_id)
            await Cloudinary.uploader.destroy(Muser.img_id)

        //upload new picture
        const{secure_url, public_id} = await Cloudinary.uploader.upload(req.file.path, {
            folder: "user-images",
          })
        img_id = public_id
        img_url = secure_url
        */

        //update user document
        Muser = await User.findByIdAndUpdate({_id: user._id}, {
            fullname: fullname || Muser.fullname,
            email: email || Muser.email,
            phone_no: phone_no || Muser.phone_no,
            age: age || Muser.age,
            gender: gender || Muser.gender,
            /*img_id: img_id || Muser.img_id,
            img_url: img_url || Muser.img_url
            */
        }, {new: true}).lean()

        return res.status(200).send({status: 'ok', msg: 'Edited successfully', Muser})

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
        const user = jwt.verify(token, process.env.JWT_SECRET)

        const Muser = await User.findById({_id: user._id}).lean()
        if(!Muser)
            return res.status(200).send({status: 'ok', msg: 'No user Found'})

        return res.status(200).send({status: 'ok', msg: 'Successful', Muser})
        
    } catch (error) {
        console.log(error)
        if(error.name == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'An error occured'})
    }
})


module.exports = router