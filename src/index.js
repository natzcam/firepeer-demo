var firebase = require("firebase");
var FirePeer = require("firepeer").FirePeer;
var $ = require("jquery");

firebase.initializeApp({
  apiKey: "AIzaSyDl1bEJXXehzFKeAhIOd-VI6Sivial78iU",
  authDomain: "firepeer-demo.firebaseapp.com",
  databaseURL: "https://firepeer-demo.firebaseio.com",
  projectId: "firepeer-demo",
  storageBucket: "firepeer-demo.appspot.com",
  messagingSenderId: "665543533969"
});

$(function() {
  var firePeer = new FirePeer(firebase, {
    allowOffer: function(offer) {
      return confirm(offer.uid + " would like to chat");
    }
  });

  //new chat with another user
  function newChat(conn) {
    var otherUserUid = $("#users ." + conn.uid).text();
    var $messageArea = $("<div class='message-area'>").addClass(conn.uid);
    var $messages = $("<div class='messages'>");
    var $input = $("<input type='text'>").on("keypress", function(event) {
      if (event.keyCode == 13) {
        var str = $input.val();
        newMessage("you", str);
        conn.send(str);
        $input.val("");
      }
    });

    $("#chats").append($messageArea.append($messages).append($input));

    function newMessage(sender, message) {
      $messages.append($("<p class='m'>").text(sender + ": " + message));
    }
    newMessage("", "Connected to " + otherUserUid);

    conn.on("data", function(data) {
      newMessage(otherUserUid, data.toString());
    });

    conn.on("close", function() {
      console.log("close");
      $messageArea.remove();
    });

    conn.on("error", console.error);
  }

  // on firebase signin
  function onAuth(user) {
    if (user == null) {
      //logged out
      $("#users").text("");
      $("#chats").text("");
      $("#uid").text("");
      return;
    }

    $("#uid").text(user.uid);

    //announce your arrival
    firebase
      .database()
      .ref("presence/" + user.uid)
      .on("value", function(snap) {
        //remove node onDisconnect
        snap.ref.onDisconnect().remove();
        snap.ref.set(true);
      });

    // watch online users
    firebase
      .database()
      .ref("presence")
      .on("value", function(snaps) {
        var noUsers = true;
        $("#users").text("");

        snaps.forEach(function(snap) {
          var uid = snap.key;

          //if not you, then create a node
          if (user.uid != uid) {
            noUsers = false;
            var $user = $("<div class='user'>")
              .addClass(uid)
              .text(uid)
              .click(function() {
                var $chat = $("#chats ." + uid);
                if ($chat.length) {
                  //has chat already
                  $("#chats .message-area").hide();
                  $chat.show();
                } else {
                  // connect if no chat yet
                  firePeer.connect(uid).catch(console.error);
                }
              });
            $("#users").append($user);
          }
        });

        if (noUsers) {
          $("#users").text(
            "No others online users at the moment. Use an incognito tab to talk to yourself. :)"
          );
        }
      });
  }

  firePeer.on("connection", newChat);
  firebase.auth().onAuthStateChanged(onAuth);
  firebase.auth().signInAnonymously();
});
