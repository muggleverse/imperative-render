import { createApp, defineComponent, defineProps } from 'vue'
import type { Component } from 'vue'

import { imperativeRender, asyncImperativeRender } from '../node_modules/imperative-render/src/vue'
import type { ImperativeRenderController } from '../node_modules/imperative-render/src/vue'

const App = defineComponent({
  props: {
    controller: Object as () => ImperativeRenderController,
    name: '' as any,
  },

  setup(props) {
    props.controller!.waitUntil

    return () => {
      return <div></div>
    }
  },
})

imperativeRender(App, { name: '' })

const app = createApp(App, {})

app.mount('#app')
