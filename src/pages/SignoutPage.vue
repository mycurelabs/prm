<template lang="pug">
q-page.fit.flex.flex-center
  div.column.items-center
    img(alt="logo" src="~assets/logo.png" style="width: 70px;")

    div.text-h5.q-mb-sm
      | Logging out

    div.text-caption.text-grey
      | Please wait while we securely log you out.

    template(v-if="linkSupportPage")
      div.text-caption.text-grey.q-mt-lg
        | Having trouble logging out?
        a(:href="linkSupportPage" target="_blank").text-primary.q-ml-xs Click here to contact us.
</template>

<script>
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuth } from 'boot/auth.js';
import { useAppConstants } from 'boot/app.js';

export default {
  name: 'SignoutPage',
  setup () {
    const $q = useQuasar();
    const router = useRouter();
    const { signout } = useAuth();

    const onSignout = async () => {
      // perform cleanup
      await signout().catch(error => $q.notify({
        type: 'negative',
        message: 'Failed to sign out',
        caption: error.message,
      }));

      // redirect to)v home
      router.replace({ name: 'app' });
    };

    onSignout();

    const { linkSupportPage } = useAppConstants();

    return {
      linkSupportPage,
    };
  },
};
</script>
