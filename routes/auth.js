var express = require('express');
var bcrypt = require('bcrypt-inzi');
var jwt = require('jsonwebtoken');
var postmark = require('postmark');
var { SERVER_SECRET } = require("../core/index")
// var SERVER_SECRET = process.env.SECRET || "1234";

// var client = new postmark.Client("ENTER YOUR POSTMARK TOKEN") 
var client = new postmark.Client("78f129ec-7f98-474a-a27b-5c702452ac2b") 

var { userModel, optModel } = require("../dbrepo/models");
console.log("userModels: ", userModel)

var router = express.Router();

router.post("/signup", (req, res, next) => {

    if (
        !req.body.name
        || !req.body.email
        || !req.body.phone
        || !req.body.password
    ) {

        res.status(403).send(`
            please send name, email and passwod  in json body.
            e.g:
            {
                "name": "khan",
                "email": "khan@gmail.com",
                "phone": "123456789",
                "password": "abc",
            }`)
        return;
    }
    console.log(req.body);
    userModel.findOne({ email: req.body.email },
        function (err, doc) {
            if (!err && !doc) {
                bcrypt.stringToHash(req.body.password).then(function (hash) {
                    var newUser = new userModel({
                        "name": req.body.name,
                        "email": req.body.email,
                        "phone": req.body.phone,
                        "password": hash,
                    })

                    newUser.save((err, data) => {
                        if (!err) {
                            res.send({
                                message: "user created"
                            })
                        } else {
                            console.log(err)
                            res.status(500).send({
                                message: "user created error, " + err
                            })
                        }
                    });
                })
            }
            else if (err) {
                res.status(500).send({
                    message: "db error"
                })
            }
            else {
                res.status(408).send({
                    message: "user already exist"
                })
            }
        }
    )





})


router.post("/login", (req, res, next) => {

    if (!req.body.email || !req.body.password) {
        res.status(403).send(`
            please send email and password in json body.
            e.g:
            {
                "email": khan@gamil.com,
                "password": abc
            }
        `)
        return;
    }

    userModel.findOne({ email: req.body.email },
        function (err, user) {
            if (err) {
                res.status(500).send({
                    message: "an error occured; " + JSON.stringify(err)
                });

            } else if (user) {
                bcrypt.varifyHash(req.body.password, user.password).then(isMatched => {
                    if (isMatched) {
                        console.log("matched");
                        var token = jwt.sign({
                            id: user._id,
                            name: user.name,
                            email: user.email,
                        }, SERVER_SECRET)

                        res.cookie('jToken', token, {
                            maxAge: 86_400_000,
                            httpOnly: true
                        })

                        res.send({
                            message: "login success",
                            user: {
                                name: user.name,
                                email: user.email,

                            }
                        })


                    } else {
                        console.log("not matched");
                        res.status(401).send({
                            message: "incorrect password"
                        })
                    }
                }).catch(e => {
                    console.log("error: ", e);
                })

            } else {
                res.status(403).send({
                    message: "user not found"
                })
            }
        }
    )
})




router.post("/forgot-password", (req, res, next) => {
    // console.log()

    if (!req.body.email) {
        res.status(401).send(`
        please send email in json data
        e.g:
        {
            "email": khan@gamil.com

        }
        `)
        return;
    }


    userModel.findOne({ email: req.body.email },
        function (err, user) {
            if (err) {
                res.status(500).send({
                    message: "an error occured: " + JSON.stringify(err)
                });
            } else if (user) {
                const opt = Math.floor(getRandomArbitrary(11111, 99999));

                optModel.create({
                    email: req.body.email,
                    optCode: opt
                }).then((doc) => {

                    client.sendEmail({
                        // "From": "info@khan.com",
                        "From": "mudassir_student@sysborg.com",
                        "To": req.body.email,
                        "Subject": "Rest your password",
                        "TextBody": `Here is your password rest ${opt}`
                    }).then((status) => {

                        console.log("status", status);
                        res.send("email send with otp")

                    })
                }).catch((err) => {
                    console.log("error in creating otp: ", err);
                    res.status(500).send("Unexpected error")
                })

            } else {
                res.status(403).send({
                    message: "user not found"
                })
            }

        }
    )
})





