<template lang="pug">
q-layout(view="lHh Lpr lff")
  slot(name="header")

  slot(name="content")
    q-page-container
      router-view

  slot(name="footer")
    q-footer.bg-grey-2
      // full screen (>= sm)
      q-toolbar.gt-xs.text-grey-6.q-px-xl
        div © {{ currentYear }} {{ appName }}. All rights reserved.

        q-space

        template(v-for="(soc,ind) of socials" :key="ind")
          q-btn(
            flat
            round
            dense
            :icon="soc.icon"
            :href="soc.link"
            target="blank"
          )

      // small screen (xs)
      q-toolbar.lt-sm.text-grey-6.q-px-sm.q-py-md.column
        div © {{ currentYear }} {{ appName }}. All rights reserved.

        div.row
          template(v-for="(soc,ind) of socials" :key="ind")
            q-btn(
              flat
              round
              dense
              :icon="soc.icon"
              :href="soc.link"
              target="blank"
            )
</template>

<script>
import { useAppConstants } from 'boot/app';
export default {
  name: 'PlainLayout',
  setup () {
    const currentYear = new Date().getFullYear();
    const {
      appName,
      linkFacebook,
      linkLinkedin,
      linkTwitter,
      linkInstagram,
      linkYoutube,
    } = useAppConstants();
    const socials = [
      {
        icon: 'mdi-facebook',
        link: linkFacebook,
      },
      {
        icon: 'mdi-linkedin',
        link: linkLinkedin,
      },
      {
        icon: 'mdi-twitter',
        link: linkTwitter,
      },
      {
        icon: 'mdi-instagram',
        link: linkInstagram,
      },
      {
        icon: 'mdi-youtube',
        link: linkYoutube,
      },
    ].filter(s => s.link);

    return {
      currentYear,
      appName,
      socials,
    };
  },
};
</script>
