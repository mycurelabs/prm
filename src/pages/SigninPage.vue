<template lang="pug">
q-page.fit.flex.flex-center
  // input card
  div.column.items-center
    div.q-mb-md.text-center
      img(alt="logo" src="~assets/logo.png" style="width: 70px;")
      div.text-h5.text-weight-medium Log in to your account
      div.text-caption.text-grey Welcome back! Please enter your account details.

    // social signin
    template(v-if="socialSigninEnabled")
      div.row.justify-center.q-gutter-sm.q-mb-md
        q-btn(
          round
          unelevated
          outline
          icon="mdi-google"
        )
        q-btn(
          round
          unelevated
          outline
          icon="mdi-facebook"
        )

      p.text-grey or use your account

    // local signin
    q-card(style="min-width: 300px" flat).q-mb-md
      q-card-section
        q-form(@submit="onSignin")
          q-input(
            dense
            outlined
            hide-bottom-space
            v-model="email"
            label="Email"
            lazy-rules
            :rules="emailRules"
          ).q-mb-sm
          q-input(
            dense
            outlined
            hide-bottom-space
            v-model="password"
            label="Password"
            lazy-rules
            :rules="passwordRules"
            :type="passwordVisible ? 'text' : 'password'"
          )
            template(#append)
              q-icon(
                :name="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
                @click="passwordVisible = !passwordVisible"
              ).cursor-pointer

          q-btn(
            no-caps
            unelevated
            type="submit"
            label="Log in"
            color="primary"
            size="md"
          ).q-mt-sm.full-width

    // footer
    div.column
      div(style="max-width:300px;").text-center
        div.text-grey.text-caption
          | Only members are allowed here.
          | Note that you are currently signing in on the Server URL
          |
          span(style="text-decoration:underline;").text-blue.cursor-pointer {{ apiBaseUrl }}
            q-tooltip Change the Online URL
            q-popup-edit(
              :modelValue="apiBaseUrl"
              @save="onApiBaseUrlChange"
              title="Change the Online URL"
              buttons
              label-set="Save"
              label-cancel="Cancel"
              v-slot="scope"
            )
              q-form(@submit="scope.set")
                q-input(
                  style="min-width: 300px;"
                  outlined
                  v-model="scope.value"
                  :rules="apiBaseUrlRules"
                  lazy-rules
                  autofocus
                )
                  template(#append)
                    q-btn(
                      icon="mdi-close"
                      flat
                      round
                      dense
                      @click="scope.value = apiBaseUrls[0]"
                    )
                      q-tooltip Reset to default
</template>

<script>
import { useQuasar } from 'quasar';
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from 'boot/auth.js';
import { useSdk, useSdkConstants } from 'boot/sdk.js';

export default {
  name: 'SigninPage',
  props: {
    next: {
      type: [String, Object],
      default: () => ({
        name: 'app',
      }),
    },
  },
  setup (props) {
    // input fields
    const socialSigninEnabled = false;

    const email = ref('');
    const emailRules = [
      v => !!v || 'Email is required',
      v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    ];

    const password = ref('');
    const passwordVisible = ref(false);
    const passwordRules = [
      v => !!v > 0 || 'Password is required',
    ];

    // actions
    const $q = useQuasar();
    const router = useRouter();
    const { signin } = useAuth();
    const onSignin = async () => {
      $q.loading.show({
        message: 'Logging in...',
        boxClass: 'bg-grey-2 text-grey-9',
        spinnerColor: 'primary',
      });
      try {
        await signin({
          email: email.value,
          password: password.value,
        });
        await router.replace(props.next);
      } catch (error) {
        console.error(error);
        $q.notify({
          type: 'negative',
          message: error.message || 'Failed to signin',
        });
      } finally {
        $q.loading.hide();
      }
    };

    // cleanup
    const onReset = () => {
      email.value = '';
      password.value = '';
      passwordVisible.value = false;
    };
    onUnmounted(onReset);

    // base url change
    const { apiBaseUrls } = useSdkConstants();
    const sdk = useSdk();
    const apiBaseUrl = ref(sdk.apiBaseUrl);
    const apiBaseUrlRules = [
      v => !!v || 'Online URL is required',
    ];
    const onApiBaseUrlChange = async (url) => {
      try {
        // clean url
        if (!url.startsWith('http')) {
          url = 'http://' + url;
        }
        $q.loading.show({
          message: 'Changing your Online URL.<br/><span class="text-amber text-italic">Please wait...</span>',
          html: true,
          boxClass: 'bg-grey-2 text-grey-9',
          spinnerColor: 'primary',
        });
        await sdk.setBaseUrl(url);
        apiBaseUrl.value = sdk.apiBaseUrl;
      } catch (error) {
        console.error(error);
        $q.notify({
          type: 'negative',
          message: 'Failed to change Online URL',
          caption: error.message,
        });
      } finally {
        $q.loading.hide();
      }
    };

    return {
      socialSigninEnabled,
      email,
      emailRules,
      password,
      passwordVisible,
      passwordRules,
      onReset,
      onSignin,
      apiBaseUrl,
      apiBaseUrls,
      apiBaseUrlRules,
      onApiBaseUrlChange,
    };
  },
};
</script>
