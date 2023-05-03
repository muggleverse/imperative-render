import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'

import { Button, Modal } from 'antd'

import {
  imperativeRender,
  asyncImperativeRender,
  ImperativeRenderProps,
} from './node_modules/imperative-render/src/react'

type Props = ImperativeRenderProps & {
  title: string
}
const YourComponent = ({ controller, title }: Props) => {
  return (
    <Modal
      title={`${controller.index}. ${title}`}
      open={controller.active}
      onOk={() => {
        controller.resolve('fire onOk')
      }}
      onCancel={() => {
        controller.reject('fire onCancel')
      }}
      // afterClose={controller.destroy}
    >
      无敌的凯之巨人
      <Button
        onClick={async () => {
          const r = await controller.waitUntil(
            asyncImperativeRender(YourComponent, { title: 'asyncImperativeRender modal' }),
          )
          console.log('r', r)
        }}
      >
        自由
      </Button>
    </Modal>
  )
}

function App() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
      <Button
        onClick={() => {
          const instance = imperativeRender(YourComponent, { title: 'imperativeRender modal' })
          console.log('imperativeRender', instance)
          instance.promise.then(console.info).catch(console.warn)
        }}
      >
        imperativeRender modal
      </Button>
      <Button
        onClick={async () => {
          const value = await asyncImperativeRender(YourComponent, { title: 'asyncImperativeRender modal' })
          console.info('imperativeRender', value)
        }}
      >
        asyncImperativeRender modal
      </Button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
