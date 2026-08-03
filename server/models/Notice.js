const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(

    {

        title: {

            type: String,

            required: true,

            trim: true

        },

        description: {

            type: String,

            required: true,

            trim: true

        },

        postedBy: {

            type: String,

            required: true

        },

        priority: {

            type: String,

            enum: [

                "Low",

                "Medium",

                "High"

            ],

            default: "Medium"

        },

        department: {

            type: String,

            default: "All"

        },

        expiryDate: {

            type: Date,

            required: true

        }

    },

    {

        timestamps: true

    }

);

module.exports = mongoose.model("Notice", noticeSchema);