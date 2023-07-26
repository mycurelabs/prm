import _ from 'lodash';
import * as datefns from 'date-fns';
import { ref, reactive, watch, computed } from 'vue';
import { useSdk } from 'boot/sdk';
import { useActiveMembership } from 'boot/membership.js';
import { createPaginatedDataset, pickBy } from 'boot/helpers';
import { useCurrentUser } from 'boot/auth';
import { fetchTemplates } from 'boot/templates';

export const TARGET_TYPES = [
  {
    key: 'personal',
    icon: 'mdi-account-outline',
    label: 'Personal',
    entity: 'patient',
    description: 'Start a conversation with a specific patient',
  },
  {
    key: 'group',
    icon: 'mdi-account-group-outline',
    label: 'Group',
    entity: 'group',
    description: 'Start a conversation with a group of patients',
  },
];

export const MESSAGE_TYPES = [
  // {
  //   key: 'chat',
  //   icon: 'mdi-chat-outline',
  //   label: 'Chat',
  //   color: 'accent',
  //   backgroundColor: 'purple-1',
  // },
  {
    key: 'email',
    icon: 'mdi-email-outline',
    label: 'Email',
    color: 'primary',
    backgroundColor: 'blue-1',
  },
  {
    key: 'sms',
    icon: 'mdi-message-outline',
    label: 'SMS',
    color: 'pink',
    backgroundColor: 'pink-1',
  },
];
export const MESSAGE_TYPES_MAP = MESSAGE_TYPES.reduce((accum, m) => ({ ...accum, [m.key]: m }), {});

export function useConversationInputForm (messages, opts) {
  const sdk = useSdk();
  const activeMembership = useActiveMembership();
  const currentUser = useCurrentUser();

  const templates = fetchTemplates({ query: { status: 'active' }, fetchImmediate: true });
  const onSearchTemplates = (searchstring) => {
    templates.searchstring = searchstring;
  };
  const onSend = async (data) => {
    data = pickBy({
      ...data,
      type: data.type.key,
      organization: activeMembership.value.organization.id,
    }, Boolean);
    // add message in list (pending)
    try {
      const res = await sdk.create('prm/messages', data);
      res.createdBy = { ...currentUser.value, id: currentUser.value.uid };
      if (messages) {
        messages.addItem(res, { unshift: true });
      }
      return res;
    } catch (error) {
      console.error(error);
      if (messages) {
        messages.addItem({ ...data, statusReason: error.message });
      }
    }
  };

  return {
    templates: templates.items,
    templatesLoading: templates.loading,
    onSearchTemplates,
    onSend,
  };
}

export function fetchConversations (opts) {
  const sdk = useSdk();
  const activeMembership = useActiveMembership();

  // create dataset
  const datasetOpts = {
    ...opts,
    filteropts: [
      {
        name: 'type',
        label: 'Target type',
        type: 'string',
        options: [
          { label: 'All', value: 'all' },
          { label: 'Personal', value: 'personal' },
          { label: 'Group', value: 'group' },
        ],
      },
    ],
    sortingopts: [
      {
        label: 'Newest',
        field: 'lastMessage.createdAt',
        direction: 'descending',
      },
      {
        label: 'Oldest',
        field: 'lastMessage.createdAt',
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
      $populate: {
        subjectPerson: {
          service: 'personal-details',
          localKey: 'subject',
          foreignKey: 'id',
          $select: ['name', 'id', 'picURL'],
        },
        subjectGroup: {
          service: 'prm/groups',
          localKey: 'subject',
          foreignKey: 'id',
          $select: ['name', 'id', 'picURL'],
        },
      },
    };
    switch (params.filter?.value) {
      case 'group':
      case 'personal': {
        query.subjectType = params.filter.value;
        break;
      }
    }
    if (params.sorting?.field) {
      query.$sort = {};
      query.$sort[params.sorting.field] = params.sorting.direction === 'descending' ? -1 : 1;
    }
    const res = await sdk.list('prm/conversations', query);
    res.data = res.data.map(({ $populated, ...rest }) => {
      rest.subject = rest.subjectType === 'group'
        ? $populated?.subjectGroup
        : $populated?.subjectPerson;
      return rest;
    });
    return res;
  }, datasetOpts);

  return {
    ...dataset,
  };
}

