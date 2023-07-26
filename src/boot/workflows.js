import { useSdk } from 'boot/sdk';
import { useActiveMembership } from 'boot/membership.js';
import { createPaginatedDataset, deepFreeze } from 'boot/helpers';

export const TRIGGERS = deepFreeze([
  {
    id: 'facility_rescheduled_appointment',
    name: 'Facility has rescheduled the appointment',
    subjectLabel: 'Patient',
    variables: [
      { label: 'Facility name', tag: 'facility_name' },
      { label: 'Reschedule date', tag: 'reschedule_date' },
      { label: 'Reschedule time', tag: 'reschedule_time' },
      { label: 'Patient firstname', tag: 'px_fname' },
      { label: 'Patient lastname', tag: 'px_lname' },
    ],
    trigger: {
      type: 'service',
      service: 'appointments',
    },
  },
  {
    id: 'facility_approved_appointment',
    name: 'Facility has approved appointment',
    subjectLabel: 'Patient',
    variables: [
      { label: 'Facility name', tag: 'facility_name' },
      { label: 'Schedule date', tag: 'schedule_date' },
      { label: 'Schedule time', tag: 'schedule_time' },
      { label: 'Patient firstname', tag: 'px_fname' },
      { label: 'Patient lastname', tag: 'px_lname' },
    ],
    trigger: {
      type: 'service',
      service: 'appointments',
    },
  },
  {
    id: 'facility_24hrs_before_appointment',
    name: '24 hours before the appointment schedule',
    subjectLabel: 'Patient',
    variables: [
      { label: 'Facility name', tag: 'facility_name' },
      { label: 'Schedule date', tag: 'schedule_date' },
      { label: 'Schedule time', tag: 'schedule_time' },
      { label: 'Patient firstname', tag: 'px_fname' },
      { label: 'Patient lastname', tag: 'px_lname' },
    ],
    trigger: {
      type: 'service',
      service: 'appointments',
    },
  },
  {
    id: 'facility_2hrs_before_appointment',
    name: '2 hours before the appointment schedule',
    subjectLabel: 'Patient',
    variables: [
      { label: 'Facility name', tag: 'facility_name' },
      { label: 'Schedule date', tag: 'schedule_date' },
      { label: 'Schedule time', tag: 'schedule_time' },
      { label: 'Patient firstname', tag: 'px_fname' },
      { label: 'Patient lastname', tag: 'px_lname' },
    ],
    trigger: {
      type: 'service',
      service: 'appointments',
    },
  },
  {
    id: 'px_2nd_in_line_in_queue',
    name: 'When patient is 2nd in line',
    subjectLabel: 'Patient',
    variables: [
      { label: 'Facility name', tag: 'facility_name' },
      { label: 'Queue name', tag: 'queue_name' },
      { label: 'Patient firstname', tag: 'px_fname' },
      { label: 'Patient lastname', tag: 'px_lname' },
    ],
    trigger: {
      type: 'service',
      service: 'appointments',
    },
  },
  {
    id: 'px_next_in_line_in_queue',
    name: 'When patient is next in line',
    subjectLabel: 'Patient',
    variables: [
      { label: 'Facility name', tag: 'facility_name' },
      { label: 'Queue name', tag: 'queue_name' },
      { label: 'Patient firstname', tag: 'px_fname' },
      { label: 'Patient lastname', tag: 'px_lname' },
    ],
    trigger: {
      type: 'service',
      service: 'appointments',
    },
  },
  {
    id: 'px_accommodated_in_queue',
    name: 'When patient is called/accommodated in the queue.',
    subjectLabel: 'Patient',
    variables: [
      { label: 'Facility name', tag: 'facility_name' },
      { label: 'Queue name', tag: 'queue_name' },
      { label: 'Patient firstname', tag: 'px_fname' },
      { label: 'Patient lastname', tag: 'px_lname' },
    ],
    trigger: {
      type: 'service',
      service: 'appointments',
    },
  },
  {
    id: 'px_encounter_ended',
    name: 'When the patient\'s encounter is ended',
    subjectLabel: 'Patient',
    variables: [
      { label: 'Facility name', tag: 'facility_name' },
      { label: 'Patient firstname', tag: 'px_fname' },
      { label: 'Patient lastname', tag: 'px_lname' },
    ],
    trigger: {
      type: 'service',
      service: 'medical-encounters',
    },
  },
  {
    id: 'px_dx_test_finalized',
    name: 'When a diagnostic test result is finalized and viewable in pxp app',
    subjectLabel: 'Patient',
    variables: [
      { label: 'Facility name', tag: 'facility_name' },
      { label: 'Test name', tag: 'dx_test_name' },
      { label: 'Patient firstname', tag: 'px_fname' },
      { label: 'Patient lastname', tag: 'px_lname' },
    ],
    trigger: {
      type: 'service',
      service: 'diagnostic-order-tests',
    },
  },
]);
export const TRIGGERS_MAP = deepFreeze(TRIGGERS.reduce((obj, t) => ({ ...obj, [t.id]: t }), {}));

export function fetchWorkflows (opts) {
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
    const res = await sdk.list('prm/workflows', query);
    return res;
  }, datasetOpts);

  // actions
  const createItem = async (data) => {
    data = {
      organization: activeMembership.value.organization.id,
      status: 'active',
      label: data.label,
      trigger: {
        type: data.trigger.trigger.type,
        service: data.trigger.trigger.service,
        event: data.trigger.id,
      },
      actionSendMessage: {
        type: data.messageType,
        body: data.body,
        subjectField: data.trigger.subjectLabel,
      },
    };
    const res = await sdk.create('prm/workflows', data);
    dataset.addItem(res);
  };
  const deleteItem = async (item) => {
    if (!item?.id) throw new Error('Workflow has no id');
    await sdk.delete('prm/workflows', item.id);
    dataset.deleteItem(item);
  };
  const toggleItemActiveStatus = async (item) => {
    if (!item?.id) throw new Error('Workflow has no id');
    const data = { status: item.status === 'active' ? 'inactive' : 'active' };
    const res = await sdk.update('prm/workflows', item.id, data);
    dataset.addItem(res);
  };

  return {
    ...dataset,
    createItem,
    deleteItem,
    toggleItemActiveStatus,
  };
}
