import { defineStore } from "pinia";
import axios from 'axios'
import { useRouter } from 'vue-router'

export const useUserStore = defineStore({
    id: 'user',

    state: () => ({
        loggedIn : localStorage.getItem('token') ? true : false,
        user : localStorage.getItem('user') ?? null,
        token: localStorage.getItem('token') ?? false,
        errors: [],
    }),

    getters : {
        getToken: (state) => state.token,
        getUser: (state) => JSON.parse(state.user),
        getErrors: (state) => state.errors,
    },

    actions: {
        async csrf(){
            await axios.get('/sanctum/csrf-cookie');
        },

        async register(props) {
            this.errors = [];
            await this.csrf();
            await axios.post('/register', props).then((response) => {
                console.log(response);
                if(response.status == 201){
                    // const user = response.data.user;
                    // const token = response.data.token;
                    // localStorage.setItem('user', JSON.stringify(user))
                    // localStorage.setItem('token', token)
                    // axios.defaults.headers.common['Authorization'] = token;
                    // this.loggedIn = true;
                    // this.user = user;
                    this.loginUser(response);
                    this.$router.push({name: 'dashboard'})
                }
            })
            .catch(error => {
                console.log(error);
                if(error.response.status == 422){
                    for (const key in error.response.data.errors){
                        this.errors.push(error.response.data.errors[key][0]+ ' ');
                    }
                    console.log(this.errors);
                }
            })
        },

        async login(props) {
            this.errors = [];
            await this.csrf();
            await axios.post('/login', props).then((response) => {
                console.log(response);
                if(response.status == 200){
                    // const user = response.data.user;
                    // const token = response.data.token;
                    // localStorage.setItem('user', JSON.stringify(user));
                    // localStorage.setItem('token', token);
                    // axios.defaults.headers.common['Authorization'] = token;
                    // this.loggedIn = true;
                    // this.user = user;
                    this.loginUser(response);
                    this.$router.push({name: 'dashboard'})
                }
            })
            .catch(error => {
                console.log(error);
                if(error.response.status === 422){
                    for (const key in error.response.data.errors){
                        this.errors.push(error.response.data.errors[key][0]+ ' ');
                    }
                    console.log(this.errors);
                }
                if(error.response.status === 401){
                    this.errors.push(error.response.data.error);
                }
            })
        },

        async logout() {
            await this.csrf();
            await axios.post('/logout/'+this.getUser.id).then((response) => {
                console.log(response);
                if(response.status === 200){
                    this.token = null;
                    this.loggedIn = false;
                    localStorage.clear();
                    this.$reset();
                    this.$router.push({name: 'login'})
                }
            })
            .catch(error => {
                console.log(error);
            })
        },

        loginUser(response) {
            const user = response.data.user;
            const token = response.data.token;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = token;
            this.loggedIn = true;
            this.user = user;
        },

        async deleteUser(){
            await this.csrf();
            await axios.delete('/user/destroy/'+this.getUser.id).then((response) => {
                console.log(response);
                if(response.status == 200){
                    this.token = null;
                    localStorage.clear();
                    this.$reset();
                    this.$router.push({name: 'login'});
                }
            })
            .catch(error => {
                console.log(error);
            })
        }
    }
})