export function fetchConversation (id, opts) {
  const sdk = useSdk();
  const activeMembership = useActiveMembership();

  // conversation info
  if (!id) throw new Error('id is required');
  id = reactive(id);
  const loading = ref(false);
  const item = ref(null);
  const fetchItem = async () => {
    loading.value = true;
    try {
      const res = await sdk.get(['prm/conversations', id.value].join('/'), {
        $populate: {
          subjectPerson: {
            service: 'personal-details',
            localKey: 'subject',
            foreignKey: 'id',
            $select: ['name', 'id', 'picURL'],
          },
          subjectGroup: {
            service: 'prm/groups',
            localKey: 'subject',
            foreignKey: 'id',
            $select: ['name', 'id', 'picURL'],
          },
        },
      });
      if (res?.$populated) {
        res.subject = res.subjectType === 'group'
          ? res.$populated?.subjectGroup
          : res.$populated?.subjectPerson;
        delete res.$populated;
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
  watch(id, fetchItem, { immediate: true });

  // messages
  fetchConversations.hasNext = 5;
  const messagesOpts = {
    ...opts?.messages,
    filteropts: [
      {
        name: 'backend',
        label: 'Provider',
        type: 'string',
        options: [
          { label: 'All', value: 'all' },
          { label: 'Chat', value: 'chat' },
          { label: 'SMS', value: 'sms' },
          { label: 'Email', value: 'email' },
        ],
      },
    ],
  };
  const messages = createPaginatedDataset(async (params) => {
    const query = {
      $limit: params.pagination.pageSize,
      $page: params.pagination.page,
      $total: true,
      conversation: id.value,
      $sort: { createdAt: -1 },
      $populate: {
        createdBy: {
          service: 'personal-details',
          localKey: 'createdBy',
          foreignKey: 'id',
          $select: ['id', 'name', 'picURL'],
        },
      },
    };
    if (params.query.searchstring) {
      query.$search = params.query.searchstring;
    }
    if (params.sorting?.field) {
      query.$sort = query.$sort || {};
      query.$sort[params.sorting.field] = params.sorting.direction === 'descending' ? -1 : 1;
    }
    switch (params.filter?.value) {
      case 'email':
      case 'chat':
      case 'sms': {
        query.type = params.filter.value;
        break;
      }
    }
    const res = await sdk.list('prm/messages', query);
    res.data = res.data.map(({ $populated, ...rest }) => ({ ...rest, ...$populated }));
    return res;
  }, messagesOpts);
  watch(item, () => messages.fetchItems({ override: true }));

  // memberts
  const membersOpts = {
    ...opts?.members,
  };
  const members = createPaginatedDataset(async (params) => {
    const convo = await sdk.get('prm/conversations', id.value);
    if (!convo) return [];

    // group members
    if (convo.subjectType === 'group') {
      const query = {
        $limit: params.pagination.pageSize,
        $page: params.pagination.page,
        $total: true,
        'prmGroups.id': convo.subject,
        facility: activeMembership.value.organization.id,
      };
      const res = await sdk.list('medical-patients', query);
      return res;
    }

    // personal
    const px = await sdk.get('medical-patients', convo.subject);
    return [px].filter(Boolean);
  }, membersOpts);
  watch(item, () => members.fetchItems({ override: true }));

  return {
    loading,
    item,
    fetchItem,
    messages,
    members,
  };
}

export function fetchConversationsStats (dateRange, opts) {
  const dateRangeInternal = reactive(dateRange || ref({
    from: new Date().toLocaleDateString(),
    to: new Date().toLocaleDateString(),
  }));
  dateRange = computed({
    get: () => dateRangeInternal.value,
    set: (val) => {
      if (typeof val === 'string') {
        val = { from: val, to: val };
      }
      dateRangeInternal.value = val;
    },
  });

  const sdk = useSdk();
  const activeMembership = useActiveMembership();

  const statsByMessageTypeLoading = ref(false);
  const statsByMessageType = ref([]);
  const statsByMessageTypeTotal = computed(() => statsByMessageType.value.reduce((sum, s) => sum + +s.total, 0));
  const fetchStatsByMessageType = async () => {
    statsByMessageTypeLoading.value = true;
    try {
      const query = {
        createdAt: {
          $gte: datefns.startOfDay(new Date(dateRange.value.from)).getTime(),
          $lte: datefns.endOfDay(new Date(dateRange.value.to)).getTime(),
        },
        organization: activeMembership.value.organization.id,
        $aggregate: true,
        status: 'sent',
      };
      const res = await sdk.list('prm/recipients', query);
      const grouped = _.groupBy(res.data, 'type');
      statsByMessageType.value = MESSAGE_TYPES.map(m => ({
        type: m,
        histogram: grouped[m.key] || [],
      })).map(r => ({ ...r, total: r.histogram.reduce((s, v) => s + +v.count, 0) }));
    } catch (error) {
      console.error(error);
    } finally {
      statsByMessageTypeLoading.value = false;
    }
  };

  watch(dateRange, fetchStatsByMessageType, { immediate: !!opts?.fetchImmediate });

  return {
    dateRange,
    statsByMessageTypeLoading,
    statsByMessageType,
    statsByMessageTypeTotal,
    fetchStatsByMessageType,
  };
}

export function fetchTargets (type, opts) {
  type = reactive(type || ref(null));

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
  };
  const dataset = createPaginatedDataset(async (params) => {
    const query = {
      $limit: params.pagination.pageSize,
      $page: params.pagination.page,
      $total: true,
    };
    // groups
    if (type.value.key === 'group') {
      query.organization = activeMembership.value.organization.id;
      if (params.query.searchstring) {
        query.$search = params.query.searchstring;
      }
      const res = await sdk.list('prm/groups', query);
      res.data = res.data.map(d => ({ ...d, isGroup: true }));
      return res;
    }

    // personal
    query.facility = activeMembership.value.organization.id;
    const $search = {};
    if (params.query.searchstring) {
      $search.text = params.query.searchstring;
    }
    if (Object.keys($search).length) query.$search = $search;
    const res = await sdk.list('medical-patients', query);
    return res;
  }, datasetOpts);

  watch(type, () => dataset.fetchItems({ override: true }));

  const populateTarget = async (id) => {
    if (type.value.key === 'group') {
      const res = await sdk.get('prm/groups', id);
      return res;
    }
    const res = await sdk.get('medical-patients', id);
    return res;
  };

  return {
    ...dataset,
    populateTarget,
  };
}

export function fetchMessagesForClient (clientid, opts) {
  const sdk = useSdk();
  const activeMembership = useActiveMembership();

  if (!clientid) throw new Error('clientid is required');
  clientid = reactive(clientid);

  // create dataset
  const datasetOpts = {
    ...opts,
    filteropts: [
      {
        name: 'type',
        label: 'Type',
        type: 'string',
        options: [
          { label: 'All', value: 'all' },
          { label: 'Chat', value: 'chat' },
          { label: 'SMS', value: 'sms' },
          { label: 'Email', value: 'email' },
        ],
      },
    ],
    sortingopts: [
      {
        label: 'Newest',
        field: 'createdAt',
        direction: 'descending',
      },
      {
        label: 'Oldest',
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
      recipient: clientid.value,
    };
    if (params.query.searchstring) {
      query.$search = params.query.searchstring;
    }
    if (params.sorting?.field) {
      query.$sort = {};
      query.$sort[params.sorting.field] = params.sorting.direction === 'descending' ? -1 : 1;
    }
    switch (params.filter?.value) {
      case 'email':
      case 'chat':
      case 'sms': {
        query.type = params.filter.value;
        break;
      }
    }
    const res = await sdk.list('prm/recipients', query);
    return res;
  }, datasetOpts);

  return {
    ...dataset,
  };
}
