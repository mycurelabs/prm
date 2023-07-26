<template lang="pug">
// header/target info
q-header(ref="headerRef" bordered).bg-white.text-black
  template(v-if="loading")
    q-toolbar
      div.row.items-center.q-gutter-sm
        q-skeleton(type="QAvatar" size="38px")
        q-skeleton(height="25px" width="180px")

  template(v-else)
    q-toolbar
      q-chip.transparent
        q-avatar(size="md")
          img(:src="item.subjectAvatar")
        | {{ item.subjectFullname }}
      q-space
      filter-menu(
        v-model="messagesFilter"
        :options="messagesFilteropts"
        hide-label
        default-first
      )
      q-btn(
        icon="mdi-dots-horizontal"
        no-caps
        unelevated
        outline
        text-color="grey-6"
        @click="onToggleInfoDrawer"
      ).q-ml-sm

// conversation info
q-drawer(v-model="infoDrawer" side="right" bordered)
  q-scroll-area(style="height: calc(100% - 50px); margin-top: 50px;")
    q-list(padding separator)
      q-item
        q-item-section.text-body1 Members
        q-space
        div.row.items-center
          q-btn(
            icon="mdi-chevron-left"
            flat
            dense
            round
            @click="membersPrev"
            :disabled="!membersPagination.hasPrev"
          )
            q-tooltip Previous members
          span.q-mx-sm Page {{ membersPagination.page }}
            q-tooltip Page {{ membersPagination.page }}
          q-btn(
            icon="mdi-chevron-right"
            flat
            dense
            round
            @click="membersNext"
            :disabled="!membersPagination.hasNext"
          )
            q-tooltip Next members
      template(v-if="membersLoading")
        template(v-for="ind of 3")
          q-item
            q-item-section(avatar)
              q-skeleton(type="QAvatar" size="30px")
            q-item-section
              q-skeleton(width="150px" height="15px")
      template(v-else)
        template(v-for="(member,ind) of members")
          q-item(clickable)
            q-item-section(top avatar)
              q-avatar(size="md")
                img(:src="member.avatar" style="max-width: 38px; max-height: 38px;")
            q-item-section
              q-item-label {{ member.fullname }}
            template(v-if="member.isCurrentUser")
              q-item-section(side top)
                q-chip.text-primary.bg-blue-1 You
            template(v-else)
              q-item-section(side top)
                q-icon(name="mdi-open-in-new" @click="onMemberClick(member)")
  div.column.absolute-top
    q-toolbar
      q-toolbar-title Details
      q-space
      q-btn(
        icon="mdi-close"
        flat
        round
        dense
        @click="onToggleInfoDrawer"
      ).text-grey-7
    q-separator.q-mb-sm

// messages
q-page-container
  q-page
    div
      q-scroll-area(ref="scrollArea" @scroll="onScrollChanged" :style="scrollStyle").column.q-px-md
        template(v-if="messagesLoading")
          div.row.justify-center.q-my-md
            q-spinner-dots(color="primary" size="40px")
        template(v-else-if="messagesHasNext")
          div.row.justify-center.q-my-md
            q-btn(flat color="primary" no-caps @click="messagesNext") Load more
        template(v-else)
          div.row.justify-center.q-my-md

        div.column.reverse
          template(v-for="(msg,ind) of messages" :key="ind")
            message-bubble(
              :message="msg"
            ).cursor-pointer

    q-page-sticky(v-if="showScrollFab" position="bottom-right" :offset="[18,15]").z-top
      q-btn(
        fab
        no-caps
        dense
        padding="xs"
        icon="mdi-chevron-down"
        color="primary"
        @click="onScrollToBottom"
      )

// message input
q-footer(ref="footerRef").bg-white.text-black
  conversation-input-form(
    :templates="templates"
    :templatesLoading="templatesLoading"
    :conversation="id"
    @update:type="onConversationTypeChange"
    @search-templates="onSearchTemplates"
    @send="onSend"
  )
</template>

