import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import "bootstrap-icons/font/bootstrap-icons.css";

createApp(App).use(createPinia()).mount("#app");
