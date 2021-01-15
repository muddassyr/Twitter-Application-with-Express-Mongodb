var express = require('express');
var cors = require('cors')
var morgan = require('morgan')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var bcrypt = require('bcrypt-inzi')
var jwt = require('jsonwebtoken')
var path = require('path')

var { userModel } = require("./dbrepo/models")
var authRoutes = require("./routes/auth")
var { SERVER_SECRET } = require("./core/index")

console.log("module: ", userModel);
// var SERVER_SECRET = process.env.SECRET || "1234";

var app = express();
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors({
    origin: "*",
    credentials: true
}))


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

    userModel.findById(req.body.jToken.id, 'name email createdOn',
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


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("server is running on: ", PORT);
})