const mongoose = require('mongoose')

const eventSchema = require('../api/dbSchema/eventSchema')

mongoose.connect("mongodb://localhost/my-academic-agenda",{useNewUrlParser: true, useFindAndModify: false, useCreateIndex:true, useUnifiedTopology: true })

const events = mongoose.model('events',eventSchema)

module.exports = {events}