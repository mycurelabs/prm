import { computed } from 'vue';
import { Cookies } from 'quasar';
import { useRouter, useRoute } from 'vue-router';

export const COOKIE_KEY_LINK_CMS_APP = 'hh_link_cms_app';
export const COOKIE_KEY_LINK_SUPPORT_PAGE = 'hh_link_support_page';
export const COOKIE_KEY_LINK_FACEBOOK = 'hh_link_facebook';
export const COOKIE_KEY_LINK_LINKEDIN = 'hh_link_linkedin';
export const COOKIE_KEY_LINK_TWITTER = 'hh_link_twitter';
export const COOKIE_KEY_LINK_INSTAGRAM = 'hh_link_instagram';
export const COOKIE_KEY_LINK_YOUTUBE = 'hh_link_youtube';

/**
 * @typedef {object} res
 * @property {string} appName
 * @property {string} appVersion
 *
 * Vue composable to access the app metadata
 *
 * @returns {res}
 */
export function useAppConstants () {
  const appName = process.env.APP_NAME || 'PRM';
  const appVersion = process.env.APP_VERSION || 'development';
  const linkCMSApp = Cookies.get(COOKIE_KEY_LINK_CMS_APP) || process.env.APP_LINK_CMS_APP;
  const linkSupportPage = Cookies.get(COOKIE_KEY_LINK_SUPPORT_PAGE) || process.env.APP_LINK_SUPPORT_PAGE;
  const linkFacebook = Cookies.get(COOKIE_KEY_LINK_FACEBOOK) || process.env.APP_LINK_FACEBOOK;
  const linkLinkedin = Cookies.get(COOKIE_KEY_LINK_LINKEDIN) || process.env.APP_LINK_LINKEDIN;
  const linkTwitter = Cookies.get(COOKIE_KEY_LINK_TWITTER) || process.env.APP_LINK_TWITTER;
  const linkInstagram = Cookies.get(COOKIE_KEY_LINK_INSTAGRAM) || process.env.APP_LINK_INSTAGRAM;
  const linkYoutube = Cookies.get(COOKIE_KEY_LINK_YOUTUBE) || process.env.APP_LINK_YOUTUBE;
  return {
    appName,
    appVersion,
    linkCMSApp,
    linkSupportPage,
    linkFacebook,
    linkLinkedin,
    linkTwitter,
    linkInstagram,
    linkYoutube,
  };
}

/**
 * TODO: document this
 *
 * @typedef {object} res
 * @property {Array<Menu>} menus
 *
 * Vue composable to get the menus declared
 * from the route list
 *
 * @returns {res}
 */
export function useNavMenus () {
  const router = useRouter();

  // generate menus list from the routes list
  const menusGroups = router.getRoutes().reduce((menus, r) => {
    if (r.meta?.navGroup) {
      menus[r.meta.navGroup] = Object.assign(menus[r.meta.navGroup] || {}, {
        title: r.meta.navTitle || r.meta.title || r.meta.navGroup,
        caption: r.meta.navDescription || r.meta.description,
        icon: r.meta.navIcon,
        link: r.path,
      });
    }
    if (r.meta?.navItem) {
      menus[r.meta.navItem] = Object.assign({ children: [] }, menus[r.meta.navItem]);
      menus[r.meta.navItem].children.push({
        title: r.meta.navTitle || r.meta.title,
        caption: r.meta.navDescription || r.meta.description,
        link: r.path,
        icon: r.meta.navIcon,
      });
    }
    return menus;
  }, {});
  const defaultMenus = menusGroups.default?.children || [];
  delete menusGroups.default;
  const menus = Object.keys(menusGroups).reduce((m, k) => m.concat(menusGroups[k]), defaultMenus);

  return {
    menus,
  };
}

/**
 * Retrieve the horizontal menus for the current route
 *
 * Usage:
 *
 * - Mark parent route as meta.hNavParent. This is important as without
 *   this, children declared as horizonal menus will not be detected
 * - Mark horizontal menus with meta.hNavTitle to be considered
 *
 * Example:
 *
 * {
 *    path: '/main-menu',
 *    meta: {
 *      hNavParent: true,
 *      hNavTitle: 'Group header/title',
 *      hNavSubtitle: 'Some description/subtitle',
 *    },
 *    children: [
 *      {
 *        path: '/submenu-01',
 *        meta: {
 *          hNavTitle: 'Horizontal menu 01',
 *        },
 *      },
 *      {
 *        path: '/submenu-02',
 *        meta: {
 *          hNavTitle: 'Horizontal menu 02',
 *        },
 *      }
 *    ],
 * }
 *
 *
 * @typedef {object} res
 * @property {Array<Menu>} menus
 *
 * Vue composable to get the horizontal menus declared
 * from the current parentt route
 *
 * @returns {res}
 */
export function useHNavMenus () {
  const route = useRoute();

  // retrieve horizontal menus container
  const hParent = computed(() => route.matched.find(r => r.meta?.hNavParent && r.meta.hNavTitle));
  const hTitle = computed(() => hParent?.value.meta.hNavTitle);
  const hSubtitle = computed(() => hParent?.value.meta.hNavSubtitle);

  // build horizontal menus
  const hMenus = computed(() => {
    const children = hParent.value?.children?.filter(r => r.meta?.hNavTitle) || [];
    return children.map(r => ({
      title: r.meta.hNavTitle,
      icon: r.meta.hNavIcon,
      link: r.path,
    }));
  });

  return {
    hTitle,
    hSubtitle,
    hMenus,
  };
}
