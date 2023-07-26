<template lang="pug">
div.row.q-mb-md
  // page title
  div.column
    span.text-h6 Manage your Message Templates
    span.text-caption.text-grey-6 Create or manager your message templates

  q-space

  // create action
  div
    q-dialog(v-model="createDialog" persistent)
      template-form(dialog @cancel="onCreateCancel" @save="onCreate")
    q-btn(
      no-caps
      icon="mdi-plus"
      label="Add Message Template"
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
    placeholder="Search for templates"
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
  rows-per-page-label="Templates per page"
  :rows-per-page-options="[10,20,50]"
  v-model:pagination="pagination"
  @request="v => pagination=v.pagination"
)
  template(#no-data)
    div.fit.column.items-center.q-py-xl
      img(alt="logo" src="~assets/no-templates-art.png" style="width: 170px;")

      div.text-subtitle2.q-mb-xs
        | This is where you'll manage your templates

      div.text-caption.text-grey
        | You can create a new template

      div.q-mt-lg
        q-btn(
          no-caps
          color="primary"
          unelevated
          label="Add now"
          @click="onCreateBtnClick"
        )

  // status action
  template(#body-cell-label="props")
    q-td(:props="props")
      q-toggle(
        :modelValue="!!props.row.isActive"
        @click="onToggleActive(props.row)"
      )
        q-tooltip  Template is {{ props.row.isActive ? 'active' : 'inactive' }}
      | {{ props.value }}

  // rendered message
  template(#body-cell-template="props")
    q-td(:props="props")
      div(v-html="props.value")

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
        q-tooltip Delete template
</template>

<script>
import SortingMenu from 'components/SortingMenu.vue';
import TemplateForm from 'components/TemplateForm.vue';
import { ref, computed } from 'vue';
import { formatDate, handleAction, toQuasarPagination } from 'boot/helpers';
import { fetchTemplates } from 'boot/templates';

export default {
  name: 'SettingsTemplates',
  components: {
    SortingMenu,
    TemplateForm,
  },
  setup () {
    // table
    const dataset = fetchTemplates({ fetchImmediate: true });
    const items = computed(() => dataset.items.value.map(item => ({
      ...item,
      isActive: item.status === 'active',
    })));
    const columns = [
      {
        name: 'label',
        field: 'label',
        label: 'Template label',
        align: 'left',
        sortable: false,
        style: 'width: 120px',
        headerStyle: 'width: 120px',
      },
      {
        name: 'lastUsedAt',
        field: 'lastUsedAt',
        format: val => formatDate(val),
        label: 'Last Used',
        align: 'left',
        sortable: false,
        style: 'width: 70px',
        headerStyle: 'width: 70px',
      },
      {
        name: 'subject',
        field: 'subject',
        label: 'Subject',
        align: 'left',
        sortable: false,
        style: 'width: 120px',
        headerStyle: 'width: 120px',
      },
      {
        name: 'template',
        field: 'body',
        label: 'Message',
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
      errorPrefix: 'Failed to create template',
      loaderMessage: 'Creating template...',
    });
    const onToggleActive = handleAction(dataset.toggleItemActiveStatus, {
      errorPrefix: 'Failed to set template active status',
      loaderMessage: item => {
        const operation = item.isActive ? 'disable' : 'enable';
        return `Setting ${item.label} as ${operation}d...`;
      },
      confirmMessage: item => {
        const operation = item.status === 'active' ? 'disable' : 'enable';
        return `Would you like to ${operation} ${item.label} template?`;
      },
    });
    const onDelete = handleAction(dataset.deleteItem, {
      errorPrefix: 'Failed to delete template',
      loaderMessage: item => `Deleting ${item.label} template...`,
      confirmMessage: item => `Would you like to delete ${item.label} template? This action cannot be reversed`,
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
      onToggleActive,
      onDelete,
    };
  },
};
</script>
