$(document).ready(function() {

    var accountList = $("tbody");
    var accounts;
  
    $(document).on("click", "button.delete", handleAccountDelete);
  
    function getAllAccounts() {
      $.get("/api/accounts/all", function(data) {
          console.log("Account", data);
          accounts = data;
          initializeRows();
      });
    }
  
    getAllAccounts();
  
    function initializeRows() {
      accountList.empty();
      var accountsToAdd = [];
      for (var i = 0; i < accounts.length; i++) {
        console.log(accounts[i].id);
        accountsToAdd.push(createNewRow(accounts[i]));
      }
      accountList.append(accountsToAdd);
    }
  
    function createNewRow(a) {
      console.log(a);
      var newRow = $("<tr>");
      var newId = $("<th scope='row'>");
      newId.text(a.id);
      var newUsername = $("<td>");
      newUsername.text(a.username);
      var newEmail = $("<td>");
      newEmail.text(a.email);
      var newPassword = $("<td>");  
      newPassword.text(a.password.substring(0,12) + "...");
      var newWins = $("<td>");
      newWins.text(a.wins);
      var newLosses = $("<td>");
      newLosses.text(a.losses);   
      var newKills = $("<td>");
      newKills.text(a.kills);
      var newDeaths = $("<td>");
      newDeaths.text(a.deaths);
      var newScore = $("<td>");
      newScore.text(a.highscore);
      var newGamesPlayed = $("<td>");
      newGamesPlayed.text(a.gamesplayed);

      var newCreatedAt = $("<td>");
      var formattedCreatedAt = new Date(a.createdAt);
      formattedCreatedAt = moment(formattedCreatedAt).format("MM/DD/YY, HH:mm");
      newCreatedAt.text(formattedCreatedAt);

      var newLastPlayed = $("<td>");
      var formattedLastPlayed = new Date(a.updatedAt);
      formattedLastPlayed = moment(formattedLastPlayed).format("MM/DD/YY, HH:mm");
      newLastPlayed.text(formattedLastPlayed);

      var newTimePlayed = $("<td>");
      newTimePlayed.text(a.timeplayed);

      var newDeleteBtn = $("<td>");
      var deleteBtn = $("<button>");
      deleteBtn.text("X");
      deleteBtn.addClass("delete btn btn-danger btn-md");
      newDeleteBtn.append(deleteBtn);

      newRow
        .append(newId)
        .append(newUsername)
        .append(newEmail)
        .append(newPassword)
        .append(newWins)
        .append(newLosses)
        .append(newKills)
        .append(newDeaths)
        .append(newScore)
        .append(newGamesPlayed)
        .append(newTimePlayed)
        .append(newCreatedAt)
        .append(newLastPlayed)
        .append(newDeleteBtn);

      newRow.data("account", a);

      return newRow;
    }
  
    function deleteAccount(id) {
      $.ajax({
        method: "DELETE",
        url: "/api/accounts/delete" + id
      })
        .then(function() {
          getAllAccounts();
        });
    }
  
    function handleAccountDelete() {
      var currentAccount = $(this)
        .parent()
        .parent()
        .data("account");
      deleteAccount(currentAccount.id);
    }
  });