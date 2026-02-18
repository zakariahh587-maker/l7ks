import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "xxx",
    authDomain: "xxx",
    databaseURL: "https://database-4daea-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "xxx",
    storageBucket: "xxx",
    messagingSenderId: "xxx",
    appId: "xxx"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);
