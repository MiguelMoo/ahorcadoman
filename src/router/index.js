import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/Login.vue";
import Dashboard from "../components/Dashboard.vue";
import { auth } from "../FireBase/firebaseConfig"; 
const routes = [
  { path: "/", component: Login },
  { 
    path: "/dashboard",
    component: Dashboard,
    //meta: { requiresAuth: true }  
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Proteger rutas que requieren autenticación
// router.beforeEach((to, from, next) => {
//   const user = auth.currentUser;
//   if (to.meta.requiresAuth && !user) {
//     next("/");
//   } else {
//     next();
//   }
// });

export default router;