<script>
import FilterMenu from 'components/FilterMenu.vue';
import MessageBubble from 'components/MessageBubble.vue';
import ConversationInputForm from 'components/ConversationInputForm.vue';
import placeholderAvatar from 'assets/placeholder-person.png';
import { dom } from 'quasar';
import { useCurrentUser } from 'boot/auth';
import { ref, toRef, computed, watch, nextTick, onMounted } from 'vue';
import { fetchConversation, useConversationInputForm } from 'boot/conversations';
import { formatPersonName } from 'boot/helpers';
import { useRouter } from 'vue-router';

export default {
  name: 'ConversationPage',
  components: {
    FilterMenu,
    MessageBubble,
    ConversationInputForm,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup (props) {
    const convid = toRef(props, 'id');
    const data = fetchConversation(convid, {
      messages: { append: true, fetchImmediate: true },
      members: { fetchImmediate: true },
    });
    const item = computed(() => {
      if (!data.item.value) return data.item.value;
      const item = data.item.value;
      return {
        ...item,
        subjectAvatar: item.subject.picURL || placeholderAvatar,
        subjectFullname: item.subjectType === 'group' ? `${item.subject.name} (group)` : formatPersonName(item.subject.name),
      };
    });
    const headerRef = ref(null);
    const footerRef = ref(null);
    const scrollArea = ref(null);
    const scrollStyle = ref({});
    const computeScrollStyle = () => {
      const headerHeight = !headerRef.value ? '0px' : dom.style(headerRef.value.$el, 'height');
      const footerHeight = !footerRef.value ? '0px' : dom.style(footerRef.value.$el, 'height');
      const obj = {
        height: `calc(100vh - ${headerHeight} - ${footerHeight})`,
        width: '100%',
      };
      scrollStyle.value = obj;
    };
    watch([headerRef, footerRef], computeScrollStyle);

    const showScrollFab = ref(false);
    const onScrollChanged = (scroll) => {
      showScrollFab.value = scroll.verticalContainerSize < scroll.verticalSize;
    };
    const onScrollToBottom = () => {
      if (!scrollArea.value) return;
      scrollArea.value.setScrollPercentage('vertical', 100, 300);
    };
    onMounted(onScrollToBottom);

    const {
      templates,
      templatesLoading,
      onSearchTemplates,
      onSend,
    } = useConversationInputForm(data.messages);
    const onConversationTypeChange = async (type) => {
      await nextTick();
      computeScrollStyle();
    };
    const onSendClick = async (data) => {
      await onSend(data);
      onScrollToBottom();
    };

    const infoDrawer = ref(false);
    const onToggleInfoDrawer = () => {
      infoDrawer.value = !infoDrawer.value;
    };

    const currentUser = useCurrentUser();
    const router = useRouter();
    const members = computed(() => data.members.items.value.map(mem => ({
      ...mem,
      avatar: mem.picURL || placeholderAvatar,
      fullname: formatPersonName(mem.name),
      isCurrentUser: currentUser.value.uid === mem.id,
    })));
    const onMemberClick = member => {
      const route = router.resolve({ name: 'client-details', params: { id: member.id } });
      globalThis.open(route.href, '_blank');
    };

    return {
      headerRef,
      footerRef,
      scrollArea,
      scrollStyle,
      showScrollFab,
      onScrollChanged,
      onScrollToBottom,
      loading: data.loading,
      item,
      messagesLoading: data.messages.loading,
      messagesHasNext: data.messages.hasNext,
      messagesNext: data.messages.fetchNextItems,
      messagesFilteropts: data.messages.filteropts,
      messagesFilter: data.messages.filter,
      messages: data.messages.items,
      templates,
      templatesLoading,
      onSearchTemplates,
      onSend: onSendClick,
      onConversationTypeChange,
      infoDrawer,
      onToggleInfoDrawer,
      membersLoading: data.members.loading,
      membersPagination: data.members.pagination,
      membersNext: data.members.fetchNextItems,
      membersPrev: data.members.fetchPrevItems,
      members,
      onMemberClick,
    };
  },
};
</script>
