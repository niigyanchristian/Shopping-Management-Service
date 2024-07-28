const ShoppingService = require("../services/shopping-service");
const { PublishCustomerEvent, SubscribeMessage, EstimatedDeliveryDate } = require("../utils");
const  UserAuth = require('./middlewares/auth');
const { CUSTOMER_SERVICE, DELIVERY_SERVICE, PRODUCT_SERVICE } = require('../config');
const { PublishMessage } = require('../utils')

module.exports = (app,channel) => {
    
    const service = new ShoppingService();

    SubscribeMessage(channel, service)

    app.post('/order',UserAuth, async (req,res,next) => {

        const { _id } = req.user;
        const { txnNumber,name,address,contact,note,shop_id,destCoords,deliveryFee } = req.body;

        const { data } = await service.PlaceOrder({_id, txnNumber,name,address,contact,note,shop_id,destCoords});
        const payload = await service.GetOrderPayload(_id, data, 'CREATE_ORDER');
        const data_delivery = {
            orderId: data.orderId,
            trackingNumber: "TRACK"+'-'+Math.random()*10+'-'+data.orderId.toString().substr(0,8),
            estimatedDeliveryDate: EstimatedDeliveryDate(),
            longitude:destCoords?.lng,
            latitude:destCoords?.lat,
            cost:deliveryFee/100
        }
        const payload_delivery = await service.GetOrderPayload(_id, data_delivery, 'CREATE_DELIVERY')



        // PublishCustomerEvent(payload)
        PublishMessage(channel,CUSTOMER_SERVICE, JSON.stringify(payload))
        PublishMessage(channel,PRODUCT_SERVICE, JSON.stringify(payload))
        PublishMessage(channel,DELIVERY_SERVICE, JSON.stringify(payload_delivery))

        res.status(200).json(data);

    });

    app.put('/order/:id',UserAuth,async(req,res)=>{
        const { _id } = req.user
        const orderId = req.params.id ;
        const {productId, newStatus} = req.body;

        try {
            const { data } = await service.UpdateOrder(orderId, productId, newStatus);
        
        const data_delivery = {
            orderId, productId, newStatus
        }
        // const payload = await service.GetOrderPayload(_id, data_delivery, 'UPDATE_DELIVERY_PRODUCT_STATUS')
        
        // console.log('====================================');
        // console.log(payload);
        // console.log('====================================');
        // PublishMessage(channel,CUSTOMER_SERVICE, JSON.stringify(pl));

        res.status(201).json(data);
        } catch (error) {
            console.log('====================================');
            console.log(error.message);
            console.log('====================================');
            // res.status(500).json("Internal server error!");
        }
    });

    app.put('/order/status/:id',async(req,res)=>{
        const id = req.params.id ;
        const {status} = req.body;
        try {
            const { data } = await service.UpdateOrderStatus(id,status);
        
        const data_delivery = {
            orderId: data.orderId,
            status: data.status,
            currentLocation: data?.currentLocation,
            longitude:data?.longitude,
            latitude:data?.latitude,
            estimatedDeliveryDate: data?.estimatedDeliveryDate
        }
        const payload_delivery = await service.GetOrderPayload(id, data_delivery, 'UPDATE_DELIVERY')
        PublishMessage(channel,DELIVERY_SERVICE, JSON.stringify(payload_delivery));

        res.status(201).json(data);
        } catch (error) {
            console.log('====================================');
            console.log(error.message);
            console.log('====================================');
            // res.status(500).json("Internal server error!");
        }
    })

    app.get('/orders',UserAuth, async (req,res,next) => {

        const { _id } = req.user;

        const { data } = await service.GetOrders(_id);
        
        res.status(200).json(data);

    });

    app.get('/orders/all',UserAuth, async (req,res,next) => {

        const { data } = await service.GetAllOrders();
        
        res.status(200).json(data);

    });

    app.put('/cart',UserAuth, async (req,res,next) => {

        const { _id } = req.user;

        
        const { data } = await service.AddToCart(_id, req.body._id);
        
        res.status(200).json(data);

    });

    app.delete('/cart/:id',UserAuth, async (req,res,next) => {

        const { _id } = req.user;


        const { data } = await service.AddToCart(_id, req.body._id);
        
        res.status(200).json(data);

    });
    
    app.get('/cart', UserAuth, async (req,res,next) => {

        const { _id } = req.user;
        
        const { data } = await service.GetCart({ _id });

        return res.status(200).json(data);
    });

    app.get('/whoami', (req,res,next) => {
        return res.status(200).json({msg: '/shoping : I am Shopping Service'})
    })
 
}
