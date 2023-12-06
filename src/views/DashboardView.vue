<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import axios from 'axios';
import ErrorMessages from '@/components/ErrorMessages.vue';
import Swal from 'sweetalert2'

const router = useRouter();
const user = useUserStore();
const file = ref(null);
const name = ref(user.getUser?.name);
const email = ref(user.getUser?.email);
const imageUrl = ref(user.getUser?.avatar?.thumbnail_url);
const fileToSend  = ref(null);

const progression = ref(0);
const showProgression = ref(false);
const errors = reactive({
    errors: [],
})

const selectFile = (event) => {
    file.value = fileToSend.value = event.target.files[0];
    console.log(file.value);
    const reader = new FileReader()
    reader.onload = (e) => {
        imageUrl.value = e.target.result;
        console.log(e.target.result);
    }
    reader.readAsDataURL(event.target.files[0]);
}

const onSubmit = async () => {
    errors.errors = [];
    await axios.get('/sanctum/csrf-cookie');
    let formData = new FormData();
    formData.append('file', fileToSend.value);
    formData.append('name', name.value);
    formData.append('email', email.value);

    await axios.post('/user/update/'+user.getUser?.id, formData, {
        headers: {
            'Content-Type': "multipart/form-data; charset=utf-8;"
        },
        onUploadProgress: (e) => {
            if(fileToSend.value && name.value && email.value){
                showProgression.value = true;
                let percentCompleted = Math.round((e.loaded * 100) / e.total);
                console.log(percentCompleted);
                progression.value = percentCompleted;
                if(percentCompleted === 100){
                    setTimeout(() => {
                        progression.value = 0;
                        showProgression.value = false;
                        // router.push({name: 'home'})
                    }, 2000);
                }
            }
        }
    })
    .then(response => {
        console.log(response);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        router.go(0);
    })
    .catch(error => {
        console.log(error);
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

const deleteUser = async () => {
    Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Voulez-vous vraiment supprimer votre compte?',
        allowOutsideClick: false,
        showCancelButton: true,
        cancelButtonText: 'Annuler',
    }).then((result) => {
        if(result.isConfirmed){
            user.deleteUser();
        }
    })
}

const title = ref('');
onMounted(() => {
    title.value = document.querySelector('head title').innerHTML;
})
</script>

<template>
    <div class="page-wrapper">
        <div class="container-xl">
          <!-- Page title -->
          <div class="page-header d-print-none">
            <div class="row g-2 align-items-center">
              <div class="col">
                <h2 class="page-title">
                  {{ title }}
                </h2>
              </div>
            </div>
          </div>
        </div>
        <div class="page-body">
          <div class="container-xl">
            <div class="row row-cards">
                <div class="col-12">

                    <ErrorMessages v-if="errors.errors.length" :errors="errors.errors" />

                    <form @submit.prevent="onSubmit" action="/user/update/{{ user.getUser?.id }}" id="form" method="post" enctype="multipart/form-data">
                        <div class="row">
                            <fieldset class="form-fieldset">
                                <div class="mb-3">
                                    <label for="title" class="form-label">Name</label>
                                    <input 
                                    v-model="name"
                                    type="text" 
                                    name="name" 
                                    class="form-control" 
                                    placeholder="Name"
                                    autofocus />
                                </div>

                                <div class="mb-3">
                                    <label for="email" class="form-label">Email</label>
                                    <input 
                                    v-model="email"
                                    type="text" 
                                    name="email" 
                                    class="form-control" 
                                    placeholder="Email"
                                    autofocus />
                                </div>

                                <div class="form-label mb-3">Ajouter une image</div>
                                    <input
                                    @change="selectFile($event)"
                                    ref="file"
                                    name="file"
                                    type="file"
                                    class="form-control mb-3">

                                    <div v-if="imageUrl" class="mb-3">
                                        <img :src="imageUrl" alt="image" class="img-fluid" width="150" height="150">
                                    </div>

                                    <div v-if="showProgression" class="progress mb-2">
                                        <div class="progress-bar" :style="'width:'+progression+'%'"></div>
                                    </div>

                            </fieldset>

                            <button type="submit" class="btn btn-primary">Envoyer</button>

                            <RouterLink :to="{ name: 'password.update'}">Changer de mot de passe</RouterLink>

                        </div>

                        <div class="row mt-5">
                            <fieldset>
                                <h3 class="text-danger">Zone de danger !!</h3>
                                <button 
                                @click.prevent="deleteUser()"
                                class="btn btn-danger">Supprimer le compte</button>
                            </fieldset>
                        </div>

                    </form>
                </div>
            </div>
          </div>
        </div>
        
      </div>
</template>