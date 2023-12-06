<script setup>
import moment from 'moment';
import { ref, reactive } from 'vue';
import { useUserStore } from '@/stores/user';
import { usePostStore } from '@/stores/post';
import 'lazysizes'
import Swal  from 'sweetalert2';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import ErrorMessages from './ErrorMessages.vue';

const props = defineProps(['post', 'id', 'likes_count', 'category_id']);

const user = useUserStore();
const store = usePostStore();
const { categories }  = storeToRefs(store);
const { getCategory, getCategories } = store;

getCategories();

const form = reactive({
    post_id: props.id,
    user_id: user.getUser?.id,
    title: props.post.title,
    content: props.post.content,
    category_id: props.post.category_id,
})

const progression = ref(0);
const showProgression = ref(null);

const imageUrl = ref(props.post.photo.thumbnail_url);
const file = ref(null);
const fileToSend = ref(null);

const emit = defineEmits({
    like: ({user_id}) => {
        if(user_id) return true;
        return false;
    }
})

function emitLike() {
    emit('like', {post_id: form.post_id, user_id: form.user_id});
}

const likedByUser = props.post.likes.some(like => like.user_id === user.getUser?.id);

const styleObject = reactive({
    color: likedByUser ? 'red' : '',
    count_likes: props.likes_count,
})
const count_likes = ref(props.likes_count);

const toogleHeart = () => {
    styleObject.color = styleObject.color == 'red' ? '' : 'red',
    count_likes.value = styleObject.color == 'red' ? count_likes.value + 1 : count_likes.value -1;
}
const deletePost = () => {
    Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Confirmez-vous la suppression de ce post ?',
        allowOutsideClick: false,
        cancelButtonText: 'Annuler',
        showCancelButton: true,
    }).then((result) => {
        if(result.isConfirmed){
            store.deletePost(props.post.id, props.post.user_id);
        }
    })
}

const modalOpen = ref(false);
const displayModalStyle = ref('display:none;');
const toggleModal = () => {
    modalOpen.value = ! modalOpen.value;
    displayModalStyle.value = modalOpen.value ? 'display:block;' : 'display:none;';
}

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
    formData.append('file', fileToSend.value ?? null);
    formData.append('title', form.title);
    formData.append('content', form.content);
    formData.append('category_id', form.category_id);
    formData.append('user_id', form.user_id);
    formData.append('post_id', form.post_id);

    await axios.post('/post/update', formData, {
        headers: {
            'Content-Type': "multipart/form-data; charset=utf-8;"
        },
        onUploadProgress: (e) => {
            if(fileToSend.value && form.title && form.content && form.category_id){
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
        if(response.status === 200){
            Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: response.data.message,
                allowOutsideClick: false,
                showConfirmButton: false,
                timer: 2000,
            }).then((result) => {
                toggleModal();
            })
        }
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


</script>

<template>
    <div class="card card-sm">
    <RouterLink :to="{ name: 'post.show', params: { slug: post.slug, title: post.title } }" class="d-block">
        <img :data-src="post.photo.thumbnail_url" :alt="post.title" async="decoding" class="card-img-top lazyload">
    </RouterLink>
    <div class="card-body">
    <div class="d-flex align-items-center">
        <span v-if="post.user?.avatar?.thumbnail_url"
        class="avatar me-3 rounded" 
        :style="{ backgroundImage: 'url(' +post.user.avatar.thumbnail_url+ ')' }">
        </span>
        <div>
        <div>{{ post.user.name }}</div>
        <div class="text-muted">
            {{ moment(post.created_at).fromNow() }}
        </div>
        <div>Catégorie : 
            <RouterLink @click="getCategory(post.category.slug)" :to="{ name: 'category.show', params: {slug: post.category.slug, title: post.category.name}}">
                {{ post.category.name }}
            </RouterLink>
        </div>

        <br>

        <span v-if="user.loggedIn && user.getUser?.id == post.user_id">
            <a @click.prevent="deletePost()" href="" class="btn btn-danger">Supprimer</a>
        </span>
        &nbsp;
        <span v-if="user.loggedIn && user.getUser?.id == post.user_id">
            <a @click.prevent="toggleModal"
            class="btn btn-info">Editer</a>
        </span>

        </div>
        <div class="ms-auto">
        <a href="#" class="text-muted">
            <!-- Download SVG icon from http://tabler-icons.io/i/eye -->
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="12" cy="12" r="2" /><path d="M22 12c-2.667 4.667 -6 7 -10 7s-7.333 -2.333 -10 -7c2.667 -4.667 6 -7 10 -7s7.333 2.333 10 7" /></svg>
            {{ post.visits_count }}
        </a>

        <form @submit.prevent="emitLike" style="display: inline;">
            <button
            v-if="user.loggedIn"
            :style="styleObject"
            class="like_button"
            type="submit"
            @click="like, toogleHeart()">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /></svg>
            {{ count_likes }}
            </button>

            <button
                v-else
                class="like_button"
            >
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /></svg>
            {{ count_likes }}
            </button>
        </form>
        </div>

        <div v-if="user.loggedIn && user.getUser?.id == post.user_id">
            
      <div class="modal modal-blur fade show" id="modal-report" tabindex="-1"
       :style="displayModalStyle" 
       aria-modal="true" role="dialog">
      <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Editer {{ post.title }}</h5>
            <button @click="toggleModal" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <ErrorMessages v-if="errors.errors.length" :errors="errors.errors" />

          <form @submit.prevent="onSubmit" method="post">
            <input type="hidden" name="post_id" :value="form.post_id">
            <input type="hidden" name="user_id" :value="form.user_id">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Title</label>
              <input 
              v-model="form.title"
              type="text" 
              class="form-control" 
              name="title" 
              placeholder="Title">
            </div>

            <div class="mb-3">
                <label for="content" class="form-label">Content</label>
                <textarea
                v-model="form.content"
                 class="form-control" 
                 rows="3">
                </textarea>
            </div>

            <div class="mb-3">
                <div class="form-lable">Modifier l'image</div>
                <input type="file"
                @change="selectFile($event)"
                name="file"
                accept="image/jpeg, image/png"
                class="form-control mb-3"
                ref="file">

                <div v-if="imageUrl" class="mb-3">
                    <img :src="imageUrl" alt="image" class="img-fluid" width="150" height="150">
                </div>

                <div v-show="showProgression" class="progress mb-2">
                    <div class="progress-bar" :style="'width:'+progression+'%'">

                    </div>
                </div>

            </div>

            <div class="mb-3">
                <label for="category">Category</label>
                <select
                    class="form-select"
                    name="category_id"
                    v-model="form.category_id"
                    @change="">
                    <option v-for="cat in categories" :value="cat.id">
                        {{ cat.name }}
                    </option>
                </select>
            </div>

          </div>

          <div class="modal-footer">

            <button type="submit" class="btn btn-primary ms-auto">
                Update
            </button>
          </div>
          </form>

        </div>
      </div>
    </div>

        </div>


    </div>
    </div>
</div>
</template>

<style scoped>
.lazyload,
.lazyloading {
	opacity: 0;
}
.lazyloaded {
	opacity: 1;
	transition: opacity 2000ms;
}
.like_button{
    border:none; background: none;
}
</style>