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
  var name = prompt("Whats your display name?");
  $("#name").text(name);

  function newChat(conn) {
    var parent = $("<div class='message-area'>").addClass(conn.id);
    var messages = $("<div class='messages'>");
    function newMessage(message) {
      messages.append($("<p class='m'>").text(message));
    }

    var input = $("<input type='text'>").on("keypress", function(event) {
      if (event.keyCode == 13) {
        var str = input.val();
        newMessage(str);
        conn.send(str);
        input.val("");
      }
    });

    parent.append(messages).append(input);
    $("#chats").append(parent);

    conn.on("data", function(data) {
      newMessage(data.toString());
    });

    conn.on("close", function() {
      console.log("close");
      parent.remove();
    });

    conn.on("error", console.error);
  }

  firePeer.on("connection", newChat);

  firebase
    .auth()
    .signInAnonymously()
    .then(function(cred) {
      var yourUid = cred.user.uid;

      //announce your arrival
      firebase
        .database()
        .ref("presence/" + yourUid)
        .on("value", function(snap) {
          //remove node onDisconnect
          snap.ref.onDisconnect().remove();
          //set your name
          snap.ref.set(name);
        });

      // watch online users
      firebase
        .database()
        .ref("presence")
        .on("value", function(snaps) {
          $("#users").html("");
          snaps.forEach(function(snap) {
            //if not you, then create a node
            if (yourUid != snap.key) {
              var user = $("<div class='user'>")
                .addClass(snap.key)
                .text(snap.val()) //show the name of the user
                .click(function() {
                  firePeer.connect(snap.key).catch(console.error);
                });
              $("#users").append(user);
            }
          });
        });
    });
});
