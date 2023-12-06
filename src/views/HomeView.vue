<script setup>
import moment from 'moment';
import { ref, reactive, onMounted } from 'vue';
import { usePostStore } from '@/stores/post';
import { storeToRefs } from 'pinia';
import PostCard from '@/components/PostCard.vue';
import { useRoute } from 'vue-router';

const store = usePostStore();

const { posts, loading, error, posts_count } = storeToRefs(store);
const { getPosts, getSearch, like, getCategory } = store;
const route = useRoute();

if(! route.query.search){
  getPosts();
}
else if(route.name == 'category.show' && route.params.slug){
  getCategory(route.params.slug, sort);
}
else{
  getSearch(route.query.search);
}

const results = reactive({
  resultsToShow: 9,
})

const resetResults = () => {
  results.resultsToShow = 9;
}

const sort = ref(null);

const options = ref([
  {text: 'Newest', value: 'newest'},
  {text: 'Oldest', value: 'oldest'},
  {text: 'Likes', value: 'likes'},
  {text: 'View', value: 'views'},
])

const likePost = (data) => {
  console.log(data);
  like(data);
}

const title = ref('')

onMounted(() => {
  document.addEventListener('DOMContentLoaded', () => {
    title.value = document.querySelector('head title').innerHTML;
    console.log(title.value);
  })
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
                <div
                v-if="posts_count"
                 class="text-muted mt-1">
                  Total : {{ posts_count }} photos
                </div>
              </div>
              <!-- Page title actions -->
              <div class="col-12 col-md-auto ms-auto d-print-none">
                <div class="d-flex">

                  <div>
                    <select 
                    v-if="route.name == 'category.show' && route.params.slug"
                    v-model="sort" 
                    class="form-select" 
                    @change="getCategory(route.params.slug, sort), resetResults()">
                      <option v-for="option in options" :value="option.value">
                        {{ option.text }}
                      </option>
                    </select>
                    <select 
                    v-else
                    v-model="sort" 
                    class="form-select" 
                    @change="!route.query.search ? getPosts(sort) : getSearch(route.query.search, sort), resetResults()">
                      <option v-for="option in options" :value="option.value">
                        {{ option.text }}
                      </option>
                    </select>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="page-body">
          <div class="container-xl">
            <div class="row row-cards">

              <p v-if="loading">Chargement des posts...</p>
              <p v-if="error">{{ error.message }}</p>

              <div
              v-if="posts.length"
              v-for="post in posts.slice(0, results.resultsToShow)" :key="post.id"
               class="col-sm-6 col-lg-4">
                
              <PostCard 
              :post="post" 
              :id="post.id" 
              :category_id="post.category_id"
              :likes_count="post.likes_count" 
              @like="likePost" />

              </div>
            </div>
            <div class="d-flex mt-4 page-center">
              <button
              v-if="results.resultsToShow < posts.length"
              @click="results.resultsToShow += 3"
               class="btn btn-primary">
               Load more
              </button>
            </div>
          </div>
        </div>
        
      </div>
</template>
