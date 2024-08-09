const express = require('express')
const router = express.Router()

const User = require('./models/user')


router.post('/signup', async(req, res) =>{
    const {fullname, email, password} = req.body
    if(!fullname || !email || !password)
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'})

    try {

        const user = new User
        user.fullname = fullname,
        user.email = email,
        user.password = password

        await user.save()

        return res.status(200).send({status: 'ok', msg: 'User created successfully'})
        
    } catch (error) {
        if(error.name == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})
    
        return res.status(500).send({status: 'error', msg:'An error occured'})
    }
})




module.exports = router
