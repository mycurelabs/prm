<template lang="pug">
q-btn(dense flat round)
  q-avatar
    img(:src="currentUserAvatar" style="width: 100%; max-width: 38px; max-height: 38px;")
  q-menu(auto-close fit self="center right")
    q-list(style="width: 300px;")
      q-item(clickable)
        q-item-section(top avatar)
          q-avatar
            img(:src="currentUserAvatar" style="width: 100%; max-width: 38px; max-height: 38px;")
        q-item-section
          q-item-label {{ currentUserName }}
          q-item-label(caption) {{ currentUser.email }}
      q-separator
      q-item(dense :inset-level="0" clickable @click="onSignout")
        q-item-section
          div.row
            q-icon(name="mdi-logout" size="xs").q-mr-sm
            | Log out
</template>

<script>
import placeholderAvatar from 'assets/placeholder-person.png';
import { computed } from 'vue';
import { useAuth } from 'boot/auth';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

export default {
  name: 'DrawerUserProfileBtn',
  setup () {
    const $q = useQuasar();
    const router = useRouter();
    const { currentUser } = useAuth();

    const currentUserAvatar = computed(() => currentUser.value.picURL || placeholderAvatar);
    const currentUserName = computed(() => [
      currentUser.value.name?.firstName,
      currentUser.value.name?.lastName,
    ].filter(Boolean).join(' '));

    // account options
    const onSignout = () => {
      const dialogOpts = {
        title: 'Log out',
        message: 'Confirm user log out?',
        cancel: true,
        persistent: true,
      };
      $q.dialog(dialogOpts).onOk(async () => {
        router.replace({ name: 'signout' });
      });
    };

    return {
      currentUser,
      currentUserAvatar,
      currentUserName,
      onSignout,
    };
  },
};
</script>
