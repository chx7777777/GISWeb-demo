import { Navigate, Route, Routes } from 'react-router-dom'
import TopNav from './components/TopNav'
import Home from './pages/Home'
import DataLayout, { DataLibrary, PdfAI, DataSimple } from './pages/data/DataPages'
import BoreholeLayout, { BoreholeList, BoreholeDetail, BoreholeImport, BoreholeSimple } from './pages/borehole/BoreholePages'
import ModelLayout, { ModelOverview, ModelSection, ModelSimple } from './pages/model/ModelPages'
import Earthwork from './pages/Earthwork'
import ReportLayout, { ReportList, ReportSimple } from './pages/report/ReportPages'

export default function App() {
  return (
    <div className="app-shell">
      <TopNav />
      <div className="app-body">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/data" element={<DataLayout />}>
            <Route index element={<Navigate to="/data/library" replace />} />
            <Route path="library" element={<DataLibrary />} />
            <Route path="pdf" element={<PdfAI />} />
            <Route path="image" element={<DataSimple kind="影像文件" />} />
            <Route path="records" element={<DataSimple kind="入库记录" />} />
            <Route path="recycle" element={<DataSimple kind="回收站" />} />
          </Route>
          <Route path="/borehole" element={<BoreholeLayout />}>
            <Route index element={<Navigate to="/borehole/list" replace />} />
            <Route path="list" element={<BoreholeList />} />
            <Route path="detail/:id" element={<BoreholeDetail />} />
            <Route path="import" element={<BoreholeImport />} />
            <Route path="audit" element={<BoreholeSimple kind="钻孔审核" />} />
            <Route path="export" element={<BoreholeSimple kind="钻孔导出" />} />
            <Route path="recycle" element={<BoreholeSimple kind="回收站" />} />
          </Route>
          <Route path="/model" element={<ModelLayout />}>
            <Route index element={<ModelOverview />} />
            <Route path="section" element={<ModelSection />} />
            <Route path=":sub" element={<ModelSimple />} />
          </Route>
          <Route path="/earthwork" element={<Earthwork />} />
          <Route path="/report" element={<ReportLayout />}>
            <Route index element={<Navigate to="/report/list" replace />} />
            <Route path="list" element={<ReportList />} />
            <Route path=":sub" element={<ReportSimple />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
