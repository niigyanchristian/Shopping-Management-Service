const mongoose = require('mongoose');
const { OrderModel, CartModel } = require('../models');
const { v4: uuidv4 } = require('uuid');
mongoose.set('useFindAndModify', false);

//Dealing with data base operations
class ShoppingRepository {

    async Orders(customerId){

        const orders = await OrderModel.find({customerId});
        
        return orders;

    }

    async AllOrders(){
        const orders = await OrderModel.find({});
        return orders;
    }

    async Cart(customerId){

        const cartItems = await CartModel.find({ customerId: customerId });


        if(cartItems){
            return cartItems;
        }

        throw new Error('Data Not found!');
    }

    async AddCartItem(customerId,item,qty,isRemove){
 
            // return await CartModel.deleteMany();
 
            const cart = await CartModel.findOne({ customerId: customerId })

            const { _id } = item;

            if(cart){
                
                let isExist = false;

                let cartItems = cart.items;


                if(cartItems.length > 0){

                    cartItems.map(item => {
                                                
                        if(item.product._id.toString() === _id.toString()){
                            if(isRemove){
                                cartItems.splice(cartItems.indexOf(item), 1);
                             }else{
                               item.unit = qty;
                            }
                             isExist = true;
                        }
                    });
                } 
                
                if(!isExist && !isRemove){
                    cartItems.push({product: { ...item}, unit: qty });
                }

                cart.items = cartItems;

                return await cart.save()
 
            }else{

               return await CartModel.create({
                    customerId,
                    items:[{product: { ...item}, unit: qty }]
                })
            }

        
    }
 
    async CreateNewOrder(customerId, txnId,name,address,contact,note,shop_id,destCoords){
        //required to verify payment through TxnId


        const cart = await CartModel.findOne({ customerId: customerId })

        console.log(cart)
        if(cart){         
            
            let amount = 0;   

            let cartItems = cart.items;

            if(cartItems.length > 0){
                //process Order
                
                cartItems.map(item => {
                    amount += parseInt(item.product.price) *  parseInt(item.unit);   
                });
    
                const orderId = uuidv4();
    
                const order = new OrderModel({
                    orderId,
                    customerId,
                    amount,
                    items: cartItems,
                    name,address,contact,note,destCoords
                })
    
                cart.items = [];
                
                const orderResult = await order.save();
                await cart.save();
                return orderResult;
            }

 

        }

        return {}
    }
    async UpdateOldOrder(orderId, productId, newStatus){

        // const order = await OrderModel.findById('66a13ff3e71a5f1d507eef84');
        const updatedOrder = await OrderModel.findOneAndUpdate(
            { orderId: orderId, 'items.product._id': productId },
            { $set: { 'items.$.product.status': newStatus } },
            { new: true }
        );
        // console.log('====================================');
        // console.log(order,orderId);
        // console.log('====================================');
        return updatedOrder;
    }
    
    async UpdateOrderStatus(id, status){
        const order = await OrderModel.findByIdAndUpdate(id,{ status:status },{new:true});
        return order
    }

}

module.exports = ShoppingRepository;
