<script setup lang="ts">
const router = useRouter();
const route = useRoute();

onMounted(() => {
    // Remove utm parameters from the URL to make it cleaner.
    const filteredQuery = Object.fromEntries(
        Object.entries(route.query).filter(([key]) => !key.startsWith('utm_'))
    );

    router.replace({ query: filteredQuery });
});
</script>

<template></template>