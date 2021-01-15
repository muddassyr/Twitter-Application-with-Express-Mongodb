var url = "http://localhost:5000";

function signin(){
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var phone = document.getElementById("phone").value;
    var password = document.getElementById("password").value;

    let user = {
        name: name,
        emai: email,
        phone: phone,
        password: password
    }

    const Http = new XMLHttpRequest();
    Http.open("POST", url + "/auth/signup");
    Http.setRequestHeader("Content-Type", "application/json");
    Http.send(JSON.stringify(user));
    Http.onreadystatechange = (e) => {

        if (Http.readyState === 4) {
            let jsonRes = JSON.parse(Http.responseText)
            console.log(Http.status);
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
}

function login(){
    var userEmail = document.getElementById("email").value.toLowerCase();
    var userPassword = document.getElementById("password").value

    user = {
        userEmail: userEmail,
        userPassword: userPassword,
    }
    // console.log(user);

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