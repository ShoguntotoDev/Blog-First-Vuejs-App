import { defineStore } from "pinia";
import axios from 'axios';
import Swal from "sweetalert2";


export const usePostStore = defineStore({
    id: 'post',

    state: () => ({
        posts: [],
        errors: [],
        loading: false,
        post: null,
        category: null,
        posts_count: 0,
        categories: [],
    }),

    getters: {
        getErrors: (state) => state.errors,
        getLoading: (state) => state.loading,
        getId: (state) => state.post.id,
    },

    actions: {
        async csrf() {
            await axios.get('/sanctum/csrf-cookie');
        },

        async getPosts(sort = null)
        {
            this.loading = true;
            await axios.get('/posts?sort='+sort).then((response) => {
                this.loading = false;
                console.log(response);
                if(response.status == 200){
                    this.posts = [];
                    this.posts = response.data.posts;
                    this.posts_count = response.data.posts_count;
                }
            })
            .catch(error => {
                this.loading = false;
                console.log(error);
            })
        },

        async getPost(slug)
        {
            this.post = [];
            this.loading = true;

            this.csrf();
            await axios.get('/post/'+slug).then((response) => {
                console.log(response);
                this.loading = false;
                if(response.status == 200){
                    this.post = response.data.post;
                    window.document.title += ' - '+this.post.title;
                }
            })
            .catch(error => {
                console.log(error);
                if(error.response.status == 404){
                    this.$router.push({name: 'not-found'})
                }
            })
        },

        async saveComment(props)
        {
            this.errors = [];
            this.csrf();
            await axios.post('/comment', props).then((response) => {
                console.log(response);
                if(response.status == 201){
                    this.post.comments.push(response.data.comment);
                    this.post.comments_count = response.data.comments_count;
                }
            })
            .catch(error => {
                console.log(error);
                if(error.response.status === 422){
                    for(const key in error.response.data.errors){
                        this.errors.push(error.response.data.errors[key][0] + ' ');
                    }
                    console.log(this.errors);
                }
            })
        },

        async getSearch(search, sort = null)
        {
            if(! search){
                this.$router.push({name: 'home'})
            }
            this.posts = [];
            this.loading = true;

            await this.csrf();
            await axios.get('/search/?search='+search+'&sort='+sort).then((response) =>{
                console.log(response);
                this.loading = false;
                if(response.status == 200){
                    this.posts = response.data.posts;
                    this.posts_count = response.data.posts_count;
                    this.$router.push({name: 'home', query: { search: search, sort: sort }})
                }
            })
            .catch(error => {
                this.loading = false;
                console.log(error);
            })
        },

        async like(props)
        {
            await axios.post('/like/'+props.post_id+'/'+props.user_id, {props: props}).then((response) => {
                console.log(response);
                if(response.status == 201){
                    this.post.likes_count = response.data.likes_count;
                }
            })
            .catch(error => {
                console.log(error);
            })
        },

        async getCategory(slug, sort = null)
        {
            this.posts = [];
            this.loading = true;

            await this.csrf();
            await axios.get('/category/'+slug+'?sort='+sort).then((response) => {
                console.log(response);
                this.loading = false;
                if(response.status == 200){
                    this.posts = response.data.posts;
                    this.category = response.data.category;
                    this.posts_count = response.data.posts_count;
                }
            })
            .catch(error => {
                this.loading = false;
                console.log(error);
            })
        },

        async getCategories()
        {
            this.categories = [];
            await this.csrf();
            await axios.get('/categories').then((response) => {
                console.log(response);
                if(response.status == 200){
                    this.categories = response.data.categories;
                    console.log(this.categories);
                }
            })
            .catch(error => {
                console.log(error);
            })
        },

        async deletePost(post_id, user_id)
        {
            await this.csrf();
            await axios.get('/post/destroy/'+post_id+'/'+user_id).then((response) => {
                console.log(response);
                if(response.status === 200){
                    Swal.fire({
                        icon: 'success',
                        title: 'Succès',
                        text: response.data.message,
                        allowOutsideClick: false,
                    }).then((result) => {
                        if(result.value){
                            this.$router.go(0);
                        }
                    })
                }
            })
            .catch(error => {
                console.log(error);
            })
        }
    }
})