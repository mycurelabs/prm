<template lang="pug">
q-card(style="width: 400px")
  q-card-section.row.justify-between.q-pb-sm
    div.column
      span.text-h6 Add credits
      span.text-caption.text-grey-6 Input the number of credits for purchase.
    q-space
    q-btn(dense flat round icon="mdi-close" @click.stop="onClose" style="height: 25px")
  q-card-section.q-pa-none.q-pb-md
    q-input(
      v-model.number="creditsForPurchase"
      type="number"
      label="Credits"
    ).q-px-md.q-pt-none
    //- span.q-px-md.text-weight-normal.text-caption Max amount
  q-card-actions.row.justify-end.q-gutter-xs.bg-grey-2.q-pr-md
    q-btn(
      unelevated
      no-caps
      color="primary"
      @click.stop="onPurchase"
    ) Purchase
</template>

<script>
import { ref } from 'vue'; 

export default {
  props: {
    dialog: {
      type: Boolean,
      default: false,
    }
  },
  setup (props, { emit }) {
    const dialog = ref(props.creditsDialog);
    const creditsForPurchase = ref(0);

    const onPurchase = () => {
      emit('purchase', creditsForPurchase)
      dialog.value = false
    }

    const onClose = () => {
      emit('close')
    }

    return {
      dialog,
      creditsForPurchase,
      onPurchase,
      onClose,
    }
  }
}

</script>