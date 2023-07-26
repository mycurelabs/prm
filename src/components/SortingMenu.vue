<template lang="pug">
q-btn(
  icon="mdi-sort"
  no-caps
  unelevated
  outline
  text-color="grey-6"
  v-bind="btnProps"
).bg-white
  template(v-if="!hideLabel")
    span.q-ml-sm.text-grey-8 Sort
  template(v-else-if="modelValue")
    span.q-ml-sm.text-grey-8 {{ modelValue.label }}
  q-menu(auto-close)
    q-list(style="min-width:220px;" dense padding)
      template(v-for="(sortopt,ind) of options")
        q-item(clickable @click="setCurrentSorting(sortopt)")
          q-item-section
            div.row.items-center
              div(style="min-width: 20px;")
                template(v-if="isCurrentSorting(sortopt)")
                  q-icon(name="mdi-check")
              span {{ sortopt.label }}
</template>

<script>
import { toRef } from 'vue';

export default {
  name: 'SortingMenu',
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

    const isCurrentSorting = (sortopt) => {
      const sorting = model.value;
      if (!sorting) return false;
      if (sorting.field !== sortopt.field) return false;
      if (sorting.direction !== sortopt.direction) return false;
      return true;
    };
    const setCurrentSorting = (sortopt) => {
      ctx.emit('update:modelValue', sortopt);
    };

    return {
      isCurrentSorting,
      setCurrentSorting,
    };
  },
};
</script>
