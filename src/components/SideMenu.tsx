import React from 'react'
import { NavLink } from 'react-router-dom'

export interface SideMenuItem {
  to: string
  label: string
  icon?: React.ReactNode
  end?: boolean
}

export default function SideMenu({ title, items, children }: {
  title: string
  items: SideMenuItem[]
  children?: React.ReactNode
}) {
  return (
    <aside className="sidemenu">
      <div className="menu-title">{title}</div>
      {items.map(it => (
        <NavLink key={it.to} to={it.to} end={it.end as any}
          className={({ isActive }) => 'menu-item' + (isActive ? ' active' : '')}>
          {it.icon}{it.label}
        </NavLink>
      ))}
      {children}
    </aside>
  )
}
