<template lang="pug">
q-page(padding)
  div.row.q-mb-sm
    // page title
    div.column
      span.text-h4 Patient List
      span.text-subtitle2.text-grey-6 View your patient list

  // search inpuut
  div.row.q-my-md.q-gutter-sm
    q-input(
      dense
      outlined
      hide-bottom-space
      v-model="searchstring"
      placeholder="Search for patient"
      debounce="300"
      style="width:400px;"
    ).bg-white
      template(#prepend)
        q-icon(name="mdi-magnify")
    q-space.gt-xs
    // sorting-menu(v-model="sorting" :options="sortingopts")

  // tabular view
  q-table(
    flat
    bordered
    :rows="items"
    :columns="columns"
    :loading="itemsLoading"
    row-key="id"
    :hide-header="!items.length"
    rows-per-page-label="Patients per page"
    :rows-per-page-options="[10,20,50]"
    v-model:pagination="pagination"
    @request="v => pagination=v.pagination"
    @row-click="(e,row) => onItemClick(row)"
  )
    template(#no-data)
      div.fit.column.items-center.q-py-xl
        img(alt="logo" src="~assets/no-templates-art.png" style="width: 170px;")

        div.text-subtitle2.q-mb-xs
          | This is where you'll manage your patients

    // full name
    template(#body-cell-fullname="props")
      q-td(:props="props")
        div.full-width.row.items-center.q-gutter-sm
          q-avatar(size="md")
            img(alt="avatar" :src="props.row.avatar")
          div
            | {{ props.value }}

    // tags
    template(#body-cell-groups="props")
      q-td(:props="props")
        div.full-width.row.items-center.q-gutter-xs
          template(v-for="(group,ind) of props.value.slice(0, 2)")
            q-chip(color="blue-1").text-primary {{ group.name }}
          template(v-if="props.value.length > 2")
            q-chip +{{ props.value.length - 2 }}
              q-tooltip {{ props.value.slice(2).join(', ') }}
</template>

<script>
import SortingMenu from 'components/SortingMenu.vue';
import placeholderAvatar from 'assets/placeholder-person.png';
import { computed } from 'vue';
import { formatDate, formatPersonName, toQuasarPagination } from 'boot/helpers';
import { useRouter } from 'vue-router';
import { fetchClients } from 'boot/clients';

export default {
  name: 'ClientsListPage',
  components: {
    SortingMenu,
  },
  setup () {
    // table
    const dataset = fetchClients({ fetchImmediate: true });
    const items = computed(() => dataset.items.value.map(item => ({
      ...item,
      avatar: item.picURL || placeholderAvatar,
      fullname: formatPersonName(item.name, { lastNameFirst: true }),
    })));
    const columns = [
      {
        name: 'fullname',
        field: 'fullname',
        label: 'Patient name',
        align: 'left',
        sortable: false,
        style: 'width: 120px',
        headerStyle: 'width: 120px',
      },
      {
        name: 'sex',
        field: 'sex',
        label: 'Sex',
        align: 'left',
        sortable: false,
        style: 'width: 10px',
        headerStyle: 'width: 10px;',
      },
      {
        name: 'dateOfBirth',
        field: 'dateOfBirth',
        format: val => formatDate(val),
        label: 'Birthday',
        align: 'left',
        sortable: false,
        style: 'width: 70px;',
        headerStyle: 'width: 70px;',
      },
      {
        name: 'lastVisitAt',
        field: 'lastVisitAt',
        format: val => formatDate(val),
        label: 'Last visit date',
        align: 'left',
        sortable: false,
        style: 'width: 70px;',
        headerStyle: 'width: 70px;',
      },
      {
        name: 'groups',
        field: 'prmGroups',
        format: val => val || [],
        label: 'Groups',
        align: 'left',
        sortable: false,
        style: 'width: 30px',
        headerStyle: 'width: 30px',
      },
      {
        name: 'externalId',
        field: 'externalId',
        label: 'External Id',
        align: 'left',
        sortable: false,
        style: 'width: 30px',
        headerStyle: 'width: 30px',
      },
    ];

    // actions
    const router = useRouter();
    const onItemClick = (item) => {
      router.push({ name: 'client-details', params: { id: item.id } });
    };

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
      onItemClick,
    };
  },
};
</script>