// router.post("/forgot-password-step-2", (req, res, next) =>{


//     if(!req.body.email && !req.body.newPassword && !req.body.opt){

//         res.status(403).send(`
//         Please send email, Otp and new password in json body
//         e.g:
//         {
//             "email": khan@gamil.conm,
//             "Otp": xxxxx,
//             "new Password": xxxxxxxx
//         }
//         `)
//         return;

//     }

//     userModel.findOne({ email : req.body.email},
//         function(err, user){
//             if(err){
//                 res.status(500).send({
//                     message: " An error occured: " + JSON.stringify(err)
//                 })
//             }else if(user){
//                 optModel.find({email: req.body.email}, {
//                     function (err, optData) {

//                         if(err){
//                             res.status(500).send({
//                                 message: "An error occured: " + JSON.stringify(err)
//                             });
//                         }else if(optData){
//                             optData = optData[optData.lenght - 1]

//                             console.log("optData", optData);

//                             const now = new Date().getTime();
//                             const otpIat = new Date(otpData.creatOn).getTime();
//                             const diff = now - otpIat;

//                             console.log("diff", diff);


//                             if(otpData.optCode === req.body.otp && diff < 300000){
//                                 otpData.remove()

//                                 bcrypt.stringToHash(req.body.newPassword).then(function(hash){
//                                     user.update({ password: hash}, {}, function (err, data) {
//                                         res.send("password updated")
//                                     })
//                                 })
//                             }else{
//                                 res.status(401).send({
//                                     message: "incorrect otp"
//                                 })
//                             }
                        
//                         }else{
//                             res.status(401).send({
//                                 message: "incorrect otp"
//                             })
//                         }
                        
//                     }
//                 })
//             }else{
//                 res.status(403).send({
//                     message: "user not found"
//                 })
//             }
//         }
//         )
// })


router.post("/forgot-password-step-2", (req, res, next) => {

    if (!req.body.email && !req.body.otp && !req.body.newPassword) {

        res.status(403).send(`
            please send email & otp in json body.
            e.g:
            {
                "email": "khan@gmail.com",
                "newPassword": "xxxxxx",
                "otp": "xxxxx" 
            }`)
        return;
    }

    userModel.findOne({ email: req.body.email },
        function (err, user) {
            if (err) {
                res.status(500).send({
                    message: "an error occured: " + JSON.stringify(err)
                });
            } else if (user) {

                optModel.find({ email: req.body.email },
                    function (err, otpData) {

                        

                        if (err) {
                            res.status(500).send({
                                message: "an error occured: " + JSON.stringify(err)
                            });
                        } else if (otpData) {
                            otpData = otpData[otpData.length - 1]

                            console.log("otpData: ", otpData);

                            const now = new Date().getTime();
                            const otpIat = new Date(otpData.createdOn).getTime(); // 2021-01-06T13:08:33.657+0000
                            const diff = now - otpIat; // 300000 5 minute

                            console.log("diff: ", diff);

                            if (otpData.otpCode === req.body.otp && diff < 300000) { // correct otp code
                                otpData.remove()

                                bcrypt.stringToHash(req.body.newPassword).then(function (hash) {
                                    user.update({ password: hash }, {}, function (err, data) {
                                        res.send("password updated");
                                    })
                                })

                            } else {
                                res.status(401).send({
                                    message: "incorrect otp"
                                });
                            }
                        } else {
                            res.status(401).send({
                                message: "incorrect otp"
                            });
                        }
                    })

            } else {
                res.status(403).send({
                    message: "user not found"
                });
            }
        });
})
router.post("/logout", (req, res, next) => {
    res.cookie('jToken', "", {
        maxAge: 86_400_000,
        httpOnly: true
    });
    res.send("logout success")
})

module.exports = router;


// function getRandomArbitrary(min, max) {
//     return Math.random() = (min - max) - min;
// }


function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
} 