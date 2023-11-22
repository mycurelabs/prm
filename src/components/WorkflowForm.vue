<template lang="pug">
q-card(style="width:700px;")
  q-card-section.row
    div.column.col-10
      span.text-h6 Add Workflow
      span.text-caption.text-grey-6 Our PRM allows you to create and manage custom automation sequences, streamlining patient care and administrative tasks.
    q-space
    template(v-if="dialog")
      div.column
        q-btn(dense flat round icon="mdi-close" @click="onCancel")
  q-form(@submit="onSave" @reset="onReset")
    q-card-section(style="max-height: 50vh").scroll
      div.q-mb-sm.row.q-col-gutter-sm
        div.col-6
          q-input(
            dense
            outlined
            hide-bottom-space
            lazy-rules
            v-model="label"
            label="Label"
            placeholder="My custom workflow"
            :rules="labelRules"
          )
        div.col-6
          q-select(
            dense
            outlined
            hide-bottom-space
            lazy-rules
            label="Message Type"
            v-model="messageType"
            :rules="messageTypeRules"
            :options="messageTypeOpts"
          )

      // trigger
      q-select(
        dense
        outlined
        hide-bottom-space
        items-aligned
        v-model="trigger"
        :options="triggerOpts"
        label="Trigger"
      ).q-mb-sm
        template(#selected-item="props")
          q-chip(dense).transparent.gt-xs
            span {{ props.opt.label }}
      // trigger details
      template(v-if="trigger")
        div.q-mb-sm.column
          template(v-if="trigger.subjectLabel")
            div.row.items-center
              span Receiver:
              q-chip(dense) {{ trigger.subjectLabel }}
          template(v-if="trigger.variables.length")
            div.row.items-center
              span Tags:
              template(v-for="variable in trigger.variables")
                q-chip(dense clickable @click="onVariableClick(variable)") {{ variable.tag }}
                  q-tooltip {{ variable.label }}

      // workflow message
      q-editor(
        v-model="body"
        min-height="10rem"
        max-height="20rem"
        placeholder="Insert workflow message here"
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
import { ref, toRef, computed } from 'vue';
import { useQuasar } from 'quasar';

export default {
  name: 'WorkflowForm',
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
    triggers: {
      type: Array,
      default: () => [],
    },
  },
  emits: [
    'cancel',
    'save',
  ],
  setup (props, ctx) {
    const $q = useQuasar();

    // data
    const label = ref('');
    const labelRules = [
      v => !!v || 'Label is required',
    ];
    const messageType = ref('');
    const messageTypeRules = [
      v => !!v || 'Message type is required',
    ];
    const messageTypeOpts = [
      'sms',
      'email',
    ];
    const trigger = ref('');
    const triggerRules = [
      v => !!v || 'Trigger is required',
    ];
    const triggers = toRef(props, 'triggers');
    const triggerOpts = computed(() => triggers.value.map((t) => ({
      ...t,
      subjectLabel: t.subjectLabel || '',
      variables: t.variables || [],
      label: t.name,
      value: t.id,
    })));
    const body = ref('');
    const bodyRules = [
      v => !!v || 'Workflow message body is required',
    ];

    // actions
    const onReset = () => {
      label.value = '';
      messageType.value = messageTypeOpts[0];
      trigger.value = null;
      body.value = '';
    };
    const onCancel = () => {
      ctx.emit('cancel');
      onReset();
    };
    const onSave = () => {
      const getWorkflowIssue = (val) => {
        for (const fn of bodyRules) {
          const res = fn(val);
          if (typeof res === 'string') return res;
        }
      };
      const bodyIssue = getWorkflowIssue(body.value?.trim());
      if (bodyIssue) {
        $q.notify({
          message: bodyIssue,
          color: 'warning',
        });
        return;
      }

      ctx.emit('save', {
        label: label.value,
        messageType: messageType.value,
        trigger: trigger.value,
        body: body.value,
      });
    };
    const onVariableClick = (variable) => {
      body.value += `{{${variable.tag}}}`;
    };

    return {
      label,
      labelRules,
      messageType,
      messageTypeRules,
      messageTypeOpts,
      trigger,
      triggerRules,
      triggerOpts,
      body,
      bodyRules,
      onReset,
      onCancel,
      onSave,
      onVariableClick,
    };
  },
};
</script>
