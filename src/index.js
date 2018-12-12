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
      return new Promise(function(resolve, reject) {
        var $user = $("#users ." + offer.id);
        if ($user.has("button").length) {
          //already has request
          resolve(false);
        } else {
          $allowBtn = $("<button>Would like to chat. Click to allow</button>");
          $allowBtn.click(function(e) {
            $allowBtn.remove();
            resolve(true);
            e.stopPropagation();
          });
          $user.append($allowBtn);
        }
      });
    }
  });

  //new chat with another user
  function newChat(peer) {
    var $chat = $("<div class='chat'>").addClass(peer.id);
    var $messages = $("<div class='messages'>");
    var $input = $("<input type='text'>").on("keypress", function(event) {
      if (event.keyCode == 13) {
        var str = $input.val();
        newMessage("you", str);
        peer.send(str);
        $input.val("");
      }
    });

    $("#chats").append($chat.append($messages).append($input));

    function newMessage(sender, message) {
      $messages.append($("<p class='m'>").text(sender + ": " + message));
    }
    newMessage("", "Connected to " + peer.id);

    peer.on("data", function(data) {
      newMessage(peer.id, data.toString());
    });

    peer.on("close", function() {
      console.log("close");
      $chat.remove();
    });

    peer.on("error", console.error);
  }

  // on firebase signin
  function onAuth(user) {
    if (user == null) {
      //logged out
      $("#users").text("");
      $("#chats").text("");
      $("#uid").text("");
      $("#id").text("");
      return;
    }

    $("#uid").text(user.uid);
    $("#id").text(firePeer.id);

    //announce your arrival
    firebase
      .database()
      .ref("presence/" + firePeer.id)
      .on("value", function(snap) {
        //remove node onDisconnect
        snap.ref.onDisconnect().remove();
        snap.ref.set(user.uid);
      });

    // watch online users
    firebase
      .database()
      .ref("presence")
      .on("value", function(snaps) {
        var noUsers = true;
        $("#users").text("");

        snaps.forEach(function(snap) {
          var id = snap.key;
          var uid = snap.val();

          //if not you, then create a node
          if (firePeer.id != id) {
            noUsers = false;
            var $user = $("<div class='user'>")
              .addClass(id)
              .text(id)
              .click(function() {
                var $chat = $("#chats ." + id);
                if ($chat.length) {
                  //has chat already
                  $("#chats .chat").hide();
                  $chat.show();
                } else {
                  // connect if no chat yet
                  firePeer
                    .connect(
                      uid,
                      id
                    )
                    .catch(console.error);
                }
              });
            $("#users").append($user);
          }
        });

        if (noUsers) {
          $("#users").text(
            "No others online users at the moment. Use another tab to talk to yourself. :)"
          );
        }
      });
  }

  firePeer.on("connection", newChat);
  firebase.auth().onAuthStateChanged(onAuth);
  firebase.auth().signInAnonymously();
});
