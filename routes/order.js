const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Order = require('../models/order')


//Middleware to verify JWT token
const verifyToken = (req, res) => {
    //Log the full Authorization header for debugging
    console.log("Full Authorization header:", req.header('Authorization'))


    //Extract the token by replacing 'Bearer' prefix if it exists
    const token = req.header('Authorization')?.replace('Bearer ', '')
    console.log("Token extracted:", token)

    if(!token) {
        return res.status(400).send({status: 'error', msg: 'Access denied. No token provided.'})
    }

    try {
        //Verify the token
        return jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key')
    } catch (error) {
        //Log the exact error
        if (error.name === 'JsonWebTokenError') {
            res.status(400).send({status: 'error', msg: 'Invalid token'})
        } else if (error.name === 'TokenExpiredError') {
            res.status(400).send({status: 'error', msg: 'Token expired'})
        } else {
            res.status(500).send({status: 'error', msg:'Token verification failed'})
        }
        return null
    }
}

 
//endpoint for all orders for the authenticated user
router.post('/all_orders', async(req, res) => {
    const user = verifyToken(req, res)

    //If token is invalid, stop further processing
    if(!user?._id) return

    try {
        const orders = await Order.find({user_id: user._id})

        return res.status(200).send({status: 'ok', orders})
    } catch (error) {
        return res.status(500).send({status: 'error', msg: 'Failed to fetch orders', error: error.message})
    }
})

//endpoint for specific order
router.post('/specific_order', async(req, res) => {
    const user = verifyToken(req, res)

    //If token is invalid, stop further processing
    if(!user?._id) return

    const {order_id} = req.body
    if (!order_id) {
        return res.status(400).send({status: 'error', msg: 'Order ID is required'})
    }
    try {
        const order = await Order.findById(order_id)

        if (!order) {
            return res.status(400).send({status: 'error', msg: 'Order not found'})
        }
        return res.status(200).send({status: 'ok', order})
    } catch (error) {
        return res.status(500).send({status: 'error', msg: 'Failed to fetch order', error: error.message})
    }
})

//endpoint for new order
router.post('/new_order', async(req, res) =>{
    const user = verifyToken(req, res)

    //If token is invalid, stop further processing
    if(!user?._id) return

    const {items, total_price, delivery_address} = req.body
    if(!items || !total_price || !delivery_address)
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'})

    try {
        //Create a new order with the user's ID
        const newOrder = new Order()

        //Attach the user ID from the token
        newOrder.user_id = user._Id
        newOrder.items = items
        newOrder.total_price = total_price
        newOrder.delivery_address = delivery_address
        newOrder.order_date = new Date()
        newOrder.status = 'pending'
        await newOrder.save()

        return res.status(200).send({status: 'ok', msg: 'Order created successfully', newOrder})
        
    } catch (error) {
        return res.status(500).send({status: 'error', msg:'Failed to create order', error: error.message})
    }
})

//endpoint to update existing order
router.post('/update_order', async(req, res) =>{
    const user = verifyToken(req, res)

    //If token is invalid, stop further processing
    if(!user?._id) return

    const {order_id, items, total_price, delivery_address, status} = req.body
    
    if(!order_id)
        return res.status(400).send({status: 'error', msg: 'Order ID is required'})

    if(!items && !total_price && !delivery_address && !status)
        return res.status(400).send({status: 'error', msg: 'At least one field must be updated'})

    try {
        //Fetch the existing order to compare fields
        const eOrder = await Order.findById(order_id)
        if(!eOrder) {
            return res.status(400).send({status: 'error', msg: 'Order is not found'})
        }

        //If the submitted data are the same as the existing ones
        if(
            items === eOrder.items &&
            total_price === eOrder.total_price &&
            delivery_address === eOrder.delivery_address &&
            status === eOrder.status
        ) {
            return res.status(400).send({staus: 'error', msg: 'Cannot use the same value for update'})
        }
        
        //Update the order
        const updatedOrder = await Order.findByIdAndUpdate(order_id, {
            items: items || eOrder.items,
            total_price: total_price || eOrder.total_price,
            delivery_address: delivery_address || eOrder.delivery_address,
            status: status || eOrder.status
        }, {new: true})

        //Return success response
        return res.status(200).send({status: 'ok', msg: 'Order updated successfully', updatedOrder})
        
    } catch (error) {
        return res.status(500).send({status: 'error', msg:'Failed to update order', error: error.message})
    }
})

//endpoint to delete order
router.post('/delete_order', async(req, res) => {
    const user = verifyToken(req, res)

    //If token is invalid, stop further processing
    if(!user?._id) return

    const {order_id} = req.body
    if(!order_id)
        return res.status(400).send({status: 'error', msg: 'Order ID is required'})

    try {
        //Find and delete the order by its ID
        const deletedOrder = await Order.findByIdAndDelete(order_id)

        //Check if the order exists
        if(!deletedOrder)
            return res.status(400).send({status: 'error', msg: 'Order not Found'})

        return res.status(200).send({status: 'ok', msg: 'Order Successfully deleted'})

    } catch (error) {
        return res.status(500).send({status: 'error', msg:'Failed to delete order', error: error.message})    
    }
})

module.exports = router