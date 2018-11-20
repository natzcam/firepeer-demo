const firebase = require("firebase");
const { FirePeer } = require("firepeer");

firebase.initializeApp({
  apiKey: "AIzaSyDl1bEJXXehzFKeAhIOd-VI6Sivial78iU",
  authDomain: "firepeer-demo.firebaseapp.com",
  databaseURL: "https://firepeer-demo.firebaseio.com",
  projectId: "firepeer-demo",
  storageBucket: "firepeer-demo.appspot.com",
  messagingSenderId: "665543533969"
});

const auth = firebase.auth();
const db = firebase.database();

const ready = fn => {
  if (
    document.attachEvent
      ? document.readyState === "complete"
      : document.readyState !== "loading"
  ) {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
};

const init = () => {};
ready(init);

let firePeer;
let vars = {
  ctrl: {
    connect: async function() {
      const uid = jquery(this).text();
      firePeer = new FirePeer();
      const conn = await firePeer.connect(db.ref(`users/${uid}/connections`));
      console.log(conn);
    }
  }
};

rivets.bind(jquery(".container"), vars);

auth.onAuthStateChanged(user => {
  if (user) {
    vars.user = user;
    const path = db.ref(`users/${user.uid}/connections`);
    firePeer = new FirePeer(path);
  } else {
    if (firePeer) {
      firePeer.destroy();
    }
  }
});
auth.signInAnonymously();

db.ref(`users`).on("value", snapshot => {
  const users = [];
  snapshot.forEach(function(child) {
    users.push(child.val());
  });
  vars.users = users;
});
