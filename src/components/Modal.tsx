import React from 'react'
import { IconClose } from './icons'

export default function Modal({ open, title, width, onClose, footer, children }: {
  open: boolean
  title: string
  width?: number
  onClose: () => void
  footer?: React.ReactNode
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" style={width ? { width } : undefined} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          {title}
          <span className="modal-close" onClick={onClose}><IconClose size={16} /></span>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function ConfirmModal({ open, title = '删除确认', content, onCancel, onOk }: {
  open: boolean
  title?: string
  content: string
  onCancel: () => void
  onOk: () => void
}) {
  return (
    <Modal open={open} title={title} width={400} onClose={onCancel}
      footer={<>
        <button className="btn btn-ghost" onClick={onCancel}>取消</button>
        <button className="btn btn-danger" onClick={onOk}>确认删除</button>
      </>}>
      <div className="t2" style={{ lineHeight: 1.8 }}>{content}</div>
    </Modal>
  )
}
