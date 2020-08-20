const cors = require('cors')
const express = require('express')

const app = express()

const port = process.env.PORT || 3003

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: true}))

const eventsDao = require('./models/eventsDAO')

//Events
app.get('/events', eventsDao.get)
app.get('/events/:year/:month', eventsDao.getMonth)
app.post('/events', eventsDao.post)
app.delete('/events/:id', eventsDao.delete)

app.listen(port, () => console.log('Server on port: ' + port))