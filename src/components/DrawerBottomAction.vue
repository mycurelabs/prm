<template lang="pug">
q-btn(dense icon="mdi-plus" color="primary")
  q-menu(auto-close fit self="center right" style="width: 300px; max-width:300px;")
    q-list(separator)
      template(v-for="(target,ind) of targetTypes" :key="ind")
        q-item(clickable @click="onStartConversation(target)")
          q-item-section(top avatar)
            q-icon(:name="target.icon")
          q-item-section
            q-item-label Start {{ target.label }} conversation
            q-item-label(caption lines="2") {{ target.description }}
</template>

<script>
import { TARGET_TYPES } from 'boot/conversations';
import { useRouter } from 'vue-router';

export default {
  name: 'DrawerBottomAction',
  setup () {
    const router = useRouter();

    const targetTypes = TARGET_TYPES;
    const onStartConversation = (target) => {
      router.push({ name: 'inbox-new', query: { type: target.key } });
    };

    return {
      targetTypes,
      onStartConversation,
    };
  },
};
</script>
