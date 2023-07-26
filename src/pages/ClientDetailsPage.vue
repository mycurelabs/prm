<template lang="pug">
// px header
q-header.bg-white.text-black
  q-toolbar
    q-toolbar-title
      | Patient Profile
    q-space.gt-xs
    div
      q-btn(
        no-wrap
        no-caps
        unelevated
        icon="mdi-plus"
        color="primary"
        label="New Message"
        @click="onCreateBtnClick"
        :disabled="loading || !client"
      ).gt-xs
      q-page-sticky(position="bottom-right" :offset="[18,18]").xs.z-top
        q-btn(
          fab
          no-caps
          icon="mdi-message"
          color="primary"
          @click="onCreateBtnClick"
          :disabled="loading || !client"
        )
  client-header(
    :client="client"
    :loading="loading"
    :groups="groups"
    :groupsLoading="groupsLoading"
    @search-groups="onSearchGroups"
    @change-groups="onSetGroups"
    @change-data="onSetData"
  )
    template(#no-data)
      div.column.fit.flex.flex-center
        div(style="max-width:500px;").items-center.text-center
          div.text-h5 Looks like the patient doesn't exist
          div.caption.text-grey We could not load the patient with id '{{ id }}'. This may be on us so please report this to your admin for verification
          q-btn(
            no-wrap
            no-caps
            unelevated
            icon="mdi-arrow-left"
            color="primary"
            label="Go back to list"
            @click="onGoBackToList"
          ).q-mt-sm

// conversations
q-page(padding)
  div.row.q-mb-sm
    div.column
      span.text-h6 Conversation History

  // search inpuut
  div.row.q-my-md.q-gutter-sm
    q-input(
      dense
      outlined
      hide-bottom-space
      placeholder="Search conversations"
      debounce="300"
      v-model="searchstring"
      style="width:400px;"
    ).bg-white
      template(#prepend)
        q-icon(name="mdi-magnify")
    q-space.gt-xs
    filter-menu(v-model="filter" :options="filteropts")
    sorting-menu(v-model="sorting" :options="sortingopts")

  q-card(flat bordered)
    // recent conversations / search results
    template(v-if="items.length || itemsLoading")
      q-card-section.column
        div.q-mb-md
          template(v-if="itemsSearching")
            div.text-h6 Search results
          template(v-else)
            div.text-h6 Recent conversations
        div(style="max-height: 500px; overflow: auto")#convos-scroll-target.q-pr-md
          div.column.reverse.q-gutter-md
            template(v-if="itemsLoading")
              div.row.justify-center.q-my-md
                q-spinner-dots(color="primary" size="40px")
            template(v-else)
              div.row.justify-center.q-my-md
                q-btn(
                  @click="itemsNext"
                  unelevated
                  flat
                  color="primary"
                  no-caps
                ) Load more
            template(v-for="(msg,ind) of items" :key="ind")
              message-card(@click="onItemClick(msg)" :message="msg").cursor-pointer

    // no messages
    template(v-else)
      q-card-section.fit.flex.flex-center.q-py-xl
        div.column.text-center.q-my-xl
          img(alt="no-interactions" src="~assets/no-interactions-art.png" style="width: 150px;").q-mx-auto
          span.text-h6 No conversations found
          span.text-subtitle1.text-grey Start a new one?
          q-btn(
            no-wrap
            no-caps
            unelevated
            icon="mdi-plus"
            color="primary"
            label="New Message"
            @click="onCreateBtnClick"
            :disabled="loading || !client"
          ).q-mt-md
</template>

<script>
import ClientHeader from 'components/ClientHeader.vue';
import FilterMenu from 'components/FilterMenu.vue';
import SortingMenu from 'components/SortingMenu.vue';
import MessageCard from 'components/MessageCard.vue';
import { useQuasar } from 'quasar';
import { toRef, computed } from 'vue';
import { useRouter } from 'vue-router';
import { fetchClient, fetchGroups } from 'boot/clients';
import { fetchMessagesForClient } from 'boot/conversations';
import { debounce } from 'boot/helpers';

export default {
  name: 'ClientDetailsPage',
  components: {
    ClientHeader,
    FilterMenu,
    SortingMenu,
    MessageCard,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup (props) {
    const $q = useQuasar();

    const id = toRef(props, 'id');
    const router = useRouter();

    // header actions
    const onCreateBtnClick = () => {
      router.push({ name: 'inbox-new', query: { type: 'personal', subject: id.value } });
    };
    const onGoBackToList = () => {
      router.replace({ name: 'clients-list' });
    };

    // header data
    const clientdata = fetchClient(id, { fetchImmediate: true });

    // messages data (searched/filtered)
    const messagesdata = fetchMessagesForClient(id, { fetchImmediate: true, append: true });
    const onItemClick = (item) => {
      router.push({ name: 'inbox-conversation', params: { id: item.conversation }, query: { message: item.messageId } });
    };
    const itemsSearching = computed(() => !!(messagesdata.searchstring.value || messagesdata.filter.value));

    const groupopts = fetchGroups({ fetchImmediate: true });
    const onSetGroups = debounce(async (groups) => {
      try {
        await clientdata.setGroups(groups);
        $q.notify({
          message: 'Groups updated.',
          color: 'positive',
        });
      } catch (error) {
        console.error(error);
        $q.notify({
          message: 'Failed to update groups. ' + error.message,
          color: 'warning',
        });
      }
    }, 400);
    const onSearchGroups = (searchstring) => {
      groupopts.searchstring.value = searchstring;
    };
    const onSetData = debounce(async (data) => {
      try {
        await clientdata.setData(data);
        $q.notify({
          message: 'Data updated.',
          color: 'positive',
        });
      } catch (error) {
        console.error(error);
        $q.notify({
          message: 'Failed to update data. ' + error.message,
          color: 'warning',
        });
      }
    }, 400);

    return {
      onCreateBtnClick,
      onGoBackToList,
      loading: clientdata.loading,
      client: clientdata.item,

      itemsSearching,
      items: messagesdata.items,
      itemsLoading: messagesdata.loading,
      itemsNext: messagesdata.fetchNextItems,
      itemsPrev: messagesdata.fetchPrevItems,
      searchstring: messagesdata.searchstring,
      sortingopts: messagesdata.sortingopts,
      sorting: messagesdata.sorting,
      filteropts: messagesdata.filteropts,
      filter: messagesdata.filter,
      onItemClick,
      onSetGroups,

      groups: groupopts.items,
      groupsLoading: groupopts.loading,
      onSearchGroups,
      onSetData,
    };
  },
};
</script>
