<script setup>
import BaseInputVue from '@/components/BaseInput.vue';
import axios from 'axios';
import { reactive } from 'vue';
import { useUserStore } from '@/stores/user.js';
import { useRouter } from 'vue-router';
import router from '../router';
import ErrorMessages from '@/components/ErrorMessages.vue'

const user = useUserStore();

const form = reactive({
  name: '',
  email: '',
  password: '',
})

// const submit = async () => {
//   console.log(form);
//   await axios.get('/sanctum/csrf-cookie');

//   await axios.post('/register', form)
//   .then(res => {
//     console.log(res);
//     if(res.status == 201){
//       alert(res.data.message);
//     }
//   })
//   .catch(err => {
//     console.log(err);
//     switch(err.response.status){
//       case 422:
//         console.log(err.response.data.errors.name[0]);
//       break;
//     }
//   })
// }

const submit = () => {
  user.register(form);
  // router.push('/dashboard');
}

</script>

<template>
    <div class="page page-center">
      <div class="container-tight py-4">
        <div class="text-center mb-4">
          <a href="." class="navbar-brand navbar-brand-autodark"><img src="@/assets/static/logo.svg" height="36" alt=""></a>
        </div>
        <form @submit.prevent="submit" class="card card-md" action="/register" method="post">
          <div class="card-body">
            <h2 class="card-title text-center mb-4">Create new account</h2>

            <ErrorMessages v-if="user.getErrors.length" :errors="user.getErrors" />

            <!-- <div v-if="user.getErrors.length" class="alert alert-danger" role="alert">
              <p v-for="error in user.getErrors">
                {{ error }}
              </p>
            </div> -->

            <div class="mb-3">
              <BaseInputVue
                v-model="form.name"
                label="Name"
                type="text"
              />
            </div>
            <div class="mb-3">
              <BaseInputVue
                v-model="form.email"
                label="Email address"
                type="email"
              />
            </div>
            <div class="mb-3">
              <BaseInputVue
                v-model="form.password"
                label="Password"
                type="password"
              />
            </div>
            <div class="form-footer">
              <button type="submit" class="btn btn-primary w-100">Create new account</button>
            </div>
          </div>
        </form>
        <div class="text-center text-muted mt-3">
          Already have account? <router-link to="/login">Login</router-link>
        </div>
      </div>
    </div>
</template>