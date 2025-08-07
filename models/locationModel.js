const mongoose = require('mongoose')
const defaultLocationImage = require('../assets/default/location')

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
            // required : true
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