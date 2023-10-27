<template lang="pug">
// dialogs
q-dialog(v-model="createDialog" persistent)
  // hide scroll in the email provider form
  email-provider-form(dialog @cancel="onCreateCancel" @save="onCreate")

// page header
div.row.q-mb-md
  div.column
    span.text-h6 Select Email Provider
    span.text-caption.text-grey-6 Manage your Email providers here

// set credit amount
q-dialog(v-model="creditsDialog" persistent)
  credit-purchase-dialog(
    @close="creditsDialog = false"
    @purchase="processPurchase"
  )

// providers
q-card(bordered flat)
  // loading
  template(v-if="loading")
    q-card-section.row.q-col-gutter-md
      div.col-xs-12.col-sm-6
        q-skeleton(height="200px" square)
      div.col-xs-12.col-sm-6
        q-skeleton(height="200px" square)

  // custom provider
  template(v-else-if="!provider.isSystemProvider")
    q-card-section.row.q-col-gutter-md
      div.col-xs-12.col-sm-6
        q-card(bordered flat style="height:180px;").bg-grey-1.text-grey
          q-card-section.row.items-start.q-pl-xs.q-pt-md.q-pr-md
            q-radio(v-model="selected" val="system").q-pr-md
            div.column.q-pt-xs
              q-avatar(rounded size="lg" :style="{ width: '50px' }").bg-white
                  q-img(src="../assets/logo.png" :style="{ width: '50%' }")
              span.text-h6.text-weight-bolder MYCURE Email provider
              span.text-body2.text-weight-medium {{ systemProvider?.defaultFrom || 'hello@mycure.md' }}
            //- span.text-subtitle2.text-grey-6 This is a backend provided by the system if you have enough credits. Delete your custom provider to use it
            q-space
            q-btn(flat unelevated dense icon="mdi-dots-vertical" disabled size="md")
              q-menu(:offset="[185,0]")
                q-list( :style="{'min-width': '220px'}")
                  q-item(clickable v-close-popup @click="onCreateBtnClick(true)")
                    q-item-section Edit
          q-card-section.row.items-center.q-pr-md
            span.subtitle2.text-grey {{ systemProvider?.creditsCount || '0' }} Credits
            q-space
            q-btn(flat unelevated dense no-caps type="a" disabled) Buy more credits

      div.col-xs-12.col-sm-6
        q-card(bordered flat style="height:180px;").bg-blue-1.text-primary
          q-card-section.row.items-start.q-pl-xs.q-pt-md.q-pr-md
            q-radio(v-model="selected" val="custom_provider").q-pr-md
            div.column.q-pt-xs
              q-avatar(rounded size="lg" :style="{ width: '50px' }").bg-white
                q-img(v-if="provider.backend === 'sendgrid'" src="../assets/sendgrid-logo.svg" :style="{ width: '50%' }")
                q-img(v-else-if="provider.backend === 'globelabs'" src="../assets/globe-labs-logo.jpeg" :style="{ width: '50%' }")
                q-img(v-else-if="provider.backend === 'twilio'" src="../assets/twilio-logo.png" :style="{ width: '50%' }")
                q-img(v-else src="../assets/logo.png" :style="{ width: '50%' }")
              span.text-h6.text-weight-bolder {{ provider.label }}
              span.text-body2.text-weight-medium {{ provider.defaultFrom || provider.backend }}
            q-space
            div.row.items-center
              q-btn(flat unelevated dense icon="mdi-dots-vertical" size="md")
                q-menu(:offset="[185,0]")
                  q-list( :style="{'min-width': '220px'}")
                    q-item(clickable v-close-popup @click="onCreateBtnClick(true)")
                      q-item-section Edit
                    q-item(clickable v-close-popup @click="onDelete(provider)")
                      q-item-section Delete
                        //- q-icon(name="mdi-delete" color="negative")
          q-card-section.row.items-center.q-pr-md
            span.subtitle2.text-grey {{ provider?.creditsCount || '0' }} Credits
            q-space
            q-btn(flat unelevated dense no-caps type="a") Buy more credits

  // system provider
  template(v-else)
    q-card-section.row.q-col-gutter-md
      div.col-xs-12.col-sm-6
        q-card(bordered flat style="height:180px;").bg-blue-1.text-primary
          q-card-section.row.items-start.q-pl-xs.q-pt-md.q-pr-md
            q-radio(v-model="selected" val="system").q-pr-md
            div.column.q-pt-xs
              q-avatar(rounded size="lg" :style="{ width: '50px' }").bg-white
                q-img(src="../assets/logo.png" :style="{ width: '50%' }")
              span.text-h6 MYCURE Email provider
              span.text-body2.text-weight-medium {{ systemProvider?.defaultFrom || 'hello@mycure.md' }}
              //- span.text-subtitle1.text-grey-6 This is a backend provided by the system if you have enough credits
            q-space
            q-btn(flat unelevated dense icon="mdi-dots-vertical" disabled size="md")
              q-menu(:offset="[185,0]")
                q-list( :style="{'min-width': '220px'}")
                  q-item(clickable v-close-popup @click="onCreateBtnClick(true)")
                    q-item-section Edit

          q-card-section.row.items-center.q-pr-md
            span.subtitle2.text-grey {{ provider.creditsCount }} Credits
            q-space
            q-btn(flat unelevated dense no-caps type="a" @click.stop="openCreditsDialog") Buy more credits
            // div
              q-btn(
                no-caps
                flat
                icon="mdi-plus"
                label="Top up"
                color="primary"
              )

      div.col-xs-12.col-sm-6
        q-card(bordered flat style="height:180px;")
          q-card-section.fit.flex.flex-center.column.text-center
            div.text-h6 Configure a custom provider
            div.text-subtitle2 Configure your own custom provider
            div.q-mt-sm
              q-btn(
                no-caps
                icon="mdi-plus"
                label="Create custom provider"
                color="primary"
                @click="onCreateBtnClick"
              )
