import { useSdk } from 'boot/sdk';
import { useActiveMembership } from 'boot/membership.js';
import { createPaginatedDataset } from 'boot/helpers';

export function fetchTemplates (opts) {
  const sdk = useSdk();
  const activeMembership = useActiveMembership();

  // create dataset
  const datasetOpts = {
    ...opts,
    sortingopts: [
      {
        label: 'Label A-Z',
        field: 'label',
        direction: 'descending',
      },
      {
        label: 'Label Z-A',
        field: 'label',
        direction: 'ascending',
      },
      {
        label: 'Recently Used',
        field: 'lastUsedAt',
        direction: 'descending',
      },
      {
        label: 'Least recently used',
        field: 'lastUsedAt',
        direction: 'ascending',
      },
    ],
  };
  const dataset = createPaginatedDataset(async (params) => {
    const query = {
      ...opts?.query,
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
    const res = await sdk.list('prm/templates', query);
    return res;
  }, datasetOpts);

  // actions
  const createItem = async (data) => {
    data = {
      ...data,
      organization: activeMembership.value.organization.id,
    };
    const res = await sdk.create('prm/templates', data);
    dataset.addItem(res);
  };
  const deleteItem = async (item) => {
    if (!item?.id) throw new Error('Template has no id');
    await sdk.delete('prm/templates', item.id);
    dataset.deleteItem(item);
  };
  const toggleItemActiveStatus = async (item) => {
    if (!item?.id) throw new Error('Template has no id');
    const data = { status: item.status === 'active' ? 'inactive' : 'active' };
    const res = await sdk.update('prm/templates', item.id, data);
    dataset.addItem(res);
  };

  return {
    ...dataset,
    createItem,
    deleteItem,
    toggleItemActiveStatus,
  };
}
