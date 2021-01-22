// var DBURI =

module.exports = {
    DBURI: process.env.DBURI || "mongodb+srv://legend:legend123@cluster0.2c3x6.mongodb.net/testdb?retryWrites=true&w=majority",
    SERVER_SECRET: process.env.SECRET || "1234",
    CLIENT_SEC: process.env.CLIENT_SEC || "abc"

}