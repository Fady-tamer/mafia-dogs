// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCKt1sgol0nfRDkMPhrDyKeLud8CXpxiPg",
    authDomain: "mafia-dogs.firebaseapp.com",
    projectId: "mafia-dogs",
    storageBucket: "mafia-dogs.firebasestorage.app",
    messagingSenderId: "913869880364",
    appId: "1:913869880364:web:80a9b7910e7a6731b8e589",
    measurementId: "G-2RB8KRTEZ0"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);