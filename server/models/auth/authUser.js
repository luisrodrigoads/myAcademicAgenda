const jwt = require('jsonwebtoken')
const {user} = require('../../config/db')
const env = require('../../config/secret.env')
const mongoose = require('mongoose')
const crypto = require('crypto')
const nodemailer = require('nodemailer')

const emailRegex = /\S+@\S+\.\S+/
const passwordRegex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6})/

const login = (req, res) => {
    user.findOne({email: req.body.email}, (err, result) => {
        if(err)
            return res.status(500).json('Internal error')

        else if(result && result.password === req.body.password){
            return res.status(200).json({result, token: getJWT(result.toJSON()) })
        }

        else
            return res.status(202).json('Usuário/Senha inválidos')
    })    
}

const getJWT = data => jwt.sign(data, env.authSecret, {expiresIn: "30 days"})
const decodeJWT = token => jwt.decode(token)

const tradeTokenToUser = (req, res) => {
    let data = jwt.decode(req.headers['authorization']);

    res.status(200).json(data);
}


const signup = (req, res) => {
    // check if admin is logged to create a different user type. If not, force common user creation
    if(req.body.type != null){
        if( decodeJWT(req.headers['authorization']).type != "ADMIN") {
            req.body.type = "USER";
        }
    }

    let dataNewUser = req.body

    // check if the email received is really an email
    if(!dataNewUser.email.match(emailRegex))
        return res.status(202).json('E-mail inválido')
    
    // passwords compare
    if(dataNewUser.password != dataNewUser.confirmPassword)
        return res.status(202).json('Senhas não conferem')
    
    else if(dataNewUser.password.length < 5)
        return res.status(202).json('password length 5')

    // if there is no errors, check if the email is already in use, if dont, create new user
    user.findOne({email: dataNewUser.email}, (err, result) => {
        if(err)
            return res.status(500).json('Internal server error')
        
        else if(result !== null)
            return res.status(202).json('O e-mail já está em uso')
        
        else {
            delete dataNewUser.confirmPassword
            new user(dataNewUser).save(err =>
                err ?
                    res.status(202).json('Erro criando usuário: ' + err) :
                    res.status(200).json('Usuário criado com sucesso!')   
            )
        }
    })
}

const validateToken = (req, res) => 
    jwt.verify(req.body.token, env.authSecret, (err, decoded) => 
        res.status(200).json({valid: !err}))

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nao.responda.myacademicagenda@gmail.com',
        pass: 'emailMyAcademicAgenda',
    }
});

const sendRecoveryMailTo = async doc => {
    let info = await transporter.sendMail({
        from: 'naoresponda - MyAcademicAgenda', // sender address
        to: doc.email, // list of receivers
        subject: "Senha MyAcademicAgenda", // Subject line
        //text: `Sua nova senha é: ${doc.password}`, // plain text body
        html: `
        <!DOCTYPE html>
<html>
    <head>
        <title>Recuperação de Senha</title>
        <meta charset="utf-8">
        <style>
            #titulo {
                text-align: center;
            }
            #texto{
                font-size: 18px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div id="titulo">
            <h1>EcoPet - Recuperação de senha</h1>
        </div>
            <hr/>      
        <div id="texto">
            <p>Você solicitou alteração de senha, essa é sua nova senha: <b>${doc.password}</b>.</p>
            <p>Caso você queira alterar sua senha, você pode executar os seguintes passos:</p>
            <p>Após realizar login na tela inicial vá em "configurações da conta", digite sua nova senha e clique no botão "salvar".</p>
        </div>
    </body>
</html>         
        `, // html body
      });
}

const recoveryPassword = (req, res) => {
    const email = req.body.email;

    data = {};
    data.password = crypto.randomBytes(3).toString('hex');
    
    try {
        user.findOneAndUpdate({email: email},data,{new: true}).then( async doc => {

            if(doc){
                console.log("Recovery mail sent to " + doc.email + " with new password " + data.password);
                await sendRecoveryMailTo(doc);
            }else{

            }

            return res.status(200).json({msg: "Caso o email esteja em nossa base será enviado uma mensagem com a nova senha para esse email"})
        })
    } catch (error) {
        console.log("ERRO\n",error)
        return res.status(500).json("Internal error");   
    }
}

const updateUser = (req, res) => {
    
    const data = req.body;

    if(!req.file){
        let changePassword = false;

        if(data['newPassword'] != null){
            changePassword = true
            if(data['newPassword'] != data['newPasswordConfirm'])
                return res.status(202).json('Senhas não conferem')

            else if(data['newPassword'].length < 5)
                return res.status(202).json('password lenght 5')

        }
        if(Object.keys(data).length == 1)
            return res.status(202).json('Você precisa atualizar no mínimo um campo!')

        user.findOne({_id: decodeJWT(req.headers['authorization'])._id}, (err, result) => {
            if(err)
                return res.status(500).json('Internal server error!')

            if(data.password == result.password){
                if(changePassword){
                    data['password'] = data['newPassword']
                    delete data ['newPassword']
                    delete data ['newPasswordConfirm']
                }

                user.updateOne({_id: decodeJWT(req.headers['authorization']._id)},data)
                    .then(response => {
                        user.findOne({_id: decodeJWT(req.headers['authorization'])._id}, (err, result) =>
                            res.status(200).json({result, token: getJWT(result.toJSON()) })
                        )
                    }).catch(err => res.status(202).json('Internal server error!'))
            } else 
                return res.status(202).json('Senha Incorreta!')
        })         
    }
}

const updateToken = (req, res) => 
    user.findOne(
        {
            _id: mongoose.Types.ObjectId(decodeJWT(req.headers['authorization'])._id)
        }, (err, result) =>
        err ?
            res.status(202).json("Internal error") :
            res.status(200).json({token: getJWT(result.toJSON()), result})
    )

module.exports = {login, signup, validateToken, tradeTokenToUser, updateUser, updateToken, decodeJWT, recoveryPassword}