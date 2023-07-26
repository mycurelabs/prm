<template lang="pug">
q-page.fit.flex.flex-center
  div.column.items-center
    img(alt="logo" src="~assets/notfound-page-art.png" style="width: 170px;")

    q-chip(color="grey-2").q-mt-md.q-mb-lg 404

    div.text-h5.q-mb-sm
      | This page doesn't exist

    div.text-caption.text-grey
      | Were you looking for something else?

    div.column.q-mt-lg
      q-btn(
        no-wrap
        color="white"
        text-color="primary"
        unelevated
        label="Go back to the previous page"
        no-caps
        icon="mdi-arrow-left"
        @click="onGoBack"
      )
      q-btn(
        no-wrap
        color="white"
        text-color="negative"
        unelevated
        label="Log out instead"
        no-caps
        icon="mdi-logout"
        @click="onSignout"
      )
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'NotFoundPage',
  setup () {
    const router = useRouter();

    const onGoBack = () => {
      router.replace({ name: 'app' });
    };

    const onSignout = () => {
      router.replace({ name: 'signout' });
    };

    return {
      onGoBack,
      onSignout,
    }
  },
};
</script>
