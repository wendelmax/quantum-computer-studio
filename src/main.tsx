import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CircuitsPage from './app/circuits/page'
import AlgorithmsPage from './app/algorithms/page'
import DataLabPage from './app/data-lab/page'
import ExecutionPage from './app/execution/page'
import DocsPage from './app/docs/page'
import GalleryPage from './app/gallery/page'
import PlaygroundPage from './app/playground/page'
import SettingsPage from './app/settings/page'
import QuantumShell from './app/QuantumShell'
import QuantumHome from './app/QuantumHome'
import StateViewerPage from './app/state-viewer/page'
import VisualLabPage from './app/visual-lab/page'
import GatesLibraryPage from './app/gates/page'
import OraclesPage from './app/oracles/page'
import APIPage from './app/api/page'
import LibDocsPage from './app/lib-docs/page'
import QNLPPage from './app/qnlp/page'
import { Toaster } from 'sonner'
import './index.css'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster position="top-center" theme="dark" toastOptions={{ className: 'border border-theme-border bg-bg-card text-theme-text shadow-xl' }} />
      <Routes>
        <Route path="/" element={<QuantumShell />}>
          <Route index element={<QuantumHome />} />
          <Route path="circuits" element={<CircuitsPage />} />
          <Route path="algorithms" element={<AlgorithmsPage />} />
          <Route path="data-lab" element={<DataLabPage />} />
          <Route path="state-viewer" element={<StateViewerPage />} />
          <Route path="gates" element={<GatesLibraryPage />} />
          <Route path="visual-lab" element={<VisualLabPage />} />
          <Route path="oracles" element={<OraclesPage />} />
          <Route path="qnlp" element={<QNLPPage />} />
          <Route path="execution" element={<ExecutionPage />} />
          <Route path="docs" element={<DocsPage />} />
          <Route path="api" element={<APIPage />} />
          <Route path="lib-docs" element={<LibDocsPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="playground" element={<PlaygroundPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
