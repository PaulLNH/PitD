$(document).ready(function() {

    const url = window.location.search;
  
    const username = $("#sign-up-username");
    const email = $("#sign-up-email");
    const password = $("#sign-up-password");
    const avatar = $(".sign-up-avatar");
    const signUp = $("#sign-up-form");


    function handleAvatartChoice () {

    }

    $(avatar).on("click", function(){
      
    })
  
    $(signUp).on("submit", function handleFormSubmit(event) {
      event.preventDefault();
  
      if (!username.val().trim() || !password.val().trim()) return;
  
      const newAccount = {
        username: username.val().trim(),
        email: email.val().trim(),
        password: password.val().trim(),
      };
      submitNewAccount(newAccount);
    });
  
    function submitNewAccount(body) {
      console.log(body);
      $.post("/api/accounts/add", body, function() {
        // window.location.href = "/admin";
        submitLogin(body);
      });
    }

    function submitLogin(body) {
      $.post("/api/accounts/login", body, function(data) {
        console.log(data);
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.payload.username);
        window.location.href = "/game";
      });
    }
});
  