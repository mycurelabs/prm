<template lang="pug">
q-page(padding).column.q-gutter-y-md
  // page header
  div.row.items-center
    // page title
    div
      span.text-h4 Overview
      br
      span.text-subtitle2.text-grey-6 An overview of your facility's PRM

    q-space

    // date filter
    div
      date-range-filter(v-model="dateRange")

  // content
  div
    div.row.q-col-gutter-md.justify-center
      // upper cards
      div.col-12.row.q-col-gutter-md
        div.col-xs-12.col-md-6
          q-card(flat bordered style="min-height: 180px; max-height: 180px;")
            q-card-section
              span.text-h6 Total interactions
            q-card-section
              span.text-h3.text-weight-medium {{ statsByMessageTypeTotal }}
        template(v-for="(stats,ind) of statsByMessageType" :key="ind")
          // div.col-xs-12.col-sm-4.col-md-2
          div.col-xs-12.col-sm-4.col-md-3
            q-card(flat bordered style="min-height: 180px; max-height: 180px;")
              q-card-section
                span.text-h6 {{ stats.type.label }} Sent
              q-card-section(:class="{[`text-${stats.type.color}`]: 1}").row.items-start
                q-icon(name="mdi-email-outline" size="md").q-mr-md
                span.text-h3.text-weight-medium {{ stats.total }}

      // specifics
      div.col-12.row.q-col-gutter-md
        div.col-xs-12.col-md-4
          q-card(flat bordered style="min-height: 524px;").fit
            // empty state
            template(v-if="!interactions.length")
              q-card-section.column.fit.justify-center
                div.column.text-center
                  img(alt="no-interactions" src="~assets/no-interactions-art.png" style="width: 150px;").q-mx-auto
                  span.text-h6 This is where you can view your recent conversations
                  span.text-subtitle1 You can create a new message
                  div
                    q-btn(outlined color="primary" no-caps) Create a New Message

            // render interactions
            template(v-else)
              q-card-section
                span.text-h6 Latest Interactions
              q-card-section
                div.column.fit.justify-between
                  template(v-for="(inter,ind) of interactions" :key="ind")
                    div.col
                      q-item(clickable :to="inter.link").col
                        q-item-section(top avatar)
                          q-avatar(rounded)
                            img(:src="inter.subjectAvatar" style="width: 100%; max-width: 50px; max-height: 50px;")
                        q-item-section
                          q-item-label {{ inter.subjectFullname }}
                          q-item-label(:class="{[`text-${inter.messageType.color}`]: 1}")
                            q-icon(:name="inter.messageType.icon")
                            |
                            | {{ inter.messageType.label }}
                        q-item-section(side top)
                          q-item-label {{ inter.messageDate }}
                          q-item-label(caption) {{ inter.messageTime }}

        div.col
          q-card(flat bordered style="min-height: 524px;").fit
            q-card-section
              span.text-h6 Activity Summary
            q-card-section.fit
              apex-chart(
                height="400px"
                width="100%"
                type="bar"
                :options="histogramOpts"
                :series="histogramData"
              )
</template>

<script>
import ApexChart from 'vue3-apexcharts';
import placeholderAvatar from 'assets/placeholder-person.png';
import DateRangeFilter from 'components/DateRangeFilter.vue';
import { computed } from 'vue';
import { formatDate, formatTimeAgo, formatPersonName } from 'boot/helpers';
import { fetchConversations, fetchConversationsStats, MESSAGE_TYPES, MESSAGE_TYPES_MAP } from 'boot/conversations';
import { colors } from 'quasar';

const MONTHS = [
  { key: 'jan', label: 'Jan' },
  { key: 'feb', label: 'Feb' },
  { key: 'mar', label: 'Mar' },
  { key: 'apr', label: 'Apr' },
  { key: 'may', label: 'May' },
  { key: 'jun', label: 'Jun' },
  { key: 'jul', label: 'Jul' },
  { key: 'aug', label: 'Aug' },
  { key: 'sep', label: 'Sep' },
  { key: 'oct', label: 'Oct' },
  { key: 'nov', label: 'Nov' },
  { key: 'dec', label: 'Dec' },
];

export default {
  name: 'DashboardOverviewPage',
  components: {
    ApexChart,
    DateRangeFilter,
  },
  setup () {
    // stats data
    const stats = fetchConversationsStats(null, { fetchImmediate: true });

    const histogramOpts = {
      chart: {
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 10,
          columnWidth: '30%',
        },
      },
      legend: {
        floating: true,
        position: 'top',
        horizontalAlign: 'right',
      },
      colors: MESSAGE_TYPES.map(m => colors.getPaletteColor(m.color)),
    };
    const histogramData = computed(() => stats.statsByMessageType.value.map(s => {
      // ensure to display every month
      const data = MONTHS.map(m => {
        const y = s.histogram.find(h => h.key === m.key)?.count || 0;
        return { x: m.label, y };
      });
      return { name: s.type.label, data };
    }));

    // latest interactions
    const dataset = fetchConversations({ fetchImmediate: true, limit: 7 });
    const interactions = computed(() => dataset.items.value.map(item => ({
      ...item,
      message: item.lastMessage?.message,
      messageDate: formatDate(item.lastMessage?.createdAt, 'MMMM dd, yyyy'),
      messageTime: formatDate(item.lastMessage?.createdAt, 'hh:mm a'),
      messageTimeAgo: formatTimeAgo(item.lastMessage?.createdAt),
      messageType: MESSAGE_TYPES_MAP[item.lastMessage?.type || 'chat'],
      subjectAvatar: item.subject.picURL || placeholderAvatar,
      subjectFullname: item.subjectType === 'group' ? `${item.subject.name} (group)` : formatPersonName(item.subject.name),
      link: { name: 'inbox-conversation', params: { id: item.id } },
    })));

    return {
      dateRange: stats.dateRange,
      statsByMessageType: stats.statsByMessageType,
      statsByMessageTypeTotal: stats.statsByMessageTypeTotal,
      histogramOpts,
      histogramData,
      interactions,
    };
  },
};
</script>
