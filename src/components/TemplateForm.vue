<template lang="pug">
q-card(style="width:700px;")
  q-card-section.row
    div.column
      span.text-h6 Add Message Template
      span.text-caption.text-grey-6 Add a message template
    q-space
    template(v-if="dialog")
      div
        q-btn(dense flat round icon="mdi-close" @click="onCancel")
  q-form(@submit="onSave" @reset="onReset")
    q-card-section
      q-input(
        dense
        outlined
        hide-bottom-space
        lazy-rules
        v-model="label"
        label="Label"
        placeholder="My custom template"
        :rules="labelRules"
      ).q-mb-sm
      q-input(
        dense
        outlined
        hide-bottom-space
        lazy-rules
        v-model="subject"
        label="Subject"
        placeholder="Subject for email templates"
        :rules="subjectRules"
      ).q-mb-sm
      q-editor(
        v-model="body"
        min-height="10rem"
        max-height="20rem"
        placeholder="Insert template body here"
      )

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
import { ref } from 'vue';
import { useQuasar } from 'quasar';

export default {
  name: 'TemplateForm',
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'cancel',
    'save',
  ],
  setup (_, ctx) {
    const $q = useQuasar();

    // data
    const label = ref('');
    const labelRules = [
      v => !!v || 'Label is required',
    ];
    const subject = ref('');
    const subjectRules = [
    ];
    const body = ref('');
    const bodyRules = [
      v => !!v || 'Template body is required',
    ];

    // actions
    const onReset = () => {
      label.value = '';
      subject.value = '';
      body.value = '';
    };
    const onCancel = () => {
      ctx.emit('cancel');
      onReset();
    };
    const onSave = () => {
      const getTemplateIssue = (val) => {
        for (const fn of bodyRules) {
          const res = fn(val);
          if (typeof res === 'string') return res;
        }
      };
      const bodyIssue = getTemplateIssue(body.value?.trim());
      if (bodyIssue) {
        $q.notify({
          message: bodyIssue,
          color: 'warning',
        });
        return;
      }

      ctx.emit('save', {
        label: label.value,
        subject: subject.value,
        body: body.value,
      });
    };

    return {
      label,
      labelRules,
      subject,
      subjectRules,
      body,
      bodyRules,
      onReset,
      onCancel,
      onSave,
    };
  },
};
</script>
