
const url = "http://localhost:5000";

// var url = "http://localhost:5000";

function signUp(){
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
    console.log(user);


    const Http = new XMLHttpRequest();
    Http.open("POST", url + "/auth/signup");
    Http.setRequestHeader("Content-Type", "application/json");
    Http.send(JSON.stringify(user));

    Http.onreadystatechange = (e) => {

        if (Http.readyState === 4) {
            let jsonRes = JSON.parse(Http.responseText)
            console.log(Http.status);
            console.log(jsonRes);
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

function logIn(){

    var email = document.getElementById("email").value.toLowerCase();
    var password = document.getElementById("password").value

    user = {
        email: email,
        password: password,
    }
    console.log(user);

    const Http = new XMLHttpRequest();
    Http.open("POST", url + "/auth/login");
    Http.setRequestHeader("Content-Type", "application/json");
    Http.send(JSON.stringify(user));

    Http.onreadystatechange = (e) => {
        if (Http.readyState === 4) {
            console.log(Http.responseText);
            let jsonRes = JSON.parse(Http.responseText);

            if (Http.status === 200) {
                alert(jsonRes.message);
                window.location.href="dashboard.html";
            }
            else {
                alert(jsonRes.message);
            }

        }
    }
    return false;
}