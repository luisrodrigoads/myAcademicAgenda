const cors = require('cors')
const express = require('express')

const app = express()

const port = process.env.PORT || 3003

const validateToken = require('./config/validateToken');

const corsOptions =  {
    origin: '*'
}

app.use(cors(corsOptions))
app.options('*',cors())
app.use(express.json());
app.use(express.urlencoded({extended: true}))

const eventsDao = require('./models/eventsDAO')
const Auth = require('./models/auth/authUser')

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

//public routes
app.post('/login', (req, res) => Auth.login(req, res))
app.post('/signup', (req, res) => Auth.signup(req, res))
app.post('/validateToken', (req, res) => Auth.validateToken(req, res))
app.post('/recoveryPassword', (req, res) => Auth.recoveryPassword(req, res))

//all logged users can access to
app.use('*', validateToken);

//User
app.get('/updateToken', (req, res) => Auth.updateToken(req, res))
app.post('/tradeTokenToUser', (req, res) => Auth.tradeTokenToUser(req, res))

app.post('/updateUser',(req, res) => Auth.updateUser(req, res))

//Events
app.get('/events', eventsDao.get)
app.get('/events/:year/:month', eventsDao.getMonth)
app.post('/events', eventsDao.post)
app.delete('/events/:id', eventsDao.delete)

app.listen(port, () => console.log('Server on port: ' + port))