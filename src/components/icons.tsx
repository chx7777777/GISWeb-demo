/* 轻量内联 SVG 图标集 */
import React from 'react'

type P = { size?: number; color?: string; style?: React.CSSProperties }

const svg = (path: React.ReactNode, vb = '0 0 24 24') =>
  function Icon({ size = 16, color = 'currentColor', style }: P) {
    return (
      <svg width={size} height={size} viewBox={vb} fill="none" stroke={color}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
        {path}
      </svg>
    )
  }

export const IconCompass = svg(<><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></>)
export const IconFolder = svg(<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />)
export const IconFilePdf = svg(<><path d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" /><path d="M14 2v4h4" /><path d="M9 13h6M9 17h6" /></>)
export const IconImage = svg(<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M3 17l5-4 4 3 4-4 5 5" /></>)
export const IconFileOther = svg(<><path d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" /><path d="M14 2v4h4" /></>)
export const IconDb = svg(<><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>)
export const IconTrash = svg(<><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></>)
export const IconList = svg(<><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>)
export const IconDetail = svg(<><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>)
export const IconMap = svg(<><path d="M9 4l-5 2v14l5-2 6 2 5-2V4l-5 2-6-2z" /><path d="M9 4v14M15 6v14" /></>)
export const IconImport = svg(<><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M4 21h16" /></>)
export const IconAudit = svg(<><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" /><path d="M9 12l2 2 4-4" /></>)
export const IconExport = svg(<><path d="M12 15V3" /><path d="M7 8l5-5 5 5" /><path d="M4 21h16" /></>)
export const IconUpload = svg(<><path d="M12 16V4" /><path d="M6 10l6-6 6 6" /><path d="M4 20h16" /></>)
export const IconDownload = svg(<><path d="M12 4v12" /><path d="M6 10l6 6 6-6" /><path d="M4 20h16" /></>)
export const IconEye = svg(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>)
export const IconEdit = svg(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>)
export const IconClose = svg(<path d="M6 6l12 12M18 6L6 18" />)
export const IconPlus = svg(<path d="M12 5v14M5 12h14" />)
export const IconSearch = svg(<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>)
export const IconBell = svg(<><path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" /><path d="M10.3 21a2 2 0 0 0 3.4 0" /></>)
export const IconHelp = svg(<><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 5 .2c0 1.8-2.5 2.3-2.5 3.8" /><circle cx="12" cy="17" r="0.5" /></>)
export const IconScreen = svg(<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />)
export const IconMonitor = svg(<><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>)
export const IconChart = svg(<><path d="M3 21h18" /><path d="M6 16v-5M11 16V8M16 16v-8M21 16V5" /></>)
export const IconBox = svg(<><path d="M12 2l9 5v10l-9 5-9-5V7z" /><path d="M3 7l9 5 9-5M12 22V12" /></>)
export const IconLayer = svg(<><path d="M12 2l9 5-9 5-9-5z" /><path d="M3 12l9 5 9-5" /><path d="M3 17l9 5 9-5" /></>)
export const IconCalc = svg(<><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M8 6h8" /><path d="M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2" /></>)
export const IconReport = svg(<><path d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" /><path d="M14 2v4h4" /><path d="M8 12h8M8 16h8M8 8h3" /></>)
export const IconTemplate = svg(<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></>)
export const IconDrill = svg(<><path d="M12 2v6" /><path d="M8 8h8l-1 12a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" /><path d="M9 12h6M9.5 16h5" /></>)
export const IconAI = svg(<><rect x="5" y="5" width="14" height="14" rx="2" /><path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" /></>)
export const IconGlobe = svg(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c3 3.5 3 14.5 0 18-3-3.5-3-14.5 0-18z" /></>)
export const IconBack = svg(<><path d="M19 12H5" /><path d="M11 18l-6-6 6-6" /></>)
export const IconCheck = svg(<path d="M4 12l5 5L20 7" />)
export const IconMore = svg(<><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></>)
export const IconLocate = svg(<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="8" /></>)
export const IconMeasure = svg(<><path d="M3 17L17 3l4 4L7 21z" /><path d="M8 12l1.5 1.5M11 9l1.5 1.5M14 6l1.5 1.5" /></>)
export const IconTag = svg(<><path d="M20 12l-8 8-9-9V4h7z" /><circle cx="7.5" cy="7.5" r="1" /></>)
export const IconSlice = svg(<><path d="M4 4h16v16H4z" /><path d="M4 12h16M12 4v16" /></>)
export const IconWalk = svg(<><circle cx="13" cy="4" r="1.6" /><path d="M13 7l-3 5 2 3v6M10 12l-3 2M13 7l4 3" /></>)
export const IconReset = svg(<><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></>)
export const IconPlay = svg(<path d="M7 4l13 8-13 8z" />)
export const IconHome = svg(<><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>)
export const IconSetting = svg(<><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.4 2.6a7 7 0 0 0-2.1 1.2l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.5-2-1.5c.06-.4.1-.8.1-1.2z" /></>)
export const IconModel = svg(<><path d="M12 2l9 5-9 5-9-5z" /><path d="M3 12l9 5 9-5" /><path d="M3 17l9 5 9-5" /></>)
