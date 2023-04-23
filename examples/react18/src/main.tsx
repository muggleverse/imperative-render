import ReactDOM from 'react-dom/client'
import { StrictMode, useState } from 'react'

import { Button, Modal } from 'antd'

import { imperativeRender, asyncImperativeRender } from '../node_modules/imperative-render/src/react'

type Props = {
  resolve: (value: any) => void
  reject: (reason?: any) => void
  close: () => void
}

const CustomModal = ({ resolve, reject, close }: Props) => {
  return (
    <Modal
      onOk={() => {
        resolve('ok')
      }}
      onCancel={() => {
        reject('cancel')
      }}
      afterClose={close}
    >
      无敌的凯之巨人
    </Modal>
  )
}

function App() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
      <Button onClick={() => {}}>imperativeRender modal</Button>
      <Button onClick={() => {}}>asyncImperativeRender modal</Button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
