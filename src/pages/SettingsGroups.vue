<template lang="pug">
q-dialog(v-model="createDialog" persistent)
  group-form(dialog @cancel="onCreateCancel" @save="onCreate")
div.row.q-mb-md
  // page title
  div.column
    span.text-h6 Manage your Groups
    span.text-caption.text-grey-6 Create or manager your groups

  q-space

  // create action
  div
    q-btn(
      no-caps
      icon="mdi-plus"
      label="Add Group"
      color="primary"
      @click="onCreateBtnClick"
    ).gt-xs
    q-page-sticky(position="bottom-right" :offset="[18,18]").xs.z-top
      q-btn(
        fab
        no-caps
        icon="mdi-plus"
        color="primary"
        @click="onCreateBtnClick"
      )

// search inpuut
div.row.q-my-md.q-gutter-sm
  q-input(
    dense
    outlined
    hide-bottom-space
    v-model="searchstring"
    placeholder="Search for groups"
    debounce="300"
    style="width:400px;"
  ).bg-white
    template(#prepend)
      q-icon(name="mdi-magnify")
  q-space.gt-xs
  sorting-menu(v-model="sorting" :options="sortingopts")

// tabular view
q-table(
  flat
  bordered
  :rows="items"
  :columns="columns"
  :loading="itemsLoading"
  row-key="id"
  :hide-header="!items.length"
  rows-per-page-label="Groups per page"
  :rows-per-page-options="[10,20,50]"
  v-model:pagination="pagination"
  @request="v => pagination=v.pagination"
)
  template(#no-data)
    div.fit.column.items-center.q-py-xl
      img(alt="logo" src="~assets/no-templates-art.png" style="width: 170px;")

      div.text-subtitle2.q-mb-xs
        | This is where you'll manage your groups

      div.text-caption.text-grey
        | You can create a new group

      div.q-mt-lg
        q-btn(
          no-caps
          color="primary"
          unelevated
          label="Add now"
          @click="onCreateBtnClick"
        )

  // delete action
  template(#body-cell-action="props")
    q-td(:props="props")
      q-btn(
        flat
        round
        dense
        icon="mdi-delete"
        color="negative"
        @click="onDelete(props.row)"
      )
        q-tooltip Delete group
</template>

<script>
import GroupForm from 'components/GroupForm.vue';
import SortingMenu from 'components/SortingMenu.vue';
import { ref } from 'vue';
import { handleAction, toQuasarPagination } from 'boot/helpers';
import { fetchGroups } from 'boot/clients';

export default {
  name: 'SettingsGroups',
  components: {
    GroupForm,
    SortingMenu,
  },
  setup () {
    // table
    const dataset = fetchGroups({ fetchImmediate: true });
    const items = dataset.items;
    const columns = [
      {
        name: 'id',
        field: 'id',
        label: 'Id',
        align: 'left',
        sortable: false,
        style: 'width: 120px',
        headerStyle: 'width: 120px',
      },
      {
        name: 'name',
        field: 'name',
        label: 'Group name',
        align: 'left',
        sortable: false,
        style: 'width: 120px',
        headerStyle: 'width: 120px',
      },
      {
        name: 'description',
        field: 'description',
        label: 'Description',
        align: 'left',
        sortable: false,
      },
      {
        name: 'action',
        field: 'action',
        label: '',
        align: 'right',
        sortable: false,
        style: 'width: 30px',
        headerStyle: 'width: 30px',
      },
    ];

    // actions
    const createDialog = ref(false);
    const onCreateBtnClick = () => {
      createDialog.value = true;
    };
    const onCreateCancel = () => {
      createDialog.value = false;
    };
    const onCreate = handleAction(async (data) => {
      await dataset.createItem(data);
      createDialog.value = false;
    }, {
      confirm: false,
      errorPrefix: 'Failed to create group',
      loaderMessage: 'Creating group...',
    });
    const onDelete = handleAction(dataset.deleteItem, {
      errorPrefix: 'Failed to delete group',
      loaderMessage: item => `Deleting ${item.label} group...`,
      confirmMessage: item => `Would you like to delete ${item.label} group? This action cannot be reversed`,
    });

    return {
      items,
      itemsLoading: dataset.loading,
      pagination: toQuasarPagination(dataset.pagination),
      searchstring: dataset.searchstring,
      sortingopts: dataset.sortingopts,
      sorting: dataset.sorting,
      filteropts: dataset.filteropts,
      filter: dataset.filter,
      columns,
      createDialog,
      onCreateBtnClick,
      onCreateCancel,
      onCreate,
      onDelete,
    };
  },
};
</script>
