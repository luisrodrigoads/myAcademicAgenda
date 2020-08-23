const {user, events} = require('../config/db')

module.exports = {

    get(req, res) {
        user.find()
        .select('firstName lastName email')
        .exec((err, response) => {
            if(err) {
                console.log(err);
                return res.status(500).json("Error on server side");
            }
            return res.status(200).json(response);
        });
    },

    async delete(req, res) {
        const id = req.params.id;
        const userData = await user.findByIdAndDelete(id);

        let msg;
        if(userData === null) {
            msg = 'Invalid ID';
            res.status(202);
        }else{
             await events.deleteMany({whoCreated : id});

             msg = 'User Deleted';
             res.status(200);
        }

        return res.json({msg});
    }
}