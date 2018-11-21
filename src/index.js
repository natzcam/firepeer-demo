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
      return confirm($("#users ." + offer.uid).text() + " would like to chat");
    }
  });
  var name = prompt("Whats your display name?");
  $("#name").text(name);

  function newChat(conn) {
    var name = $("#users ." + conn.uid).text();
    var $parent = $("<div class='message-area'>").addClass(conn.uid);
    var $messages = $("<div class='messages'>");
    var $input = $("<input type='text'>").on("keypress", function(event) {
      if (event.keyCode == 13) {
        var str = $input.val();
        newMessage("you", str);
        conn.send(str);
        $input.val("");
      }
    });

    function newMessage(sender, message) {
      $messages.append($("<p class='m'>").text(sender + ": " + message));
    }

    newMessage("", "Connected to " + name);
    $parent.append($messages).append($input);
    $("#chats").append($parent);

    conn.on("data", function(data) {
      newMessage(name, data.toString());
    });

    conn.on("close", function() {
      console.log("close");
      $parent.remove();
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
            var uid = snap.key;
            var name = snap.val();
            if (yourUid != uid) {
              var $user = $("<div class='user'>")
                .addClass(uid)
                .text(name) //show the name of the user
                .click(function() {
                  var $chat = $("#chats ." + uid);
                  if ($chat.length) {
                    //has chat already
                    $("#chats .message-area").hide();
                    $chat.show();
                  } else {
                    firePeer.connect(uid).catch(console.error);
                  }
                });
              $("#users").append($user);
            }
          });
        });
    });
});
