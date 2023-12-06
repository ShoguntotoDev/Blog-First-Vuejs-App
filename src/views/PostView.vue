<script setup>
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia';
import { usePostStore } from '@/stores/post';
import moment from 'moment';
import Comment from '@/components/Comment.vue';


const router = useRouter();
const route = useRoute();

const store = usePostStore();

const { post, errors } = storeToRefs(store);

const { getPost, saveComment } = store;

getPost(route.params.slug);

const onSubmit = (form) => {
    saveComment(form);
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
                  {{ post.title }}
                </h2>
              </div>
            </div>
          </div>

            <a :href="post.photo.url" target="_blank">
                <img :data-src="post.photo.url" :alt="post.title" class="card-img-top lazyload" async="decoding">
            </a>
          <div class="card-body">
            <h2 class="card-title">{{ post.title }}</h2>
            <p class="card-text">{{ post.content }}</p>
            <div>
                <span class="avatar me-3 rounded" :style="{ backgroundImage: 'url('+post?.user?.avatar?.thumbnail_url+')' }">
                </span>
                <div class="pt-2">{{ post.user.name }}</div>
                <div class="text-muted">{{ moment(post.created_at).fromNow() }}</div>
            </div>
          </div>

          <div class="mt-5">
            <h3>
                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-message-circle" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1"></path>
                    <line x1="12" y1="12" x2="12" y2="12.01"></line>
                    <line x1="8" y1="12" x2="8" y2="12.01"></line>
                    <line x1="16" y1="12" x2="16" y2="12.01"></line>
                </svg>
                <span class="count">{{ post.comments_count }}</span>
                Commentaire(s)
            </h3>

            <!-- <div v-if="post.comments && post.comments.length"
            v-for="comment in post.comments" :key="comment.id"
             class="m-4">
             <span class="avatar me-3 rounded mb-2"
            :style="{ backgroundImage: 'url('+ comment.user.avatar.thumbnail_url + ')' }"
             ></span>
                <h4>{{ comment.user.name }} -  {{ moment(comment.created_at).fromNow() }}</h4>
                <p>{{ comment.content }}</p>
            </div> -->

            <Comment :comments="post.comments" :post="post" @submit="onSubmit" :errors="errors" />

          </div>

        </div>
    </div>
</template>