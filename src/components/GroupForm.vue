<template lang="pug">
q-card(style="width:700px;")
  q-card-section.row
    div.column
      span.text-h6 Add Group
      span.text-caption.text-grey-6 Add a group
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
        v-model="name"
        label="Name"
        placeholder="My custom group"
        :rules="nameRules"
      ).q-mb-sm
      q-input(
        type="textarea"
        dense
        outlined
        hide-bottom-space
        lazy-rules
        v-model="description"
        label="Description"
        placeholder="Description here"
        :rules="descriptionRules"
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
import { ref } from 'vue';

export default {
  name: 'GroupForm',
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
    // data
    const name = ref('');
    const nameRules = [
      v => !!v || 'Name is required',
    ];
    const description = ref('');
    const descriptionRules = [
    ];

    // actions
    const onReset = () => {
      name.value = '';
      description.value = '';
    };
    const onCancel = () => {
      ctx.emit('cancel');
      onReset();
    };
    const onSave = () => {
      ctx.emit('save', {
        name: name.value,
        description: description.value,
      });
    };

    return {
      name,
      nameRules,
      description,
      descriptionRules,
      onReset,
      onCancel,
      onSave,
    };
  },
};
</script>
