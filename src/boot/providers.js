import { ref } from 'vue';
import { useSdk } from 'boot/sdk.js';
import { useActiveMembership } from 'boot/membership.js';
import { deepFreeze } from 'boot/helpers';

export function fetchProvider (type, opts) {
  opts = Object.assign({
    fetchImmediate: true,
  }, opts);

  const sdk = useSdk();
  const activeMembership = useActiveMembership();

  // default 0-credit system provider
  const defaultSystemProvider = deepFreeze({
    id: `system-${type}`,
    type: 'sms',
    label: `MYCURE ${type} provider`,
    defaultFrom: 'hello@mycure.md',
    isSystemProvider: true,
    creditsCount: 0,
  });

  // provide to use
  const formatProvider = provider => {
    if (!provider) return provider;
    if (provider.backendConfig) {
      provider.backendConfig = provider.backendConfig[provider.backend];
    }
    if (provider.emailConfig) {
      provider.defaultFrom = provider.emailConfig?.['defaultFrom']?.email;
      provider.defaultReplyTo = provider.emailConfig?.['defaultReplyTo']?.email;
    }
    return provider;
  };
  const loading = ref(false);
  const provider = ref(null);
  const fetchSystemProvider = async () => {
    const sub = await sdk.get('subscriptions', {
      organization: activeMembership.value.organization.id,
    });
    const creditsMax = sub?.[`${type}CreditsMax`] || 0;
    const creditsConsumed = sub?.[`${type}CreditsConsumed`] || 0;
    return Object.assign({}, defaultSystemProvider, {
      creditsCount: Math.max(0, creditsMax - creditsConsumed),
    });
  };
  const fetchProvider = async () => {
    loading.value = true;
    try {
      // get existing provider
      const query = {
        type,
        organization: activeMembership.value.organization.id,
      };
      const res = formatProvider(await sdk.get('prm/providers', query));

      // defaults to 0-credit system provider
      provider.value = res || await fetchSystemProvider();
    } finally {
      loading.value = false;
    }
  };
  if (opts.fetchImmediate) {
    fetchProvider().catch(error => {
      console.error(error);
      const errorHandler = opts.errorHandler;
      errorHandler?.(error);
    });
  }

  // for custom provider
  const createProvider = async (data) => {
    data = {
      ...data,
      organization: activeMembership.value.organization.id,
      type,
      backendConfig: {
        [data.backend]: data.backendConfig,
      },
    };
    if (data.emailConfig?.defaultFrom) {
      data.emailConfig.defaultFrom = { email: data.emailConfig.defaultFrom };
    }
    if (data.emailConfig?.defaultReplyTo) {
      data.emailConfig.defaultReplyTo = { email: data.emailConfig.defaultReplyTo };
    }
    const res = formatProvider(await sdk.create('prm/providers', data));
    provider.value = res;
  };

  // for custom provider
  const deleteProvider = async (item) => {
    if (!item?.id) throw new Error('Provider has no id');
    await sdk.delete('prm/providers', item.id);
    provider.value = await fetchSystemProvider();
  };

  // for system provider
  const topupProvider = async (item, credits) => {
    // TODO: implement
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return {
    loading,
    provider,
    fetchProvider,
    fetchSystemProvider,
    createProvider,
    deleteProvider,
    topupProvider,
  };
}
