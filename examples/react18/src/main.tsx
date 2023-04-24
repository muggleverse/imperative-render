import ReactDOM from 'react-dom/client'
import { StrictMode, useState } from 'react'

import { Button, Modal } from 'antd'

import { imperativeRender, asyncImperativeRender, ImperativeRenderProps } from '../node_modules/imperative-render/src/react'

type Props = ImperativeRenderProps & {
  title: string
}
const CustomModal = ({ controller, title }: Props) => {
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
          controller.setActive(false)
          const value = await asyncImperativeRender(CustomModal, { title: 'asyncImperativeRender modal' })
          console.info('imperativeRender', value)
          controller.setActive(true)
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
          const instance = imperativeRender(CustomModal, { title: 'imperativeRender modal' })
          console.log('imperativeRender', instance)
          instance.promise.then(console.info).catch(console.warn)
        }}
      >
        imperativeRender modal
      </Button>
      <Button
        onClick={async () => {
          try {
            const value = await asyncImperativeRender(CustomModal, { title: 'asyncImperativeRender modal' })
            console.info('imperativeRender', value)
          } catch (error) {
            console.warn('imperativeRender', error)
          }
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
