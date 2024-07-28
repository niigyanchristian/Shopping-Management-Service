const mongoose = require('mongoose');
 
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    customerId: { type: String },
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
                suplier: { type: String },
                shop_id:{ type: String},
                status:{type:String,default:'On Hold'},
            } ,
            unit: { type: Number, require: true} 
        }
    ]
});

module.exports =  mongoose.model('cart', CartSchema);
