import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyARh17ah4TFxbaNtIIw-w8KztLcN37oqdo",
    projectId: "nextapp-yuri",
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);