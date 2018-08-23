$(document).ready(function() {

    const url = window.location.search;
  
    const username = $("#sign-up-username");
    const email = $("#sign-up-email");
    const password = $("#sign-up-password");
    const avatars = [1, 2, 3, 4, 5, 6, 7, 8];
    var chosenAvatar = "";
    const signUp = $("#sign-up-form");

    $(".sign-up-avatar").on("click", function(){
      handleAvatartChoice($(this).prop("id"));
    });
  
    $(signUp).on("submit", function handleFormSubmit(event) {
      event.preventDefault();
  
      if (!username.val().trim() || !password.val().trim()) return;
  
      const newAccount = {
        username: username.val().trim(),
        email: email.val().trim(),
        password: password.val().trim(),
        avatar: chosenAvatar
      };
      submitNewAccount(newAccount);
    });
  
    function handleAvatartChoice (id) {
      console.log(id);
      let avatar = "#" + id;
      chosenAvatar = $(avatar).attr("src");
      console.log(chosenAvatar);
      for(var i = 0; i < avatars.length; i++) {
        $("#avatar-" + avatars[i])
          .css("background", "none")
      }
      $(avatar)
        .css("background-color", "red")
        .css("border-color", "red");
    }

    function submitNewAccount(body) {
      console.log(body);
      $.post("/api/accounts/add", body, function() {
        submitLogin(body);
      });
    }

    function submitLogin(body) {
      $.post("/api/accounts/login", body, function(data) {
        console.log(data);
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.payload.username);
        localStorage.setItem("avatar", data.payload.avatar);
        window.location.href = "/game";
      });
    }
});
  