const User = require("../models/User")
const jwt = require('jwt-simple');
const secret = process.env.JWT_SECRET;
const sha256 = require('sha256')


module.exports = {

    profile : async(req, res) => {
        let u = await User.findOne({_id : req.user.userId})
        res.apiSuccess(u)
    },

    registerUser: async(req, res) => {
        let {email, password, name} = req.body

        if (!email) 
            return res.apiError("Email Id is required")

        if (!name)
            return res.apiError("Username is required")

        if (!password || password.trim().length == 0)
            return res.apiError("Password is required")

        let uForEmail = await User.findOne({email : email.toLowerCase()})
        let uForName = await User.findOne({name : name.toLowerCase()})

        if (uForEmail) {
            return res.apiError("This Email is already registered!")
        } else if (uForName) {
            return res.apiError("This Username is already registered!")
        } else {
            password = sha256(password)

            let credential = {
                email: email.toLowerCase(),
                password: password,
                name: name.toLowerCase()
            }
            u = await User.create(credential)
            let data = {
                userID: u.id,
                userName : u.name,
                token : jwt.encode({userId : u.id.toString(), time : new Date().getTime()}, secret)
            }
            return res.apiSuccess(data)
        }
    },

    loginUser: async(req, res) => {
        let {name, password} = req.body

        let u = await User.findOne({name : name.toLowerCase()})
        if (u) {
            password = sha256(password)
            if(u.password == password){
                let data = {
                    userID: u.id,
                    userName : u.name,
                    token : jwt.encode({userId : u.id.toString(), time : new Date().getTime()}, secret)
                }
                req.app.get("eventEmitter").emit('login', 'Test event emitter');
                return res.apiSuccess(data)
            }
            return res.apiError("Invalid Password")
        }
        return res.apiError("Invalid Username")
    },

    existUser: async(req, res) => {
        let {username} = req.body

        let u = await User.findOne({name : username.toLowerCase()})
        if (u) {
            let data = {
                id: u.id,
                name : u.name,
            }
            return res.apiSuccess(data)
        }
        return res.apiError("Unexisting username")
    },

    checkMe: async(req, res) => {
        let {name} = req.body

        let u = await User.findOne({name : name.toLowerCase()})
        if (u) {
            let data = {
                userID: u.id,
                userName : u.name,
            }
            return res.apiSuccess(data)
        }
        return res.apiError("Unexisting username")
    }
}