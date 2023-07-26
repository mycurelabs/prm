<template lang="pug">
q-btn(dense flat round @click="onLoadMemberships")
  q-avatar
    img(:src="activeMembershipAvatar" style="width: 100%; max-width: 38px; max-height: 38px;")
    q-tooltip(anchor="bottom right" self="center right" :offset="[10,10]")
      strong {{ activeMembershipName }}
  q-menu(auto-close fit self="bottom right")
    q-card(style="width: 400px; max-width: 400px;")
      q-card-section.q-pa-none
        q-item
          q-item-section(top avatar)
            q-avatar
              img(:src="activeMembershipAvatar" style="width: 100%; max-width: 38px; max-height: 38px;")
          q-item-section
            q-item-label {{ activeMembershipName }}
            q-item-label(caption v-if="activeMembershipDescription").ellipsis {{ activeMembershipDescription }}
      q-separator
      q-linear-progress(v-if="membershipsLoading" indeterminate)
      q-card-section(style="max-height:300px;").q-pa-none.scroll
        q-list(style="min-width: 200px;")
          template(v-for="(mem,ind) of memberships" :key="ind")
            q-item(dense :inset-level="0" clickable @click="onSwitchActiveMembership(mem)")
              q-item-section(top avatar)
                q-avatar
                  img(:src="mem.avatar" style="width: 100%; max-width: 38px; max-height: 38px;")
              q-item-section
                q-item-label {{ mem.name }}
                q-item-label(caption v-if="mem.description").ellipsis {{ mem.description }}
</template>

<script>
import placeholderAvatar from 'assets/placeholder-facility.png';
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { useActiveMembership, useMemberships } from 'boot/membership';

export default {
  name: 'DrawerActiveMembershipSelectorBtn',
  setup () {
    const $q = useQuasar();

    const getMembershipAvatar = (membership) => membership.organization.picURL || placeholderAvatar;
    const getMembershipName = (membership) => membership.organization.name;
    const getMembershipDescription = (membership) => membership.organization.description;

    const activeMembership = useActiveMembership();
    const activeMembershipAvatar = computed(() => getMembershipAvatar(activeMembership.value));
    const activeMembershipName = computed(() => getMembershipName(activeMembership.value));
    const activeMembershipDescription = computed(() => getMembershipDescription(activeMembership.value));

    const membershipsDataset = useMemberships();
    const memberships = computed(() => membershipsDataset.items.value.map(item => ({
      membership: item,
      avatar: getMembershipAvatar(item),
      name: getMembershipName(item),
      description: getMembershipDescription(item),
    })));
    const onSwitchActiveMembership = async (mem) => {
      if (mem.membership.organization.id === activeMembership.value.organization.id) return;
      const dialogOpts = {
        title: 'Switch Facility',
        message: `Confirm switch to ${mem.name}? The app will reload after`,
        cancel: true,
        persistent: true,
      };
      $q.dialog(dialogOpts).onOk(async () => {
        $q.loading.show({
          message: `Switching facility to ${mem.name}...`,
          boxClass: 'bg-grey-2 text-grey-9',
          spinnerColor: 'primary',
        });
        try {
          // set current config
          await membershipsDataset.setActiveMembership(mem.membership);
          // reload app
          globalThis.location.reload();
        } catch (error) {
          console.error(error);
          $q.notify({
            type: 'negative',
            message: error.message || 'Failed to switch facility',
          });
        } finally {
          $q.loading.hide();
        }
      });
    };

    return {
      activeMembership,
      activeMembershipAvatar,
      activeMembershipName,
      activeMembershipDescription,
      memberships,
      membershipsLoading: membershipsDataset.loading,
      onLoadMemberships: membershipsDataset.fetchItems,
      onSwitchActiveMembership,
    };
  },
};
</script>
