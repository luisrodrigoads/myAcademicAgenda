const mongoose = require('mongoose')

const eventSchema = require('../api/dbSchema/eventSchema')
const userSchema = require('../api/dbSchema/userSchema')

mongoose.connect("mongodb://localhost/my-academic-agenda",{useNewUrlParser: true, useFindAndModify: false, useCreateIndex:true, useUnifiedTopology: true })

const events = mongoose.model('events',eventSchema)
const user = mongoose.model('user',userSchema)

module.exports = {events, user}