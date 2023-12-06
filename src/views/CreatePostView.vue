<script setup>
import { ref, reactive } from 'vue'
import { usePostStore } from '@/stores/post';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import axios from 'axios';
import ErrorMessages from '@/components/ErrorMessages.vue';
    

    const store = usePostStore();
    const user = useUserStore();
    const router = useRouter();

    const { categories } = storeToRefs(store);
    const { getCategories } = store;

    getCategories();

    const title = ref('');
    const content = ref('');
    const category_id = ref(0);
    const user_id = ref(user.getUser?.id);
    const file = ref(null);

    const imageUrl = ref(null);
    const fileToSend  = ref(null);

    const progression = ref(0);
    const showProgression = ref(false);

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

    const onChangeCategory = (event) => {
        // console.log(event.target.value);
        category_id.value = event.target.value;
        console.log(category_id.value);
    }

    const onSubmit = async () => {
        errors.errors = [];
        await axios.get('/sanctum/csrf-cookie');
        let formData = new FormData();
        formData.append('file', fileToSend.value);
        formData.append('title', title.value);
        formData.append('content', content.value);
        formData.append('category_id', category_id.value);
        formData.append('user_id', user_id.value);

        await axios.post('/post/store', formData, {
            headers: {
                'Content-Type': "multipart/form-data; charset=utf-8;"
            },
            onUploadProgress: (e) => {
                if(fileToSend.value && title.value && content.value && category_id.value){
                    showProgression.value = true;
                    let percentCompleted = Math.round((e.loaded * 100) / e.total);
                    console.log(percentCompleted);
                    progression.value = percentCompleted;
                    if(percentCompleted === 100){
                        setTimeout(() => {
                            progression.value = 0;
                            showProgression.value = false;
                            router.push({name: 'home'})
                        }, 2000);
                    }
                }
            }
        })
        .then(response => {
            console.log(response);
        })
        .catch(error => {
            console.log(error);
            if(error.response.status === 422){
                for(const key in error.response.data.errors){
                    errors.errors.push(error.response.data.errors[key][0]+' ');
                }
                console.log(errors.errors);
            }
        })
    }
    const errors = reactive({
        errors: [],
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

                    <form @submit.prevent="onSubmit" action="/post/store" id="form" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="user_id" v-model="user_id">
                        <div class="roww">
                            <fieldset class="form-fieldset">
                                <div class="mb-3">
                                    <label for="title" class="form-label">Title</label>
                                    <input 
                                    v-model="title"
                                    type="text" 
                                    name="title" 
                                    class="form-control" 
                                    placeholder="Titre"
                                    autofocus />
                                </div>
                                <div class="mb-3">
                                    <label for="content" class="form-label">Contenu</label>
                                    <textarea
                                    v-model="content"
                                    class="form-control"
                                    name="content"
                                    placeholder="Contenu du post"
                                    ></textarea>
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

                                    <div class="mb-3">
                                        <label class="form-label">Catégorie</label>
                                        <select
                                        @change="onChangeCategory($event)"
                                        v-model="category_id"
                                        name="category_id"
                                        class="form-select"
                                        placeholder="Select cateogorie">
                                        <option v-for="cat in categories" :value="cat.id">
                                            {{ cat.name }}
                                        </option>
                                    </select>
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