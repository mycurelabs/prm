<template lang="pug">
q-btn(icon="mdi-calendar" :label="modelText" outline no-caps).bg-white
  q-popup-proxy(cover transition-show="scale" transition-hide="scale")
    q-card(flat)
      q-card-section(horizontal)
        q-list(style="width: 130px;")
          template(v-for="(lbl,ind) of labels" :key="ind")
            q-item(
              clickable
              v-ripple
              @click="onLabelSelected(lbl)"
              :active="label.key === lbl.key"
            )
              q-item-section {{ lbl.label }}
        q-separator(vertical)
        q-date(v-model="model" range)
</template>

<script>
import * as datefns from 'date-fns';
import { toRef, ref, watch, computed } from 'vue';
import { deepFreeze, formatDateRange } from 'boot/helpers';

export default {
  name: 'DateRangeFilter',
  props: {
    modelValue: {
      props: Object,
      required: true,
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup (props, ctx) {
    const modelInternal = ref({
      from: new Date(),
      to: new Date(),
    });
    const model = computed({
      get () {
        const from = datefns.format(modelInternal.value.from, 'yyyy/MM/dd');
        const to = datefns.format(modelInternal.value.to, 'yyyy/MM/dd');
        return { from, to };
      },
      set (val) {
        if (typeof val === 'string') {
          val = { from: val, to: val };
        }
        modelInternal.value = {
          from: new Date(val.from),
          to: new Date(val.to),
        };
        ctx.emit('update:modelValue', model.value);
      },
    });

    const baseDate = new Date();
    const labels = deepFreeze([
      {
        label: 'Today',
        key: 'today',
        from: baseDate,
        to: baseDate,
      },
      {
        label: 'Yesterday',
        key: 'yesterday',
        from: datefns.subDays(baseDate, 1),
        to: datefns.subDays(baseDate, 1),
      },
      {
        label: 'This week',
        key: 'current_week',
        from: datefns.startOfWeek(baseDate),
        to: datefns.endOfWeek(baseDate),
      },
      {
        label: 'Last week',
        key: 'last_week',
        from: datefns.startOfWeek(datefns.subWeeks(baseDate, 1)),
        to: datefns.endOfWeek(datefns.subWeeks(baseDate, 1)),
      },
      {
        label: 'This month',
        key: 'current_month',
        from: datefns.startOfMonth(baseDate),
        to: datefns.endOfMonth(baseDate),
      },
      {
        label: 'Last month',
        key: 'last_month',
        from: datefns.startOfMonth(datefns.subMonths(baseDate, 1)),
        to: datefns.endOfMonth(datefns.subMonths(baseDate, 1)),
      },
      {
        label: 'This year',
        key: 'current_year',
        from: datefns.startOfYear(baseDate),
        to: datefns.endOfYear(baseDate),
      },
      {
        label: 'Last year',
        key: 'last_year',
        from: datefns.startOfYear(datefns.subYears(baseDate, 1)),
        to: datefns.endOfYear(datefns.subYears(baseDate, 1)),
      },
    ]);

    watch(toRef(props, 'modelValue'), val => {
      if (!val) return;
      if (datefns.isSameDay(new Date(val.from), modelInternal.value.from) && datefns.isSameDay(new Date(val.to), modelInternal.value.to)) return;
      model.value = val;
    }, { immediate: true });

    const label = computed(() => {
      const from = modelInternal.value.from;
      const to = modelInternal.value.to;
      const label = labels.find(l => {
        const isWithinStart = datefns.isSameDay(l.from, from);
        const isWithinEnd = datefns.isSameDay(l.to, to);
        return isWithinStart && isWithinEnd;
      });
      return label || { label: 'Custom', key: 'custom' };
    });

    const modelText = computed(() => {
      if (label.value.key === 'custom') {
        return formatDateRange(model.value);
      }
      return label.value.label;
    });

    const onLabelSelected = (label) => {
      model.value = { from: label.from, to: label.to };
    };

    return {
      model,
      modelText,
      labels,
      label,
      onLabelSelected,
    };
  },
};
</script>
