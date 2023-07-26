<template lang="pug">
q-page
  q-layout(view="lHr Lpr lFr" style="height: 100vh" container)
    // list
    q-drawer(show-if-above persistent bordered)
      q-scroll-area(style="height: calc(100% - 115px); margin-top: 115px;")
        q-list(padding separator)
          template(v-for="(conv,ind) of items")
            q-item(clickable @click="onItemClick(conv)")
              q-item-section(top avatar)
                q-avatar
                  img(:src="conv.subjectAvatar" style="max-width: 38px; max-height: 38px;")
              q-item-section
                q-item-label {{ conv.subjectFullname }}
                q-item-label(caption).ellipsis-2-lines {{ conv.message }}
              q-item-section(side bottom)
                q-item-label(caption) {{ conv.messageTimeAgo }}
                  q-tooltip {{ conv.messageDate }}
      div.column.absolute-top
        q-toolbar
          q-toolbar-title Inbox
        q-separator.q-mb-sm
        q-toolbar.row.items-center
          filter-menu(
            v-model="filter"
            :options="filteropts"
            hide-label
            default-first
          )
          q-space
          sorting-menu(
            v-model="sorting"
            :options="sortingopts"
            hide-label
            :btn-props="{outline:false, dense: true}"
          )

    // content
    router-view
</template>

<script>
import SortingMenu from 'components/SortingMenu.vue';
import FilterMenu from 'components/FilterMenu.vue';
import placeholderAvatar from 'assets/placeholder-person.png';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { fetchConversations } from 'boot/conversations';
import { formatDate, formatTimeAgo, formatPersonName } from 'boot/helpers';

export default {
  name: 'InboxPage',
  components: {
    SortingMenu,
    FilterMenu,
  },
  setup () {
    const dataset = fetchConversations({ fetchImmediate: true });
    const items = computed(() => dataset.items.value.map(item => ({
      ...item,
      message: item.lastMessage?.body,
      messageDate: formatDate(item.lastMessage?.createdAt, 'MMMM dd, yyyy hh:mm a'),
      messageTimeAgo: formatTimeAgo(item.lastMessage?.createdAt),
      subjectAvatar: item.subject.picURL || placeholderAvatar,
      subjectFullname: item.subjectType === 'group' ? `${item.subject.name} (group)` : formatPersonName(item.subject.name),
    })));

    // actions
    const router = useRouter();
    const onItemClick = (item) => {
      router.push({ name: 'inbox-conversation', params: { id: item.id } });
    };

    return {
      items,
      itemsLoading: dataset.loading,
      searchstring: dataset.searchstring,
      sortingopts: dataset.sortingopts,
      sorting: dataset.sorting,
      filteropts: dataset.filteropts,
      filter: dataset.filter,
      onItemClick,
    };
  },
};
</script>
