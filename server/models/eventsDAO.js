const mongoose = require('mongoose')

const {events, user} = require('../config/db')
const {decodeJWT} = require('./auth/authUser')

exports.get = (req, res, next) => {

    const current_user = decodeJWT(req.headers['authorization'])

    events
        .find({whoCreated : current_user._id})
        .sort({dateOcurr: -1})
        .exec((err, result) => {
            if(err) res.status(400).json(err)
            else{
                res.status(200).json({result})
            }
        })    
}

exports.getMonth = (req, res, next) => {

    let month = req.params.month -1;
    let year = req.params.year;

    const current_user = decodeJWT(req.headers['authorization'])

    events
        .find({whoCreated : current_user._id})
            .sort({dateOcurr: 1})
        .then(data => {
            let filter = data.filter( event => event.dateOcurr.getUTCMonth() == month && event.dateOcurr.getFullYear() == year);
            res.status(200).json(filter);
        }).catch(err => {
            res.status(400).json(err)
        })
}

exports.post = (req, res, next) => {
    let newEvent = new events(req.body)
    console.log(req.body)

    const current_user = decodeJWT(req.headers['authorization'])

    newEvent.whoCreated = current_user._id

    newEvent
        .save()
        .then(response =>
            user.findOne({_id: current_user._id}, (err, result) => {
                result.events.push(response._id)
                result.save()
                    .then(response =>  res.status(200).json('successfuly request'))
                    .catch(err => res.status(500).json('Internal server error'))
            }) 
           )
}

exports.update = (req,res, next) => {
    events.updateOne(
        {_id:mongoose.Types.ObjectId(req.body._id) },
        {
            ... req.body
        },
        (err, response) => err ? res.status(500).json(error) : res.status(200).json(response))
}

exports.delete = (req, res, next) => {

    const current_user = decodeJWT(req.headers['authorization'])

    events
        .deleteOne({whoCreated: current_user._id , _id: req.params.id})
        .then(data => {
            res.status(200).json(data)
        }).catch(err => {
            res.status(400).json(err)
        })
}
