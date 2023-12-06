<script setup>
defineProps(['errors'])
</script>

<template>
    <div class="alert alert-danger" role="alert">
        <p v-for="error in errors">
            {{ error }}
        </p>
    </div>
</template>