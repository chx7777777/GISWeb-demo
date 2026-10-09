export default function Pagination({ total, page, pageSize, onChange }: {
  total: number
  page: number
  pageSize: number
  onChange: (p: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const items: (number | '...')[] = []
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 2) items.push(i)
    else if (items[items.length - 1] !== '...') items.push('...')
  }
  return (
    <div className="pagination">
      <span className="pg-info">共 {total} 条</span>
      <span className={'pg-btn' + (page <= 1 ? ' disabled' : '')} onClick={() => page > 1 && onChange(page - 1)}>&lt;</span>
      {items.map((it, i) => it === '...'
        ? <span key={i} className="pg-btn disabled">…</span>
        : <span key={i} className={'pg-btn' + (it === page ? ' active' : '')} onClick={() => onChange(it)}>{it}</span>)}
      <span className={'pg-btn' + (page >= pages ? ' disabled' : '')} onClick={() => page < pages && onChange(page + 1)}>&gt;</span>
    </div>
  )
}
