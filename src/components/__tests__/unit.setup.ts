import messages from '@intlify/unplugin-vue-i18n/messages'
import { config } from '@vue/test-utils'

config.global.mocks = {
  $t: (key: any) => key,
  $i18n: {
    locale: 'fr',
    messages
  }
}
