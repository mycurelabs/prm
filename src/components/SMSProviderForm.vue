<template lang="pug">
q-card(style="width:400px;")
  q-card-section.row
    div.column
      span.text-h6 Add provider
      span.text-caption.text-grey-6 Add a provider for your SMS
    q-space
    template(v-if="dialog")
      div
        q-btn(dense flat round icon="mdi-close" @click="onCancel")
  q-form(@submit="onSave" @reset="onReset")
    q-card-section
      q-select(
        dense
        outlined
        hide-bottom-space
        lazy-rules
        label="Provider"
        v-model="backend"
        :rules="backendRules"
        :options="backendOptions"
      ).q-mb-sm
      q-input(
        dense
        outlined
        hide-bottom-space
        lazy-rules
        v-model="label"
        label="Label"
        placeholder="My custom SMS provider"
        :rules="labelRules"
      )

    template(v-if="backend==='twilio'")
      q-separator
      q-card-section
        q-input(
          dense
          outlined
          hide-bottom-space
          lazy-rules
          v-model="backendConfig.accountsSid"
          label="Account Sid"
          :rules="backendConfigRules.accountsSid"
        ).q-mb-sm
        q-input(
          dense
          outlined
          hide-bottom-space
          lazy-rules
          v-model="backendConfig.authToken"
          label="Auth token"
          :rules="backendConfigRules.authToken"
        ).q-mb-sm
        q-input(
          dense
          outlined
          hide-bottom-space
          lazy-rules
          v-model="backendConfig.senderNo"
          label="Sender no"
          :rules="backendConfigRules.senderNo"
        ).q-mb-sm

    template(v-if="backend==='globelabs'")
      q-separator
      q-card-section
        q-input(
          dense
          outlined
          hide-bottom-space
          lazy-rules
          v-model="backendConfig.shortcode"
          label="Shortcode"
          :rules="backendConfigRules.shortcode"
        ).q-mb-sm
        q-input(
          dense
          outlined
          hide-bottom-space
          lazy-rules
          v-model="backendConfig.appkey"
          label="App key"
          :rules="backendConfigRules.appkey"
        ).q-mb-sm
        q-input(
          dense
          outlined
          hide-bottom-space
          lazy-rules
          v-model="backendConfig.secretKey"
          label="Secret key"
          :rules="backendConfigRules.secretKey"
        ).q-mb-sm

    q-card-actions(align="right").bg-grey-2
      q-btn(
        outline
        no-caps
        color="primary"
        label="Cancel"
        @click="onCancel"
      )
      q-btn(
        style="width:70px;"
        unelevated
        no-caps
        type="submit"
        label="Save"
        color="primary"
      )
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'SMSProviderForm',
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'cancel',
    'save',
  ],
  setup (_, ctx) {
    const label = ref('');
    const labelRules = [
      v => !!v || 'Label is required',
    ];

    const backendOptions = [
      'twilio',
      'globelabs',
    ];
    const backend = ref('');
    const backendRules = [
      v => !!v || 'Backend is required',
      v => backendOptions.includes(v) || `Backend must be one of ${backendOptions.join(', ')}`,
    ];
    watch(backend, val => {
      if (label.value) return;
      label.value = `Custom ${val} provider`;
    });

    const backendConfig = ref({});
    const backendConfigRules = computed(() => {
      const rules = {};
      switch (backend.value) {
        case 'twilio': {
          rules.accountsSid = [
            v => !!v || 'Accounts SID is required',
          ];
          rules.authToken = [
            v => !!v || 'Auth token is required',
          ];
          rules.senderNo = [
            v => !!v || 'Sender no is required',
          ];
          break;
        }
        case 'globelabs': {
          rules.shortcode = [
            v => !!v || 'Shortcode is required',
          ];
          rules.appkey = [
            v => !!v || 'App key is required',
          ];
          rules.secretKey = [
            v => !!v || 'Secret key is required',
          ];
          break;
        }
      }
      return rules;
    });

    watch(backend, () => {
      backendConfig.value = {};
    });
    const onReset = () => {
      label.value = '';
      backend.value = '';
      backendConfig.value = {};
    };
    const onCancel = () => {
      ctx.emit('cancel');
      onReset();
    };
    const onSave = () => {
      ctx.emit('save', {
        type: 'sms',
        label: label.value,
        backend: backend.value,
        backendConfig: backendConfig.value,
      });
    };

    return {
      label,
      labelRules,
      backendOptions,
      backend,
      backendRules,
      backendConfig,
      backendConfigRules,
      onReset,
      onCancel,
      onSave,
    };
  },
};
</script>
