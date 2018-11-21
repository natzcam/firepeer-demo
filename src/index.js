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
  var firePeer = new FirePeer(firebase);
  firePeer.on("connection", function(conn) {
    conn.on("data", function(data) {
      console.log(data.toString());
    });
  });
  var myUserId;

  $("#users").on("click", ".user", function() {
    const uid = $(this).text();
    debugger;
    firePeer
      .connect(uid)
      .then(function(conn) {
        console.log(conn);
        conn.send("hello");
      })
      .catch(console.error);
  });

  firebase
    .auth()
    .signInAnonymously()
    .then(function(cred) {
      myUserId = cred.user.uid;
      $("#myUid").text(myUserId);

      //presence
      firebase
        .database()
        .ref("presence/" + myUserId)
        .on("value", function(ss) {
          if (ss && !ss.val()) {
            ss.ref.onDisconnect().remove();
            ss.ref.set(true);
          }
        });

      // watch online users
      firebase
        .database()
        .ref("presence")
        .on("value", function(snaps) {
          $("#users").html("");
          if (snaps) {
            snaps.forEach(function(ss) {
              if (myUserId != ss.key) {
                $("#users").append("<p class='user'>" + ss.key + "</p>");
              }
            });
          }
        });
    });
});
