<template lang="pug">
q-page.fit.flex.flex-center
  div.column.items-center
    img(alt="logo" src="~assets/forbidden-page-art.png" style="width: 170px;")

    q-chip(color="red-1").text-negative.q-mt-md.q-mb-lg 403

    div.text-h5.q-mb-sm
      | Access Restricted

    div.text-caption.text-grey
      | You don't have permission to access the restricted page.

    template(v-if="reason")
      q-card(flat style="min-width:400px; max-width:400px;").bg-grey-8.q-my-md
        q-card-section.text-red-2.text-center
          div.text-subtitle2
            | {{ reason }}

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
  name: 'ForbiddenPage',
  props: {
    reason: {
      type: String,
    },
  },
  setup (props) {
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
