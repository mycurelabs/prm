<template lang="pug">
q-page-container
  q-page.fit.flex.flex-center
    div.column.items-center
      img(alt="logo" src="~assets/no-conversations-art.png" style="width: 170px;")

      div.text-h6.q-mb-sm
        | Select a conversation to view

      div.text-caption.text-grey
        | Or start a new one

      div.column.q-mt-lg
        q-btn(
          no-wrap
          color="primary"
          unelevated
          label="Create new conversation"
          no-caps
          @click="onCreateBtnClick"
        )
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'InboxOverviewPage',
  setup () {
    const router = useRouter();

    const onCreateBtnClick = () => {
      router.push({ name: 'inbox-new' });
    };

    return {
      onCreateBtnClick,
    };
  },
};
</script>
