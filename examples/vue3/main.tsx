import { createApp, defineComponent } from 'vue'

import { imperativeRender, asyncImperativeRender } from './node_modules/imperative-render/src/vue'
import type { ImperativeRenderController } from './node_modules/imperative-render/src/vue'
import { NButton, NCard, NModal } from 'naive-ui'

const YourComponent = defineComponent({
  props: {
    controller: Object as () => ImperativeRenderController<string>,
    title: String,
  },
  setup(props) {
    const controller = props.controller!
    console.log('controller', controller)

    return () => {
      return (
        <NModal show={controller.active.value}>
          <NCard title={`${controller.index}. ${props.title}`} style={{ width: '50vw' }}>
            <p>无敌的凯之巨人</p>
            <NButton
              onClick={() => {
                controller.waitUntil(asyncImperativeRender(YourComponent, { title: '套中套' })).then(console.info)
              }}
            >
              再开一个
            </NButton>
            <NButton onClick={() => controller.resolve('fire onCancel')}>resolve</NButton>
            <NButton onClick={() => controller.reject('fire onCancel')}>reject</NButton>
          </NCard>
        </NModal>
      )
    }
  },
})

const App = defineComponent({
  setup(props) {
    return () => {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
          <NButton
            secondary
            onClick={() => {
              imperativeRender(YourComponent, { title: '神罗天征' })
            }}
          >
            神罗天征
          </NButton>
        </div>
      )
    }
  },
})

createApp(App).mount('#app')
