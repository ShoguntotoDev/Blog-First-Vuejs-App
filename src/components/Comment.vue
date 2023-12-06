<script setup>
import moment from 'moment';
import { useUserStore } from '@/stores/user';
import { reactive } from 'vue';
import BaseInput from '@/components/BaseInput.vue';
import ErrorMessages from '@/components/ErrorMessages.vue';

const props = defineProps(['comments', 'post', 'errors'])

const user = useUserStore();

const form = reactive({
    content: '',
    post_id: props.post.id,
    user_id: user.getUser?.id ?? null,
})

const emit = defineEmits({
    submit: (form) => {
        return true;
    }
})

const submitForm = () => {
    emit('submit', form);
    form.content = '';
}

</script>

<template>
    <div v-if="comments && comments.length"
    v-for="comment in comments" :key="comment.id"
        class="m-4">
        <span v-if="comment?.user?.avatar?.thumbnail_url"
         class="avatar me-3 rounded mb-2"
    :style="{ backgroundImage: 'url('+ comment.user.avatar.thumbnail_url + ')' }"
        ></span>
        <h4>{{ comment.user.name }} -  {{ moment(comment.created_at).fromNow() }}</h4>
        <p>{{ comment.content }}</p>
    </div>

    <div v-if="user.loggedIn">
        <form @submit.prevent="submitForm" class="card card-md" method="post">
            <div class="card-body">
                <h2 class="card-title text-center mb-4">Laisser un commentaire</h2>

                <ErrorMessages v-if="props.errors.length" :errors="props.errors" />

                <label class="form-label" for="content"></label>
                <textarea
                v-model="form.content"
                name="content"
                cols="30" rows="5"
                placeholder="Commentaire"
                class="form-control"
                ></textarea>

                <BaseInput
                v-model="form.post_id"
                label=""
                type="hidden" />

                <BaseInput
                v-model="form.user_id"
                label=""
                type="hidden" />

                <button @click="submit" type="submit" class="btn btn-primary mt-2">Envoyer</button>
            </div>
        </form>
    </div>

</template>