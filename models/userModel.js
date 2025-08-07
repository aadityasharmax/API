const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:String,
    email:{
        type:String,
        unique:true
    },

    phone:{
        type:Number,
        unique:true
    },

    role: {
        type: String,
        enum: ['user', 'admin', 'seller'],
        default: 'user'
  },
    address: {
        type : String
    },

    about: {
        type : String
    },

    profileImage: {
        type : String
    },

    status : {
        type: Number,
        default: 1, 
        enum: [0, 1]
    },

    isVerified: {
        type: Boolean,
        default:false,
    },

    refreshToken: {
        type: String,
        default: ''
    },

    

    password: String
}, {timestamps:true})

module.exports = mongoose.model('User',userSchema);