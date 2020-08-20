const mongoose = require('mongoose')

const {events} = require('../config/db')

exports.get = (req, res, next) => {
    events
        .find()
            .sort({dateOcurr: 1})
        .then(data => {
            res.status(200).json(data)
        }).catch(err => {
            res.status(400).json(err)
        })
}

exports.getMonth = (req, res, next) => {

    let month = req.params.month -1;
    let year = req.params.year;

    events
        .find()
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

    newEvent
        .save()
        .then(e => {
            res.status(200).json('Successfuly request')
        }).catch(err => {
            console.log(err)
            res.status(400).json('Internal server error')
        })
}

exports.delete = (req, res, next) => {
    events
        .deleteOne({'_id': req.params.id})
        .then(data => {
            res.status(200).json(data)
        }).catch(err => {
            res.status(400).json(err)
        })
}
