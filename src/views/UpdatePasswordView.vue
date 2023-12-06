<script setup>
import {ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import axios from 'axios';
import ErrorMessages from '../components/ErrorMessages.vue';
import BaseInput from '../components/BaseInput.vue';
import Swal from 'sweetalert2'

const user = useUserStore();
const router = useRouter();

const form = reactive({
    current_password: '',
    password: '',
    password_confirmation: '',
})
const errors = reactive({
    errors: [],
})

const onSubmit = async () => {
    errors.errors = [];
    await axios.get('/sanctum/csrf-cookie');

    await axios.post('/user/password/'+user.getUser?.id, form).then((response) => {
        console.log(response);
        if(response.data.success)
        {
            Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: response.data.message,
                allowOutsideClick: false,
            }).then((result) => {
                if(result.isConfirmed){
                    router.go(0);
                }
            })
        }
    })
    .catch(error => {
        console.log(error);
        if(error.response.data.error){ //mauvais password actuel
            // errors.errors.push(error.response.data.error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.response.data.error,
                allowOutsideClick: false,
            })
        }
        if(error.response.status === 422){
            for(const key in error.response.data.errors){
                errors.errors.push(error.response.data.errors[key][0]+' ');
            }
            console.log(errors.errors);
        }
        if(error.response.status === 500){
            errors.errors.push(error.response.data.message);
            console.log(errors.errors);
        }

        if(errors.errors.length)
        {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                html: errors.errors.join('<br>'),
                allowOutsideClick: false,
            })
        }
    })
}
    
</script>
<template>
    <div class="page-wrapper">
        <div class="container-xl">
          <!-- Page title -->
          <div class="page-header d-print-none">
            <div class="row g-2 align-items-center">
              <div class="col">
                <h2 class="page-title">
                  <!-- {{ title }} -->
                </h2>
              </div>
            </div>
          </div>
        </div>
        <div class="page-body">
          <div class="container-xl">
            <div class="row row-cards">
                <div class="col-12">

                    <!-- <ErrorMessages v-if="errors.errors.length" :errors="errors.errors" /> -->

                    <form @submit.prevent="onSubmit" action="." id="form" method="post">
                        <div class="row">
                            <fieldset class="form-fieldset">
                                <div class="mb-3">
                                    <BaseInput
                                    v-model="form.current_password"
                                    label="Current password"
                                    type="password" />
                                </div>

                                <div class="mb-3">
                                    <BaseInput
                                    v-model="form.password"
                                    label="New password"
                                    type="password" />
                                </div>

                                <div class="mb-3">
                                    <BaseInput
                                    v-model="form.password_confirmation"
                                    label="Confirm password"
                                    type="password" />
                                </div>
                            </fieldset>

                            <button type="submit" class="btn btn-primary">Envoyer</button>

                        </div>
                    </form>
                </div>
            </div>
          </div>
        </div>
        
      </div>
</template>