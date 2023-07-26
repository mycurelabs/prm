<template lang="pug">
template(v-if="targetType")
  q-header(bordered).bg-white.text-black
    q-toolbar
      q-select(
        v-model="target"
        dense
        borderless
        hide-bottom-space
        hide-dropdown-icon
        input-debounce="300"
        :options="targetOptions"
        @filter="onTargetSearch"
        style="width: 500px;"
        use-input
      )
        template(#before)
          div.text-h6.text-black.q-mr-sm To:

        template(#no-option)
          q-item
            q-item-section.text-grey
              | No targets found

        template(#option="props")
          q-item(clickable @click="props.toggleOption(props.opt)")
            q-item-section(avatar)
              q-avatar(size="md")
                img(:src="props.opt.avatar")
            q-item-section
              q-item-label {{ props.opt.fullname }}

        template(#selected-item="props")
          q-chip.transparent
            q-avatar(size="md")
              img(:src="props.opt.avatar")
            | {{ props.opt.fullname }}

q-page-container
  // target selected
  template(v-if="target")
    q-page.fit.flex.flex-center
      div.column.items-center
        img(alt="logo" src="~assets/no-conversations-art.png" style="width: 170px;")

        div.text-subtitle1.q-mb-sm.text-grey
          | This is the beginning of the conversation

  // select target type
  template(v-else-if="!targetType")
    q-page.fit.flex.flex-center
      div.column.items-center
        div.text-h6
          | Choose a conversation target type

        div.text-caption.text-grey
          | Select whether to start conversation with a group or an individual

        div.row.q-col-gutter-sm.q-mt-md
          template(v-for="(target,ind) of targetTypes" :key="ind")
            div.col-xs-12.col-sm-6
              q-card(@click="setTargetType(target)" flat bordered style="height: 150px;").cursor-pointer
                q-card-section.column.items-center.text-center
                  q-avatar
                    q-icon(size="xl" :name="target.icon")
                  div.text-h6 {{ target.label }}
                  div.text-caption.text-grey {{ target.description }}

  // select target
  template(v-else)
    q-page.fit.flex.flex-center
      div(style="width:300px;").column.items-center.text-center
        q-avatar
          q-icon(size="xl" :name="targetType.icon")

        div.text-h6
          | Choose {{ targetType.label }} target

        div.text-caption.text-grey
          | Select {{ targetType.label }} target to start conversation with using the input above

template(v-if="target")
  q-footer.bg-white.text-black
    conversation-input-form(
      :templates="templates"
      :templatesLoading="templatesLoading"
      :conversation="conversation"
      @search-templates="onSearchTemplates"
      @send="onSend"
    )
</template>

<script>
import placeholderAvatar from 'assets/placeholder-person.png';
import ConversationInputForm from 'components/ConversationInputForm.vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { ref, toRef, watch, computed } from 'vue';
import { TARGET_TYPES, useConversationInputForm, fetchTargets } from 'boot/conversations';
import { toQuasarSelectFilterFn, formatPersonName } from 'boot/helpers';

export default {
  name: 'ConversationNewPage',
  components: {
    ConversationInputForm,
  },
  props: {
    type: {
      type: String,
      default: undefined,
      validate: val => TARGET_TYPES.find(t => t.key === val),
    },
    subject: {
      type: String,
      default: undefined,
    },
  },
  setup (props) {
    const $q = useQuasar();

    // target type
    const targetTypes = TARGET_TYPES;
    const targetType = ref('');
    watch(toRef(props, 'type'), val => {
      if (!val) return;
      targetType.value = TARGET_TYPES.find(t => t.key === val);
    }, { immediate: true });

    const setTargetType = (target) => {
      targetType.value = target;
    };

    // conversation target/s
    const target = ref(null);
    const targets = fetchTargets(targetType, { fetchImmediate: true });
    const targetOptions = computed(() => targets.items.value.map(item => ({
      ...item,
      avatar: item.picURL || placeholderAvatar,
      fullname: item.isGroup ? item.name : formatPersonName(item.name),
    })));
    const onTargetSearch = toQuasarSelectFilterFn(targets);
    watch(toRef(props, 'subject'), val => {
      if (!val) return;
      if (target.value?.id === val) return;
      targets.populateTarget(val)
        .then(found => {
          if (!found) return;
          found.avatar = found.picURL || placeholderAvatar;
          found.fullname = formatPersonName(found.name);
          target.value = found;
        })
        .catch(error => {
          console.error(error);
          $q.notify({
            message: 'Failed to load subject ' + error.message,
            color: 'warning',
          });
        });
    }, { immediate: true });

    // input
    const {
      templates,
      templatesLoading,
      onSearchTemplates,
      onSend,
    } = useConversationInputForm();

    const router = useRouter();
    const onSendClick = async (data) => {
      const sent = await onSend(data);
      router.replace({ name: 'inbox-conversation', params: { id: sent.conversation } });
    };

    const conversation = computed(() => ({
      subject: target.value?.id,
      subjectType: targetType.value.key,
    }));

    return {
      targetTypes,
      targetType,
      setTargetType,
      target,
      targetOptions,
      onTargetSearch,

      templates,
      templatesLoading,
      onSearchTemplates,
      onSend: onSendClick,
      conversation,
    };
  },
};
</script>
