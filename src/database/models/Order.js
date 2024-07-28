const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    name:String,
    address:String,
    contact:String,
    note:String,
    orderId: { type: String },
    customerId: { type: String },
    amount: { type: Number },
    status: { type: String, default: 'On Hold'  },
    destCoords: {lng:String,lat:String},
    items: [
        {   
            product: {
                _id: { type: String, require: true},
                name: { type: String },
                desc: { type: String },
                banner: { type: String },
                type: { type: String },
                unit: { type: Number },
                price: { type: Number },
                status:{type:String},
                shop_id:{ type: String}
            } ,
            unit: { type: Number, require: true} 
        }
    ]
},
{
    toJSON: {
        transform(doc, ret){
            delete ret.__v;
        }
    },
    timestamps: true
});

module.exports =  mongoose.model('order', OrderSchema);
