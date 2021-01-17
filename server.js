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

var { userModel , tweetsModel } = require("./dbrepo/models")
var authRoutes = require("./routes/auth")
var { SERVER_SECRET } = require("./core/index")

console.log("module: ", userModel);
// var SERVER_SECRET = process.env.SECRET || "1234";

var app = express();
var server = http.createServer(app);
var io = socketIo(server);

io.on("connection", (user) => {
    console.log("user connected" , user);
    io.emit("Testing");
})

app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors({
    origin: "*",
    credentials: true
}))

app.use("/",express.static(path.resolve(path.join(__dirname,"public"))));

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

    userModel.findById(req.body.jToken.id, 'name email phone createdOn',
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


app.post("/postTweets", (req, res, next) => {

    if (!req.body.email || !req.body.tweetText) {
        res.status(409).send(`
            Please send tweet in json body
            e.g:
            "tweetText" : "xxxxxx"
        `)
        // "email" : "abc@gmail.com",

        return;
    };
    userModel.findById(req.body.jToken.id, 'name email',
        (err, user) => {
            if (!err) {
                console.log("tweet user : " + user);
                tweetsModel.create({
                    // email: req.body.email,
                    tweetText: req.body.tweetText,
                    name : user.name,
                    email : user.email,
                }).then((data) => {
                    console.log("Tweet created: " + data),
                        res.status(200).send({
                            message: "tweet created",
                            name: user.name,
                            email: user.email,
                        });
                        io.emit("NEW_POST" , data);
                }).catch((err) => {
                    res.status(500).send({
                        message: "an error occured : " + err,
                    });
                });
            }
            else {
                res.status(403).send({
                    message: "an error occured" + err,
                })
            }
        })
});

app.get("/getTweets", (req, res, next) => {

  tweetsModel.find({},(err,data)=>{
    if(!err)
    {
        console.log("tweet data=>",data);
        res.status(200).send({
            tweets : data,
        });
    }
    else{
        console.log("error : ",err);
        res.status(500).send("error");
    }
  })

});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log("server is running on: ", PORT);
})