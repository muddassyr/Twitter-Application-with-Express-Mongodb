
const url = "https://own-project.herokuapp.com";
// const url = "http://localhost:5000";

// var url = "http://localhost:5000";
var socket = io(url);

socket.on('connect', function () {
    // console.log("I am connected");
});
function signUp() {
    var name = document.getElementById("name").value;
    // console.log(name);
    var email = document.getElementById("email").value.toLowerCase();
    var phone = document.getElementById("phone").value;
    var password = document.getElementById("password").value;

    let user = {
        name: name,
        email: email,
        phone: phone,
        password: password
    }
    // console.log(user);


    const Http = new XMLHttpRequest();
    Http.open("POST", url + "/auth/signup");
    Http.setRequestHeader("Content-Type", "application/json");
    Http.send(JSON.stringify(user));

    Http.onreadystatechange = (e) => {

        if (Http.readyState === 4) {
            let jsonRes = JSON.parse(Http.responseText)
            // console.log(Http.status);
            // console.log(jsonRes);
            if (Http.status === 200) {
                alert(jsonRes.message);
                window.location.href = "login.html";
            }
            else {
                alert(jsonRes.message);
            }

        }
    }
    return false;


    // axios({
    //     method: 'post',
    //     url: 'http://localhost:5000/signup',
    //     data: {
    //         name: document.getElementById('name').value,
    //         email: document.getElementById('email').value,
    //         password: document.getElementById('password').value,
    //         phone: document.getElementById('phone').value,
    //     },
    //     withCredentials: true
    // }).then((response) => {
    //     if (response.data.status === 200) {
    //         alert(response.data.message)
    //         location.href = "./login.html"
    //     } else {
    //         alert(response.data.message);
    //     }
    // }).catch((error) => {
    //     console.log(error);
    // });
    // return false
}

function logIn() {

    var email = document.getElementById("email").value.toLowerCase();
    var password = document.getElementById("password").value

    user = {
        email: email,
        password: password,
    }
    // console.log(user);

    const Http = new XMLHttpRequest();
    Http.open("POST", url + "/auth/login");
    Http.setRequestHeader("Content-Type", "application/json");
    Http.send(JSON.stringify(user));

    Http.onreadystatechange = (e) => {
        if (Http.readyState === 4) {
            // console.log(Http.responseText);
            let jsonRes = JSON.parse(Http.responseText);
            // console.log(jsonRes)
            // console.log("name ", jsonRes.user.name)
            // console.log("name ",jsonRes.name)

            if (Http.status === 200) {
                alert(jsonRes.message);
                localStorage.setItem('current_user', JSON.stringify(jsonRes.user))
                window.location.href = "dashboard.html";
                // console.log(jsonRes.user.name)
                // console.log(document.getElementById('resUserName'))
                // document.getElementById("resUserName").innerHTML = jsonRes.user.name;

            }
            else {
                alert(jsonRes.message);
            }

        }
    }
    return false;
}

function getProfile() {
    // console.log("test");
    axios({

        method: 'get',
        // url: "http://localhost:5000/profile",
        // url: "/profile",
        url: url + "/profile",

    }).then((response) => {
        // console.log(response.data);
        // console.log("get profile console", response.data);
        document.getElementById('resUserName').innerHTML = response.data.profile.name

        if (!response.data.profile.profileUrl) {

            document.getElementById('dbImage').src = 'images/randomPic.png'
            document.getElementById('dbImageOne').src = 'images/randomPic.png'
        }
        else {

            document.getElementById('dbImage').src = response.data.profile.profileUrl
            document.getElementById('dbImageOne').src = response.data.profile.profileUrl
        }
        getTweets();
    }, (error) => {
        // console.log(error.message);
        window.location.href = "./login.html"
        // console.log("this is error", error);
    });

}




function previewFile() {
    const preview = document.getElementById('dbImage');

    const file = document.querySelector('input[type=file]').files[0];
    const reader = new FileReader();

    reader.addEventListener("load", function () {
        // convert image file to base64 string
        preview.src = reader.result;
    }, false);

    if (file) {
        reader.readAsDataURL(file);
        document.getElementById("uploadBtn").style.display = "initial";
        document.getElementById("uploadTxt").innerHTML = "Press upload to upload profile picture";
    }
}


