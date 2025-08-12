const mongoose = require('mongoose')

const locationModel = new mongoose.Schema(
    {
        name : {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        slug : {
            type : String,
            required: true,
            unique : true
        },

        image : {
            type : String,
            // default : ''
        },

        status : {
            type : Boolean,
            enum : [0,1],
            default: 1,
            required:true
        },

        description : {
            type : String,
            required:true

        }
    }
)

module.exports = mongoose.model('Location', locationModel);