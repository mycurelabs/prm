<template lang="pug">
q-dialog(v-model="groupsDialog" persistent)
  q-card(style="width: 500px;")
    q-card-section.column.q-pb-none
      div.row.q-mb-md
        div.column
          span.text-h6 Select group
          span.text-caption.text-grey-6 Select group to add
        q-space
        div
          q-btn(dense flat round icon="mdi-close" @click="onCloseGroupsDialog")
      q-input(
        outlined
        dense
        hide-bottom-space
        placeholder="Search group"
        v-model="groupsSearchstring"
        :debounce="300"
      )
        template(#prepend)
          q-icon(name="mdi-magnify")
    q-card-section(style="max-height: 500px;").scroll
      q-list(separator padding)
        template(v-for="(group,ind) of groups" :key="ind")
          q-item(dense clickable @click="onAddGroup(group)")
            q-item-section
              q-item-label {{ group.name }}
              q-item-label(caption v-if="group.description").ellipsis {{ group.description }}

q-card(bordered flat style="min-height:135px")
  // loading
  template(v-if="loading")
    q-card-section.row.q-gutter-md
      div.col-shrink
        q-skeleton(width="100px" height="100px")
      div.col
        q-skeleton(width="300px" height="30px").q-mt-xs.q-mb-md
        q-skeleton(width="400px" height="15px").q-mb-sm
        q-skeleton(width="400px" height="15px")

  // not found
  template(v-else-if="!client")
    q-card-section.fit
      slot(name="no-data")
        div.column.fit.flex.flex-center.text-center
            div.text-h5 No client loaded
            div.caption.text-grey No client data to be shown

  // px header
  template(v-else)
    q-card-section.row.q-gutter-md
      div.col-shrink
        q-avatar(square style="height:100px; width: 100px;")
          img(alt="avatar" :src="avatar")
      div.col
        div.row.items-center
          div.text-h5 {{ fullname }}
          template(v-if="medicalRecordsUrl")
            div.q-ml-sm
              q-btn(flat dense size="xs" round icon="mdi-medical-bag" :href="medicalRecordsUrl" target="blank")
                q-tooltip View medical records
        div.row.q-gutter-lg
          div.column.q-gutter-xs
            div.row.items-center.text-grey-8
              q-tooltip Sex / Age
              q-icon(size="xs" name="mdi-account-outline").q-mr-sm
              span {{ sex }}
              span.q-mx-xs •
              span {{ age }}
            div.row.items-center.text-grey-8
              q-tooltip Date of birth
              q-icon(size="xs" name="mdi-cake").q-mr-sm
              span {{ dateOfBirth }}

          div.column.q-gutter-xs
            div.row.items-center.text-grey-8
              q-tooltip Email address
              q-icon(size="xs" name="mdi-email").q-mr-sm
              span {{ email }}
              q-popup-edit(v-model="email" v-slot="scope").bg-primary.text-white
                q-input(
                  dark
                  color="white"
                  v-model="scope.value"
                  dense
                  autofocus
                  @keyup.enter="scope.set"
                )
                  template(#append)
                    q-icon(name="mdi-pencil")
            div.row.items-center.text-grey-8
              q-tooltip Mobile No.
              q-icon(size="xs" name="mdi-cellphone").q-mr-sm
              span {{ mobileNo }}
              q-popup-edit(v-model="mobileNo" v-slot="scope").bg-primary.text-white
                q-input(
                  dark
                  color="white"
                  v-model="scope.value"
                  dense
                  autofocus
                  @keyup.enter="scope.set"
                )
                  template(#append)
                    q-icon(name="mdi-pencil")

          div.column.q-gutter-xs
            div.row.items-center.text-grey-8
              q-tooltip Blood type
              q-icon(size="xs" name="mdi-blood-bag").q-mr-sm
              span {{ bloodType }}
            div.row.items-center.text-grey-8
              q-tooltip Groups
              q-icon(size="xs" name="mdi-group").q-mr-sm
              template(v-for="(group,ind) of prmGroups")
                q-chip(color="blue-1").text-primary {{ group.name }}
                  q-btn(
                    flat
                    dense
                    round
                    size="xs"
                    color="negative"
                    icon="mdi-close"
                    @click="onDeleteGroup(group)"
                  ).q-ml-sm
              q-btn(
                flat
                dense
                round
                size="xs"
                icon="mdi-plus"
                @click="onOpenGroupsDialog"
              )

</template>

<script>
import placeholderAvatar from 'assets/placeholder-person.png';
import { ref, toRef, computed, watch } from 'vue';
import { capitalizeText, formatPersonName, formatDate, calculateAge } from 'boot/helpers';

export default {
  name: 'ClientHeader',
  props: {
    client: {
      type: [Object, null],
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    groups: {
      type: Array,
      default: () => [],
    },
    groupsLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'search-groups',
    'change-groups',
    'change-data',
  ],
  setup (props, ctx) {
    const client = toRef(props, 'client');
    const avatar = computed(() => client.value?.picURL || placeholderAvatar);
    const fullname = computed(() => formatPersonName(client.value?.name));
    const sex = computed(() => capitalizeText(client.value?.sex) || '-');
    const age = computed(() => calculateAge(client.value?.dateOfBirth) || '-');
    const dateOfBirth = computed(() => formatDate(client.value?.dateOfBirth) || '-');
    const bloodType = computed(() => client.value?.bloodType?.toUpperCase() || '-');
    const medicalRecordsUrl = computed(() => client.value?.medicalRecordsUrl || '');
    const mobileNo = computed({
      get: () => client.value?.mobileNo || '-',
      set: mobileNo => {
        if (!mobileNo) return;
        if (mobileNo.value === mobileNo) return;
        ctx.emit('change-data', { mobileNo });
      },
    });
    const email = computed({
      get: () => client.value?.email || '-',
      set: email => {
        if (!email) return;
        if (email.value === email) return;
        ctx.emit('change-data', { email });
      },
    });
    const prmGroups = computed(() => client.value?.prmGroups || []);

    const onAddGroup = data => {
      onCloseGroupsDialog();
      if (!data?.name) return;
      const existing = prmGroups.value.find(g => {
        if (data.id && g.id === data.id) return true;
        if (data.name === g.name) return true;
        return false;
      });
      if (existing) return;
      const items = prmGroups.value.concat(data);
      ctx.emit('change-groups', items);
    };
    const onDeleteGroup = item => {
      if (!item?.id) return;
      const items = prmGroups.value.filter(g => {
        if (item.id && g.id === item.id) return false;
        if (item.name === g.name) return false;
        return true;
      });
      ctx.emit('change-groups', items);
    };
    const groupsDialog = ref(false);
    const groupsSearchstring = ref('');
    watch(groupsSearchstring, val => {
      ctx.emit('search-groups', val);
    });
    const onOpenGroupsDialog = () => {
      groupsDialog.value = true;
    };
    const onCloseGroupsDialog = () => {
      groupsDialog.value = false;
    };

    return {
      avatar,
      fullname,
      sex,
      age,
      dateOfBirth,
      bloodType,
      medicalRecordsUrl,
      mobileNo,
      email,
      prmGroups,
      onAddGroup,
      onDeleteGroup,
      groupsDialog,
      groupsSearchstring,
      onOpenGroupsDialog,
      onCloseGroupsDialog,
    };
  },
};
</script>
