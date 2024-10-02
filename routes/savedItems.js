const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const SavedItems = require('../models/savedItems')


// verify JWT token
const verifyToken = (req, res) => {
    //Bearer token extraction
    const token = req.header('Authorization')?.split('')[1]

    //Log the token
    console.log('Token received:', token)

    //Log the JWT secret
    console.log('JWT Secret:', process.env.JWT_SECRET)

    if(!token) {
        return res.status(400).send({status: 'error', msg: 'Token is required'})
        return null
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        //Log the exact error
        console.error('JWT Error:', error)

        if (error.name === 'JsonWebTokenError') {
            return res.status(400).send({status: 'error', msg: 'Invalid token'})
        } else if (error.name === 'TokenExpiredError') {
            return res.status(400).send({status: 'error', msg: 'Token expired'})
        } else {
            return res.status(500).send({status: 'error', msg:'Failed to update order', error: error.message})
        }
        return null
    }
}

 
//endpoint for all saved items for the authenticated user
router.post('/all_savedItems', async(req, res) => {
    const user = verifyToken(req, res)

    //If token is invalid, stop further processing
    if(!user?._id) return

    try {
        const savedItems = await SavedItems.find({user_id: user.id})

        return res.status(200).json({status: 'ok', savedItems})
    } catch (error) {
        return res.status(500).json({status: 'error', msg: 'Failed to fetch saved items', error: error.message})
    }
})

//endpoint for new saved item
router.post('/new_savedItem', async(req, res) =>{
    const user = verifyToken(req, res)

    //If token is invalid, stop further processing
    if(!user?._id) return

    const {item_id, name, price, category} = req.body
    
    try {
        //Create a new saved item with the user's ID
        const newSavedItem = new SavedItem()

        //Attach the user ID from the token
        newSavedItem.user_id = user._Id
        newSavedItem.item_id = item_id
        newSavedItem.name = name
        newSavedItem.price = price
        newSavedItem.category = category
        newSavedItem.saved_date = new Date()
        newOrder.status = 'pending'

        await newSavedItem.save()

        return res.status(200).send({status: 'ok', msg: 'Item saved successfully', newSavedItem})
        
    } catch (error) {
        return res.status(500).send({status: 'error', msg:'Failed to save item', error: error.message})
    }
})

//endpoint to update existing saved item
router.post('/update_savedItem', async(req, res) =>{
    const user = verifyToken(req, res)

    //If token is invalid, stop further processing
    if(!user?._id) return

    const {savedItem_id, name, price, category} = req.body
    
    if(!savedItem_id) {
        return res.status(400).send({status: 'error', msg: 'Saved item ID is required'})
    }
    
    if(!name && !category) {
        return res.status(400).send({status: 'error', msg: 'At least one field must be updated'})
    }

    try {
        //Fetch the existing order to compare fields
        const eSavedItem = await SavedItem.findById(savedItem_id)
        if(!eSavedItem) {
            return res.status(400).send({status: 'error', msg: 'Saved item is not found'})
        }
        
        //Update the order
        const updatedSavedItem = await SavedItem.findByIdAndUpdate(savedItem_id, {
            name: name || eSavedItem.name,
            category: category || eSavedItem.category
        }, {new: true})

        //Return success response
        return res.status(200).send({status: 'ok', msg: 'Saved item updated successfully', updatedSavedItem})
        
    } catch (error) {
        return res.status(500).send({status: 'error', msg:'Failed to update saved item', error: error.message})
    }
})

//endpoint to delete 
router.post('/delete_savedItem', async(req, res) => {
    const user = verifyToken(req, res)

    //If token is invalid, stop further processing
    if(!user?._id) return

    const {savedItem_id} = req.body
    if(!savedItem_id)
        return res.status(400).send({status: 'error', msg: 'Saved item ID is required'})

    try {
        //Find and delete the order by its ID
        const deletedSavedItem = await SavedItem.findByIdAndDelete(savedItem_id)

        //Check if the order exists
        if(!deletedSavedItem)
            return res.status(400).send({status: 'error', msg: 'Saved item not Found'})

        return res.status(200).send({status: 'ok', msg: 'Saved item Successfully deleted'})

    } catch (error) {
        console.log(error)

        if(error == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'Failed to delete saved item', error: error.message})    
    }

})

module.exports = router