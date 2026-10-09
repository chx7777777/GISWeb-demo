import { NavLink } from 'react-router-dom'
import { IconBell, IconCompass, IconHelp, IconMonitor, IconScreen } from './icons'

const navs = [
  { to: '/', label: '首页', end: true },
  { to: '/data', label: '资料管理' },
  { to: '/borehole', label: '钻孔管理' },
  { to: '/model', label: '地层模型' },
  { to: '/earthwork', label: '土方计算' },
  { to: '/report', label: '成果报告' },
]

export default function TopNav() {
  return (
    <header className="topnav">
      <div className="logo"><IconCompass size={26} color="#6ea0ff" /></div>
      <div>
        <div className="sys-title">地质地信一体化平台</div>
        <div className="sys-sub">基于多模态AI的地质PDF智能入库与三维分层地质建模及土方量自动测算系统</div>
      </div>
      <nav className="nav-items">
        {navs.map(n => (
          <NavLink key={n.to} to={n.to} end={n.end as any}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="nav-right">
        <span className="cur-project">当前项目：<b>广州港南沙港区航道治理工程</b></span>
        <span className="icon-btn"><IconScreen size={17} /></span>
        <span className="icon-btn"><IconMonitor size={17} /></span>
        <span className="icon-btn"><IconBell size={17} /><span className="dot">2</span></span>
        <span className="icon-btn"><IconHelp size={17} /></span>
        <span className="avatar"><span className="circle">ad</span>admin</span>
      </div>
    </header>
  )
}
