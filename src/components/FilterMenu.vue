<template lang="pug">
q-btn(
  icon="mdi-filter"
  no-caps
  unelevated
  outline
  text-color="grey-6"
  v-bind="btnProps"
).bg-white
  template(v-if="!hideLabel")
    span.q-ml-sm.text-grey-8 Filter
  template(v-else-if="modelValue")
    span.q-ml-sm.text-grey-8 {{ modelValue.label }}
  q-menu(auto-close)
    q-list(style="min-width:220px;" dense padding)
      template(v-for="(filtergrp,ind) of options")
        div.subtitle1.text-grey-6.q-ml-sm.q-mb-sm {{ filtergrp.label }}
        template(v-for="(filteropt,ind) of filtergrp.options" :key="ind")
          q-item(clickable @click="setCurrentFilter(filteropt)")
            q-item-section
              div.row.items-center
                div(style="min-width: 20px;")
                  template(v-if="isCurrentFilter(filteropt)")
                    q-icon(name="mdi-check")
                span {{ filteropt.label }}
</template>

<script>
import { toRef, watch } from 'vue';

export default {
  name: 'FilterMenu',
  props: {
    modelValue: {
      type: [Object, null],
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    hideLabel: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    defaultFirst: {
      type: Boolean,
      default: false,
    },
    btnProps: {
      type: Object,
      default: () => ({ }),
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup (props, ctx) {
    const model = toRef(props, 'modelValue');

    const isCurrentFilter = (filteropt) => {
      const filter = model.value;
      if (!filter) return false;
      if (filter.value !== filteropt.value) return false;
      return true;
    };
    const setCurrentFilter = (filteropt) => {
      const val = isCurrentFilter(filteropt) ? null : filteropt;
      ctx.emit('update:modelValue', val);
    };

    const options = toRef(props, 'options');
    const defaultFirst = toRef(props, 'options');
    watch([options, defaultFirst], () => {
      if (model.value) return;
      if (!options.value?.[0]?.options?.[0]) return;
      if (!defaultFirst.value) return;
      setCurrentFilter(options.value[0].options?.[0]);
    });

    return {
      isCurrentFilter,
      setCurrentFilter,
    };
  },
};
</script>
