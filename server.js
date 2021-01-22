var express = require('express');
var cors = require('cors')
var morgan = require('morgan')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var bcrypt = require('bcrypt-inzi')
var jwt = require('jsonwebtoken');
var socketIo = require("socket.io");

var path = require('path')
var http = require("http");


//new code

const fs = require('fs')
const multer = require("multer");
const admin = require("firebase-admin");

const storage = multer.diskStorage({ // https://www.npmjs.com/package/multer#diskstorage
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}-${file.filename}.${file.mimetype.split("/")[1]}`)
    }
})
var upload = multer({ storage: storage })

var serviceAccount = require("./firebase.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://upload-photo-a5769.firebaseio.com"
});

const bucket = admin.storage().bucket("gs://upload-photo-a5769.appspot.com");





var { userModel, tweetsModel } = require("./dbrepo/models")
var authRoutes = require("./routes/auth")
var { SERVER_SECRET } = require("./core/index")

console.log("module: ", userModel);

var app = express();
var server = http.createServer(app);
var io = socketIo(server);

io.on("connection", (user) => {

})

app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors({
    origin: "*",
    credentials: true
}))

app.use("/", express.static(path.resolve(path.join(__dirname, "public"))));

app.use("/auth", authRoutes)
// app.use("/", authRoutes)


app.use(function (req, res, next) {
    console.log("req.cookies: ", req.cookies)
    if (!req.cookies.jToken) {
        res.status(401).send("include http-only credentials with every request")
        return;
    }


    jwt.verify(req.cookies.jToken, SERVER_SECRET, function (err, decodedData) {
        if (!err) {
            const issueDate = decodedData.iat * 1000;
            const nowDate = new Date().getTime();
            const diff = nowDate - issueDate;

            if (diff > 300000) {
                res.status(401).send("token expired")
            } else {
                var token = jwt.sign({
                    id: decodedData.id,
                    name: decodedData.name,
                    email: decodedData.email,
                    phone: decodedData.phone,
                }, SERVER_SECRET)
                res.cookie('jToken', token, {
                    maxAge: 86_400_000,
                    httpOnly: true
                });
                req.body.jToken = decodedData
                next();

            }

        } else (
            res.status(401).send("Invalid Token")
        )
    })
})

app.get("/profile", (req, res, next) => {
    console.log(req.body)

    userModel.findById(req.body.jToken.id, 'name email phone profileUrl createdOn',
        function (err, doc) {
            if (!err) {
                res.send({
                    profile: doc

                })
            } else {
                res.status(500).send({
                    message: "server error"
                })
            }
        })
})



app.post("/uploadTweet", (req, res, next) => {

    if (!req.body.userPost) {
        res.status(409).send(`
            Please send tweet in json body
            e.g:
            "email" : "abc@gmail.com",
            "userPost" : "xxxxxx"
        `)

        return;
    };
    userModel.findById(req.body.jToken.id, 'name email profileUrl',
        (err, user) => {
            if (!err) {
                console.log("tweet user : " + user);
                tweetsModel.create({
                    email: user.email,
                    userPost: req.body.userPost,
                    name: user.name,
                    profileUrl: user.profileUrl,
                }).then((data) => {
                    console.log("Tweet created: " + data),
                        res.status(200).send({
                            message: "tweet created",
                            name: user.name,
                            profileUrl: user.profileUrl,
                            email: user.email,
                        });
                    io.emit("NEW_POST", { data: data, profileUrl: user.profileUrl });
                }).catch((err) => {
                    res.status(500).send({
                        message: "an error occured : " + err,
                    });
                });
            }
            else {
                res.status.send({
                    message: "an error occured" + err,
                })
            }
        })




    //     // userModel.findById(req.body.jToken.id, 'name email',
    //     //     (err, user) => {
    //     //         if (!err) {
    //     //             console.log("tweet user : " + user);
    //     //             tweetsModel.create({
    //     //                 // email: req.body.email,
    //     //                 userPost: req.body.userPost,
    //     //                 name : user.name,
    //     //                 email : user.email,
    //     //             }).then((data) => {
    //     //                 console.log("Tweet created: " + data),
    //     //                     res.status(200).send({
    //     //                         // message: "tweet created",
    //     //                         mytweet: data.userPost,
    //     //                         name: user.name,
    //     //                         email: user.email,
    //     //                     });
    //     //                     io.emit("NEW_POST" , data);
    //     //             }).catch((err) => {
    //     //                 res.status(500).send({
    //     //                     message: "an error occured : " + err,
    //     //                 });
    //     //             });
    //     //         }
    //     //         else {
    //     //             res.status(403).send({
    //     //                 message: "an error occured" + err,
    //     //             })
    //     //         }
    //     //     })





});

app.get("/getTweets", (req, res, next) => {

    tweetsModel.find({}, (err, data) => {
        if (!err) {
            // console.log("data is tweets = > " , data);
            res.status(200).send({
                tweets: data,
            });
        }
        else {
            console.log("error : ", err);
            res.status(500).send("error");
        }
    })
});

app.get("/userTweets", (req, res, next) => {
    // console.log("my tweets user=>", req.body);
    tweetsModel.find({ email: req.body.jToken.email }, (err, data) => {
        if (!err) {
            console.log("user own tweets", data);
            res.status(200).send({
                tweets: data,
            });
        }
        else {
            console.log("error : ", err);
            res.status(500).send("error");
        }
    })
});


app.post("/upload", upload.any(), (req, res, next) => {
    // console.log(req.body.myDetails);
    userDetails = JSON.parse(req.body.myDetails)

    // console.log("user details are  ", userDetails);
    // console.log("user details email  ===== ", userDetails.email);

    bucket.upload(
        req.files[0].path,

        function (err, file, apiResponse) {
            if (!err) {

                // https://googleapis.dev/nodejs/storage/latest/Bucket.html#getSignedUrl
                file.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491'
                }).then((urlData, err) => {
                    if (!err) {
                        // console.log("public downloadable url: ", urlData[0]) // this is public downloadable url 
                        // console.log("my email is => ", userDetails.email);
                        userModel.findOne({ email: userDetails.email }, {}, (err, user) => {
                            if (!err) {
                                tweetsModel.update({ email: userDetails.email }, { profileUrl: urlData[0] }, (err, tweetUrl) => {
                                    if (!err) {
                                        console.log("Url is also uploaded on tweets model");
                                    }
                                })
                                console.log("user is ===>", user);
                                user.update({ profileUrl: urlData[0] }, (err, updatedUrl) => {
                                    if (!err) {
                                        res.status(200).send({
                                            message: "profile picture succesfully uploaded",
                                            url: user.updatedUrl,
                                        })
                                        console.log("succesfully uploaded");
                                    }
                                    else {
                                        res.status(500).send({
                                            message: "an error occured" + err,
                                        })
                                        console.log("error occured whhile uploading");
                                    }

                                })
                            }
                        })
                        try {
                            fs.unlinkSync(req.files[0].path)
                            //file removed
                            return;
                        } catch (err) {
                            console.error(err)
                        }
                        // res.send("Ok");/
                    }
                })
            } else {
                console.log("err: ", err)
                res.status(500).send();
            }
        });
})





const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log("server is running on: ", PORT);
})