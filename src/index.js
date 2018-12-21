var firebase = require("firebase");
var FirePeer = require("firepeer").FirePeer;

firebase.initializeApp({
  apiKey: "AIzaSyDl1bEJXXehzFKeAhIOd-VI6Sivial78iU",
  authDomain: "firepeer-demo.firebaseapp.com",
  databaseURL: "https://firepeer-demo.firebaseio.com",
  projectId: "firepeer-demo",
  storageBucket: "firepeer-demo.appspot.com",
  messagingSenderId: "665543533969"
});

var firepeer = new FirePeer(firebase);

document.addEventListener("DOMContentLoaded", function() {
  var $uid = document.getElementById("uid");
  var $id = document.getElementById("id");
  var $receiverUid = document.getElementById("receiverUid");
  var $receiverId = document.getElementById("receiverId");
  var $connectBtn = document.getElementById("connectBtn");
  var $message = document.getElementById("message");
  var $messageBtn = document.getElementById("messageBtn");
  var $received = document.getElementById("received");

  firepeer.on("loggedin", function() {
    $uid.textContent = firepeer.uid;
    $id.textContent = firepeer.id;
  });

  $connectBtn.onclick = function() {
    if ($receiverUid.value && $receiverId.value) {
      $connectBtn.value = "Connecting";
      $connectBtn.disabled = true;

      firepeer.connect(
        $receiverUid.value,
        $receiverId.value
      );
    } else {
      alert("User Id and Peer Id required");
    }
  };

  firepeer.on("connection", function(peer) {
    $connectBtn.value = "Connected to " + peer.receiverId;
    $connectBtn.disabled = true;
    $receiverUid.disabled = true;
    $receiverId.disabled = true;

    peer.on("data", function(data) {
      $received.textContent = data;
    });

    $messageBtn.onclick = function() {
      peer.send($message.value);
    };

    peer.on("close", function() {
      $connectBtn.value = "Connect";
      $connectBtn.disabled = false;
      $receiverUid.disabled = false;
      $receiverId.disabled = false;
    });
  });

  firebase.auth().signInAnonymously();
});
