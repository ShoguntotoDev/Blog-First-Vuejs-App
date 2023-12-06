<script setup>
import BaseInputVue from '@/components/BaseInput.vue';
import { reactive } from 'vue';
import { useUserStore } from '@/stores/user';
import ErrorMessages from '@/components/ErrorMessages.vue'

const user = useUserStore();

const form = reactive({
  email: '',
  password: '',
})

const submit = () => {
  user.login(form);
}
</script>

<template>
    <div class="page page-center">
      <div class="container-tight py-4">
        <div class="text-center mb-4">
          <a href="." class="navbar-brand navbar-brand-autodark"><img src="@/assets/static/logo.svg" height="36" alt=""></a>
        </div>
        <form @submit.prevent="submit" class="card card-md" action="/login" method="post">
          <div class="card-body">
            <h2 class="card-title text-center mb-4">Connexion</h2>

            <ErrorMessages v-if="user.getErrors.length" :errors="user.getErrors" />

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
              <button type="submit" class="btn btn-primary w-100">Login</button>
            </div>
          </div>
        </form>
        <div class="text-center text-muted mt-3">
          Don't have account yet? <router-link to="/register">Register</router-link>
        </div>
      </div>
    </div>
</template>