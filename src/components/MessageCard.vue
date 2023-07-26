<template lang="pug">
q-card(flat bordered :class="qCardClass")
  q-card-section.row.items-center.q-pb-none
    q-icon(:name="type.icon").q-mr-sm
    div.caption Sent from {{ type.label }}
    q-space
    div.subtitle2 {{ date }}
      q-tooltip {{ dateLong }}

  q-card-section(style="min-height: 100px;")
    template(v-if="type.key === 'email'")
      div.q-mb-md
        strong Subject
        | :
        span.q-ml-sm {{ subject }}
    div(v-html="text").text-body1.text-grey-7
</template>

<script>
import { toRef, computed } from 'vue';
import { MESSAGE_TYPES_MAP } from 'boot/conversations';
import { formatDate } from 'boot/helpers';

export default {
  name: 'MessageCard',
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  setup (props) {
    const msg = toRef(props, 'message');
    const type = computed(() => MESSAGE_TYPES_MAP[msg.value.messageType || 'chat']);
    const subject = computed(() => (type.value.key === 'email' && msg.value.subject) || '');
    const text = computed(() => msg.value?.body || '');
    const date = computed(() => formatDate(msg.value.createdAt));
    const dateLong = computed(() => formatDate(msg.value.createdAt, 'MMMM dd, yyyy hh:mm:ss a'));
    const avatars = computed(() => {
      const avatars = [];
      return avatars;
    });
    const qCardClass = computed(() => {
      const classes = {};
      classes[`text-${type.value.color}`] = 1;
      classes[`bg-${type.value.backgroundColor}`] = 1;
      return classes;
    });

    return {
      type,
      subject,
      text,
      date,
      dateLong,
      avatars,
      qCardClass,
    };
  },
};
</script>
