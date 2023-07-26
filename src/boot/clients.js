import { reactive, ref, watch } from 'vue';
import { useSdk } from 'boot/sdk';
import { useActiveMembership } from 'boot/membership.js';
import { createPaginatedDataset, pickBy } from 'boot/helpers';
import { useAppConstants } from 'boot/app';

export function fetchClients (opts) {
  const sdk = useSdk();
  const activeMembership = useActiveMembership();

  // create dataset
  const datasetOpts = {
    ...opts,
    filteropts: [
      {
        name: 'sex',
        type: 'string',
        options: [
          { label: 'All', value: 'all' },
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
        ],
      },
    ],
    sortingopts: [
      {
        label: 'Recently visited',
        field: 'lastVisitAt',
        direction: 'descending',
      },
      {
        label: 'Least recently visited',
        field: 'lastVisitAt',
        direction: 'ascending',
      },
    ],
  };
  const dataset = createPaginatedDataset(async (params) => {
    const query = {
      $limit: params.pagination.pageSize,
      $page: params.pagination.page,
      $total: true,
      facility: activeMembership.value.organization.id,
      $populate: {
        personalDetails: {
          service: 'personal-details',
          localKey: 'id',
          foreignKey: 'id',
          $select: ['bloodType', 'mobileNo', 'email'],
        },
      },
    };
    const $search = {};
    if (params.query.searchstring) {
      $search.text = params.query.searchstring;
    }
    switch (params.sorting?.field) {
      case 'lastVisitAt': {
        query.$sort = {};
        query.$sort[params.sorting.field] = params.sorting.direction === 'descending' ? -1 : 1;
        break;
      }
    }
    params.query.filters.forEach(filter => {
      switch (filter.name) {
        case 'sex': {
          $search.sex = filter.value;
          break;
        }
      }
    });
    if (Object.keys($search).length) query.$search = $search;
    const res = await sdk.list('medical-patients', query);
    res.data = res.data.map(({ $populated, ...rest }) => ({ ...rest, ...$populated?.personalDetails }));
    return res;
  }, datasetOpts);

  // actions
  const setItemGroups = async (item, groups) => {
    groups = groups?.map(grp => pickBy({
      id: grp.id,
      name: grp.name,
    }, Boolean));
    if (!item?.id) throw new Error('Group has no id');
    const data = {
      prmGroups: groups || [],
    };
    const updated = await sdk.update('medical-patients', item.id, data);
    dataset.addItem(updated);
  };

  return {
    ...dataset,
    setItemGroups,
  };
}

export function fetchClient (id, opts) {
  const sdk = useSdk();
  const { linkCMSApp } = useAppConstants();

  // conversation info
  if (!id) throw new Error('id is required');
  id = reactive(id);
  const loading = ref(false);
  const item = ref(null);
  const fetchItem = async () => {
    loading.value = true;
    try {
      const query = {
        $populate: {
          personalDetails: {
            service: 'personal-details',
            localKey: 'id',
            foreignKey: 'id',
            $select: ['bloodType', 'mobileNo', 'email'],
          },
        },
      };
      const res = await sdk.get(['medical-patients', id.value].join('/'), query);
      if (res?.$populated) {
        Object.assign(res, { ...res.$populated?.personalDetails });
        delete res.$populated;
      }
      // attach medical records link
      if (res && linkCMSApp) {
        const url = new URL(linkCMSApp);
        url.pathname = `/cms/emr/patient/${res.id}/current-encounter`;
        const accessToken = await sdk.token();
        url.searchParams.set('token', accessToken);
        res.medicalRecordsUrl = url.href;
      }
      item.value = res;
    } catch (error) {
      console.error(error);
      const errorHandler = opts?.errorHandler || (() => undefined);
      errorHandler(error);
    } finally {
      loading.value = false;
    }
  };
  watch(id, fetchItem, { immediate: !!opts?.fetchImmediate });

  // actions
  const setGroups = async (groups) => {
    groups = groups?.map(grp => pickBy({
      id: grp.id,
      name: grp.name,
    }, Boolean));
    const data = {
      prmGroups: groups || [],
    };
    const updated = await sdk.update('medical-patients', id.value, data);
    if (item.value) item.value.prmGroups = updated.prmGroups;
  };
  const setData = async (data) => {
    data = {
      ...data,
    };
    if (!Object.keys(data).length) return;
    await sdk.update('personal-details', id.value, data);
    if (item.value) Object.assign(item.value, data);
  };

  return {
    loading,
    item,
    fetchItem,
    setGroups,
    setData,
  };
}

export function fetchGroups (opts) {
  const sdk = useSdk();
  const activeMembership = useActiveMembership();

  // create dataset
  const datasetOpts = {
    ...opts,
    sortingopts: [
      {
        label: 'Recently created',
        field: 'createdAt',
        direction: 'descending',
      },
      {
        label: 'Least recently created',
        field: 'createdAt',
        direction: 'ascending',
      },
    ],
  };
  const dataset = createPaginatedDataset(async (params) => {
    const query = {
      $limit: params.pagination.pageSize,
      $page: params.pagination.page,
      $total: true,
      organization: activeMembership.value.organization.id,
    };
    if (params.query.searchstring) {
      query.$search = params.query.searchstring;
    }
    if (params.sorting?.field) {
      query.$sort = {};
      query.$sort[params.sorting.field] = params.sorting.direction === 'descending' ? -1 : 1;
    }
    const res = await sdk.list('prm/groups', query);
    return res;
  }, datasetOpts);

  // actions
  const createItem = async (data) => {
    data = {
      ...data,
      organization: activeMembership.value.organization.id,
    };
    const res = await sdk.create('prm/groups', data);
    dataset.addItem(res);
  };
  const deleteItem = async (item) => {
    if (!item?.id) throw new Error('Group has no id');
    await sdk.delete('prm/groups', item.id);
    dataset.deleteItem(item);
  };

  return {
    ...dataset,
    createItem,
    deleteItem,
  };
}
