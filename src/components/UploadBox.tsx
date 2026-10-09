import { useRef, useState } from 'react'
import { IconCheck, IconClose, IconUpload } from './icons'

export interface UploadFile { name: string; size: string }

function fmtSize(bytes: number) {
  if (bytes > 1024 * 1024 * 1024) return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
  if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  return Math.max(1, Math.round(bytes / 1024)) + ' KB'
}

export default function UploadBox({ accept, hint, onChange }: {
  accept?: string
  hint?: string
  onChange?: (files: UploadFile[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<UploadFile[]>([])

  const pick = (list: FileList | null) => {
    if (!list || !list.length) return
    const next = [...files, ...Array.from(list).map(f => ({ name: f.name, size: fmtSize(f.size) }))]
    setFiles(next)
    onChange?.(next)
  }

  const remove = (i: number) => {
    const next = files.filter((_, idx) => idx !== i)
    setFiles(next)
    onChange?.(next)
  }

  return (
    <div>
      <div className="upload-box" onClick={() => inputRef.current?.click()}>
        <div className="up-icon"><IconUpload size={26} /></div>
        <div>点击上传设计文件</div>
        <div className="f11 mt8">或拖拽文件到此处{hint ? ` · ${hint}` : ''}</div>
        <input ref={inputRef} type="file" accept={accept} multiple hidden
          onChange={e => { pick(e.target.files); e.target.value = '' }} />
      </div>
      {files.map((f, i) => (
        <div className="file-item" key={i}>
          <span className="fi-ok"><IconCheck size={14} /></span>
          <span className="fi-name">{f.name}</span>
          <span className="fi-size">{f.size}</span>
          <span className="fi-del" onClick={() => remove(i)}><IconClose size={14} /></span>
        </div>
      ))}
    </div>
  )
}
