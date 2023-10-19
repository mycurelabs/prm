<template lang="pug">
q-card(style="width:400px;")
  q-card-section.row
    div.column
      span.text-h6 Add provider
      span.text-caption.text-grey-6 Add a provider for your Email
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
        placeholder="My custom Email provider"
        :rules="labelRules"
      ).q-mb-sm
      q-input(
        dense
        outlined
        hide-bottom-space
        v-model="defaultFrom"
        label="Default from email"
        lazy-rules
        :rules="defaultFromRules"
      ).q-mb-sm
      q-input(
        dense
        outlined
        hide-bottom-space
        v-model="defaultReplyTo"
        label="Default replyTo email"
        lazy-rules
        :rules="defaultReplyToRules"
      )

    template(v-if="backend==='sendgrid'")
      q-separator
      q-card-section
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
  name: 'EmailProviderForm',
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
    isEditing: {
      type: Boolean,
      default: false
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

    const defaultFrom = ref('');
    const defaultFromRules = [
      v => !!v || 'Default from is required',
      v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    ];

    const defaultReplyTo = ref('');
    const defaultReplyToRules = [
      v => !!v || 'Default replyTo is required',
      v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    ];

    const backendOptions = [
      'sendgrid',
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
        case 'sendgrid': {
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
        emailConfig: {
          defaultFrom: defaultFrom.value,
          defaultReplyTo: defaultReplyTo.value,
        },
        backend: backend.value,
        backendConfig: backendConfig.value,
      });
    };

    return {
      label,
      labelRules,
      defaultFrom,
      defaultFromRules,
      defaultReplyTo,
      defaultReplyToRules,
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