</template>

<script>
import EmailProviderForm from 'components/EmailProviderForm.vue';
import CreditPurchaseDialog from 'components/CreditPurchaseDialog.vue';
import { ref, onMounted, watch, toRef } from 'vue';
import { fetchProvider } from 'boot/providers';
import { handleAction } from 'boot/helpers';

export default {
  name: 'SettingsEmail',
  components: {
    CreditPurchaseDialog,
    EmailProviderForm,
  },
  setup () {
    // data
    const dataset = fetchProvider('email');
    const systemDataset = dataset.fetchSystemProvider();
    const selected = ref(null)

    // actions
    const createDialog = ref(false);
    const creditsDialog = ref(false);
    const onCreateBtnClick = () => {
      createDialog.value = true;
    };
    const onCreateCancel = () => {
      createDialog.value = false;
    };
    const onEditBtnClick = () => {
      createDialog.value = true;
    }
    const onCreate = handleAction(async (data) => {
      await dataset.createProvider(data);
      createDialog.value = false;
    }, {
      confirm: false,
      errorPrefix: 'Failed to create custom provider',
      loaderMessage: 'Creating custom provider...',
    });
    const onDelete = handleAction(dataset.deleteProvider, {
      errorPrefix: 'Failed to delete provider',
      loaderMessage: item => `Deleting ${item.label} provider...`,
      confirmMessage: item => `Would you like to delete ${item.label} provider? This action cannot be reversed`,
    });

    onMounted(() => {
      console.warn('DATASET-PROVIDER', dataset.provider)
      if (dataset.provider.backend !== 'system') {
        selected.value = 'custom_provider';
      } else {
        selected.value = 'system';
      }
    })

    const openCreditsDialog = () => {
      creditsDialog.value = true;
    }
    const processPurchase = (creditsForPurchase) => {
      const topupProvider = dataset.topupProvider;
      topupProvider('email', creditsForPurchase.value);
    }

    return {
      loading: dataset.loading,
      provider: dataset.provider,
      systemProvider: systemDataset.provider,
      selected,

      createDialog,
      creditsDialog,
      onCreateBtnClick,
      onEditBtnClick,
      onCreateCancel,
      onCreate,
      onDelete,
      openCreditsDialog,
      processPurchase,
    };
  },
};
</script>
