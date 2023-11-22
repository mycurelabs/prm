<template lang="pug">
// set credit amount
q-dialog(v-model="creditsDialog" persistent)
  credit-purchase-dialog(
    @close="creditsDialog = false"
    @purchase="processPurchase"
  )

q-dialog(v-model="useTemplateDialog" persistent)
  q-card(style="width: 500px;")
    q-card-section.column.q-pb-none
      div.row.q-mb-md
        div.column
          span.text-h6 Use Message Template
          span.text-caption.text-grey-6 Select a message template to use
        q-space
        div
          q-btn(dense flat round icon="mdi-close" @click="onCloseTemplateDialog")
      q-input(
        outlined
        dense
        hide-bottom-space
        placeholder="Search template"
      )
        template(#prepend)
          q-icon(name="mdi-magnify")
    q-card-section(style="max-height: 500px;").q-px-none.scroll
      template(v-if="templatesLoading")
        q-list
          template(v-for="ind of 3")
            q-item
              q-item-section
                q-skeleton(height="20px")

      template(v-else-if="templates.length")
        q-list
          template(v-for="template of templates")
            q-item(clickable @click="onUseTemplate(template)")
              q-item-section
                q-item-label {{ template.label }}

      template(v-else)
        div.fit.column.items-center.q-pb-xl
          div.text-h6 No templates found
          div.text-subtitle2 You can create a new template
          router-link(:to="{name:'settings-templates'}") here

q-card(flat)
  q-form(@submit="onSend" @reset="onReset")
    q-card-section.q-pb-xs
      template(v-if="type.key === 'email'")
        q-input(
          dense
          outlined
          hide-bottom-space
          lazy-rules
          label="Subject"
          placeholder="Email subject here"
          v-model="subject"
          :rules="subjectRules"
        ).q-mb-sm
          template(#prepend)
            q-icon(name="mdi-email-outline")
      q-editor(
        v-model="body"
        min-height="10rem"
        max-height="20rem"
      )

    q-card-actions(align="right").row.q-gutter-sm.q-px-md
      q-select(
        dense
        outlined
        hide-bottom-space
        items-aligned
        v-model="type"
        :options="types"
      )
        template(#selected-item="props")
          q-avatar(size="xs").xs
            q-icon(:name="props.opt.icon" size="xs")
          q-chip(dense).transparent.gt-xs
            q-avatar
              q-icon(:name="props.opt.icon" size="xs")
            span {{ props.opt.label }}
      q-btn(
        unelevated
        no-caps
        color="primary"
        @click="openCreditsDialog"
      )
        div.row.q-px-xs.items-center.q-gutter-xs
          q-avatar(rounded size="mg" :style="{ width: '25px', height: '25px' }").bg-white
            q-img(src="../assets/logo.png" :style="{ width: '25px', height: '25px' }")
          span {{ creditsCount || 'NaN' }} credits left
      q-btn(
        unelevated
        no-caps
        icon="mdi-bookmark"
        color="warning"
        @click="onOpenTemplateDialog"
      )
        q-tooltip Use template
        span.q-mr-sm.gt-xs
          | Use template
      q-space
      q-btn(
        unelevated
        no-caps
        type="submit"
        :icon-right="type.icon"
        color="primary"
      )
        q-tooltip Send {{ type.label }}
        span.q-mr-sm.gt-xs
          | Send {{ type.label }}
</template>

<script>
import CreditPurchaseDialog from 'components/CreditPurchaseDialog.vue';
import { useQuasar } from 'quasar';
import { ref, toRef, computed, watch } from 'vue';
import { MESSAGE_TYPES } from 'boot/conversations';
import { fetchProvider } from 'boot/providers';

export default {
  name: 'ConversationInputForm',
  components: {
    CreditPurchaseDialog,
  },
  props: {
    types: {
      type: Array,
      default: () => MESSAGE_TYPES,
    },
    conversation: {
      type: [String, Object],
      required: true,
    },
    templates: {
      type: Array,
      default: () => [],
    },
    templatesLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'update:type',
    'search-templates',
    'send',
  ],
  setup (props, ctx) {
    const $q = useQuasar();
    const types = toRef(props, 'types');
    const conversation = toRef(props, 'conversation');
    const dataset = ref(null);
    const creditsDialog = ref(false);
    const creditsCount = ref(0);

    const type = ref(null);
    watch(types, (types) => {
      type.value = types[0];
      const keyType = type.value?.key;
      dataset.value = fetchProvider(keyType)
    }, { immediate: true });
    watch(type, (type) => {
      creditsCount.value = dataset.value?.provider?.creditsCount;
      ctx.emit('update:type', type)
    }, { immediate: true });
    watch(dataset, (data) => {
      creditsCount.value = dataset.value?.provider?.creditsCount;
    }, { immediate: true })

    const subject = ref(null);
    const subjectRules = computed(() => [
      type.value === 'email' && (v => !!v || 'Subject is required'),
    ].filter(Boolean));

    const template = ref(null);
    const body = ref('');
    const bodyRules = [
      v => !!v || 'Message body is required',
    ];

    const onReset = () => {
      type.value = types.value[0];
      subject.value = null;
      template.value = null;
      body.value = '';
    };
    const onSend = () => {
      ctx.emit('send', {
        type: type.value,
        subject: subject.value,
        template: template.value,
        body: body.value,
        conversation: conversation.value,
      });
      onReset();
    };

    const useTemplateDialog = ref(false);
    const onOpenTemplateDialog = () => {
      useTemplateDialog.value = true;
    };
    const onCloseTemplateDialog = () => {
      useTemplateDialog.value = false;
    };
    const onUseTemplate = (item) => {
      onCloseTemplateDialog();
      if (!item?.body) {
        $q.notify({
          message: 'Invalid template. Empty body',
          color: 'warning',
        });
        return;
      }
      subject.value = item.subject;
      template.value = item.id;
      body.value = item.body;
    };

    const openCreditsDialog = () => {
      creditsDialog.value = true;
    }
    const processPurchase = (creditsForPurchase) => {
      const topupProvider = dataset.value.topupProvider;
      topupProvider('email', creditsForPurchase.value);
    }

    return {
      type,
      subject,
      subjectRules,
      template,
      body,
      bodyRules,
      creditsDialog,
      creditsCount,

      onReset,
      onSend,
      useTemplateDialog,
      onOpenTemplateDialog,
      onCloseTemplateDialog,
      onUseTemplate,
      openCreditsDialog,
      processPurchase
    };
  },
};
</script>
