const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
    title: {type: String},
    description:{type: String},
    eventRelatedLink:{type: String},
    dateOcurr: {type: Date, default: Date.now }
})

module.exports = eventSchema