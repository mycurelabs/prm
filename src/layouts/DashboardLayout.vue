<template lang="pug">
q-layout(view="lHh Lpr lff")
  // nav drawer
  q-drawer(mini dark show-if-above persistent).bg-grey-10
    // q-scroll-area.fit
    div.column.fit.justify-between.q-py-sm
      // app information
      div.col-shrink.items-center.column.q-gutter-sm
        img(alt="logo" src="~assets/logo.png" style="width: 100%; max-width: 38px; max-height: 38px;")

        // active membership selector
        drawer-active-membership-selector-btn

      // navigation
      div.col-shrink
        q-list(padding)
          template(v-for="(menu,i) in menus" :key="i")
            // separator
            template(v-if="menu.separator")
              q-separator

            // with submenus
            template(v-else-if="menu.children")
              q-expansion-item(
                expand-separator
                :default-opened="!i"
                :icon="menu.icon"
                :label="menu.title"
                :caption="menu.caption"
              )
                template(v-for="(submenu,j) in menu.children" :key="j")
                  q-item(:inset-level="1" clickable v-ripple :to="submenu.link")
                    q-item-section
                      q-item-label {{ submenu.title }}
                      q-item-label(caption) {{ submenu.caption }}

            // non-grouped
            template(v-else)
              q-item(clickable v-ripple :to="menu.link")
                q-item-section(avatar)
                  q-icon(:name="menu.icon")
                q-item-section
                  q-item-label {{ menu.title }}
                  q-item-label(caption) {{ menu.caption }}

      // bottom actions
      div.col-shrink.items-center.column.q-gutter-sm
        // TODO: custom action slot (from router named views)
        drawer-bottom-action

        // profile
        drawer-user-profile-btn

  // content
  q-page-container.bg-grey-1
    // plain content
    template(v-if="!hMenus.length")
      router-view

    // with horizontal menus
    template(v-else)
      q-page(padding)
        // page header
        template(v-if="hTitle")
          div.row.q-mb-sm
            // page title
            div.column
              span.text-h4 {{ hTitle }}
              template(v-if="hSubtitle")
                span.text-subtitle2.text-grey-6 {{ hSubtitle }}

        // horizontal navigation
        q-tabs(align="left" no-caps dense indicator-color="primary").text-grey-8
          template(v-for="(menu,ind) of hMenus" :key="ind")
            q-route-tab(:label="menu.title" :to="menu.link" exact)
        q-separator(size="1px").q-pa-none.q-mb-md

        // content
        router-view
</template>

<script>
import DrawerBottomAction from 'components/DrawerBottomAction.vue';
import DrawerActiveMembershipSelectorBtn from 'components/DrawerActiveMembershipSelectorBtn.vue';
import DrawerUserProfileBtn from 'components/DrawerUserProfileBtn.vue';
import placeholderImageForProfile from 'assets/placeholder-person.png';
import { useAppConstants, useNavMenus, useHNavMenus } from 'boot/app';

export default {
  name: 'DashboardLayout',
  components: {
    DrawerBottomAction,
    DrawerActiveMembershipSelectorBtn,
    DrawerUserProfileBtn,
  },
  setup () {
    const { appName, appVersion } = useAppConstants();
    const { menus } = useNavMenus();
    const { hTitle, hSubtitle, hMenus } = useHNavMenus();

    return {
      placeholderImageForProfile,
      appName,
      appVersion,
      menus,
      hTitle,
      hSubtitle,
      hMenus,
    };
  },
};
</script>