const tweetme = () => {


    const Http = new XMLHttpRequest();
    Http.open("POST", url + "/uploadTweet")
    Http.setRequestHeader("Content-Type", "application/json");
    Http.send(JSON.stringify({
        userPost: document.getElementById("userPost").value,
    }))


    document.getElementById("userPost").value = "";

}
socket.on("NEW_POST", (newPost) => {


    // console.log("newPost  ", newPost);
    var eachTweet = document.createElement("li");
    eachTweet.setAttribute("class", "myClass");
    eachTweet.innerHTML =
        `<h4 class="userName">
        ${newPost.name}
    </h4> 
    <p class="userPost">
        ${newPost.userPost}
    </p>`;
    // console.log(`User: ${tweets[i]} ${tweets[i].userPosts[j]}`)
    document.getElementById("posts").appendChild(eachTweet)
})


const userTweets = () => {
    document.getElementById("posts").innerHTML = "";
    const Http = new XMLHttpRequest();
    Http.open("GET", url + "/userTweets");
    Http.send();
    Http.onreadystatechange = (e) => {
        if (Http.readyState === 4) {
            let jsonRes = JSON.parse(Http.responseText)
            // console.log(jsonRes);
            for (let i = 0; i < jsonRes.tweets.length; i++) {
                // console.log(`this is ${i} tweet = ${jsonRes.tweets[i].createdOn}`);

                var eachTweet = document.createElement("li");
                eachTweet.setAttribute("class", "myClass");

                eachTweet.innerHTML =
                    `<h4 class="userName">
                    ${jsonRes.tweets[i].name}
                </h4> 
            
                <p class="userPost">
                    ${jsonRes.tweets[i].userPost}
                </p>`;

                // console.log(`User: ${tweets[i]} ${tweets[i].userPosts[j]}`)
                document.getElementById("posts").appendChild(eachTweet)

            }
        }
    }
}




const getTweets = () => {

    document.getElementById("posts").innerHTML = "";

    const Http = new XMLHttpRequest();
    Http.open("GET", url + "/getTweets");
    Http.send();
    Http.onreadystatechange = (e) => {
        if (Http.readyState === 4) {

            let data = JSON.parse((Http.responseText));
            // console.log(data);
            for (let i = 0; i < data.tweets.length; i++) {


                var eachTweet = document.createElement("li");
                eachTweet.setAttribute("class", "myClass");
                eachTweet.innerHTML =
                    `<h4 class="userName">
                    ${data.tweets[i].name}
                </h4> 
                <p class="userPost">
                    ${data.tweets[i].userPost}
                </p>`;
                // console.log(`User: ${tweets[i]} ${tweets[i].userPosts[j]}`)
                document.getElementById("posts").appendChild(eachTweet)

            }
        }
    }
}




function passForgot() {

    // console.log("hggjghgh")

    axios({
        method: 'post',
        url: url + "/auth/forgot-password",
        // email : document.getElementById("email").value,

        data: {
            email: document.getElementById("email").value,
        }
    }).then((response) => {
        document.getElementById("forgotPassRes").style.display = "initial";
        document.getElementById("forgotPassRes").innerHTML = JSON.stringify(response.message);
        alert((response.message));
        localStorage.setItem("forgot_email", document.getElementById("email").value);
        window.location.href = "forgot_password_sterp_2.html";
    }, (error) => {
        console.log(error);
    });
    return false;
}



function newPassword() {

    // console.log("hdjfahfj")


    const Http = new XMLHttpRequest();
    Http.open("POST", url + "/auth/forgot-password-step-2")
    Http.setRequestHeader("Content-Type", "application/json");
    Http.send(JSON.stringify({
        email: document.getElementById("email").value.toLowerCase(),
        newPassword: document.getElementById("newPassword").value,
        otp: document.getElementById("otp").value,
    }))
    Http.onreadystatechange = (e) => {
        // console.log(Http.readyState);

        if (Http.readyState === 4) {
            alert(Http.responseText);
        }

    }

    return false;

}

function logout() {
    // let logout = () => {

    axios({
        method: "post",
        url: url + "/auth/logout",
    }).then((response) => {
        alert(response.data);
        window.location.href = "login.html";
    })
}