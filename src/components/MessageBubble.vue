<template lang="pug">
q-chat-message(
  :text-color="textColor"
  :bg-color="bgColor"
  :sent="isSent"
  :name="creatorName"
)
  template(#avatar)
    q-avatar.q-message-avatar.q-message-avatar--sent.gt-xs
      q-img(:src="avatar")
  template(#stamp)
    div(style="width: 100%; min-width: 300px;").column
      div.row.items-center.q-mt-lg
        q-icon(:name="type.icon").q-mr-sm
        span Sent from {{ type.label }}
          span.caption.q-ml-xs ({{ recipientsSent }}/{{ recipientsTotal }})
        q-space
        span {{ timeAgo }}
          q-tooltip {{ date }}
      template(v-if="lastErrorMessage")
        div.row.text-negative
          q-icon(name="mdi-alert-circle-outline").q-mr-sm
          | Last error: {{ lastErrorMessage }}
  div.column
    template(v-if="type.key === 'email'")
      span.q-mb-lg
        strong Subject
        | :
        span.q-ml-sm {{ subject }}
    div(v-html="text")
</template>

<script>
import placeholderAvatar from 'assets/placeholder-person.png';
import { toRef, computed } from 'vue';
import { MESSAGE_TYPES_MAP } from 'boot/conversations';
import { formatDate, formatTimeAgo, formatPersonName } from 'boot/helpers';
import { useCurrentUser } from 'boot/auth';

export default {
  name: 'MessageBubble',
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  setup (props) {
    const msg = toRef(props, 'message');
    const type = computed(() => MESSAGE_TYPES_MAP[msg.value.type || 'chat']);
    const subject = computed(() => (type.value.key === 'email' && msg.value.subject) || '');
    const conversation = computed(() => msg.value?.conversation || '');
    const text = computed(() => msg.value?.body || '');
    const timeAgo = computed(() => formatTimeAgo(msg.value.createdAt));
    const date = computed(() => formatDate(msg.value.createdAt, 'MMMM dd, yyyy hh:mm:ss a'));
    const recipientsTotal = computed(() => msg.value?.recipientsTotal || 0);
    const recipientsSent = computed(() => msg.value?.recipientsSent || 0);
    const recipientsUnsent = computed(() => Math.max(0, recipientsTotal.value - recipientsSent.value));
    const lastErrorMessage = computed(() => recipientsUnsent.value ? '' : msg.value?.statusReasons?.[0]?.message || '');
    const avatar = computed(() => msg.value?.createdBy?.picURL || placeholderAvatar);
    const creatorName = computed(() => formatPersonName(msg.value?.createdBy?.name));
    const currentUser = useCurrentUser();
    const isSent = computed(() => currentUser.value.uid === msg.value?.createdBy?.id);
    const textColor = computed(() => isSent.value ? 'black' : 'white');
    const bgColor = computed(() => isSent.value ? 'grey-4' : 'primary');

    return {
      type,
      subject,
      conversation,
      text,
      date,
      timeAgo,
      creatorName,
      recipientsTotal,
      recipientsSent,
      lastErrorMessage,
      avatar,
      isSent,
      textColor,
      bgColor,
    };
  },
};
</script>
