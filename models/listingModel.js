const mongoose = require('mongoose')

const ListingSchema = new mongoose.Schema(
    {
        title : {
            type : String,
            required : true,
            trim : true,
            maxLength : 100
        },

        price : {
            type : Number,
            required : true,
            min : 0
        },

        description : {
            type : String,
            required: true,
            maxlength: 1000
        },

        category : {
            type : String,
            default : 'GMD',
            enum : ['GMD']
        },

        location: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
            required: true
        },

        
    }
)