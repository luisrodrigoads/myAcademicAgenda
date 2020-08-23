const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email:{
        type: String,
        unique: true
    },
    password: String,
    type: {
        type: String,
        default: 'USER'
    },
    events:[String]
})

module.exports = userSchema