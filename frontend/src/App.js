import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, ConfigProvider, theme } from 'antd';
import 'antd/dist/reset.css';
import './App.css';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DocumentUpload from './pages/DocumentUpload';
import ClaimsManagement from './pages/ClaimsManagement';
import GISViewer from './pages/GISViewer';
import DSSRecommendations from './pages/DSSRecommendations';

const { Content } = Layout;

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          // Primary colors for FRA Atlas theme
          colorPrimary: '#1890ff', // Professional blue
          colorPrimaryHover: '#40a9ff',
          colorSuccess: '#52c41a', // Forest green
          colorWarning: '#fa8c16',
          colorError: '#f5222d',
          
          // Layout colors
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f5f7fa',
          colorBgElevated: '#ffffff',
          
          // Typography
          fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
          fontSize: 14,
          fontSizeHeading1: 32,
          fontSizeHeading2: 24,
          fontSizeHeading3: 20,
          
          // Border and radius
          borderRadius: 8,
          borderRadiusLG: 12,
          
          // Spacing
          padding: 16,
          paddingLG: 24,
          paddingXL: 32,
          
          // Box shadow
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.12)',
        },
        components: {
          Layout: {
            headerBg: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            siderBg: '#ffffff',
            bodyBg: '#f5f7fa',
          },
          Card: {
            borderRadiusLG: 12,
            boxShadowTertiary: '0 2px 12px rgba(0, 0, 0, 0.08)',
          },
          Button: {
            borderRadius: 6,
            fontWeight: 500,
          },
          Menu: {
            itemBorderRadius: 8,
            itemMarginInline: 8,
            itemMarginBlock: 4,
          },
        },
      }}
    >
      <Router>
        <Layout style={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
          <Layout hasSider>
            <Sidebar />
            <Layout style={{ 
              padding: '24px',
              background: 'transparent'
            }}>
              <Content
                style={{
                  padding: '24px 32px',
                  margin: 0,
                  minHeight: 'calc(100vh - 112px)',
                  background: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Subtle background pattern */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    radial-gradient(circle at 20% 20%, rgba(24, 144, 255, 0.03) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(82, 196, 26, 0.03) 0%, transparent 50%),
                    radial-gradient(circle at 60% 20%, rgba(250, 140, 22, 0.02) 0%, transparent 50%)
                  `,
                  pointerEvents: 'none',
                  zIndex: -1
                }} />
                
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/upload" element={<DocumentUpload />} />
                  <Route path="/claims" element={<ClaimsManagement />} />
                  <Route path="/gis" element={<GISViewer />} />
                  <Route path="/dss" element={<DSSRecommendations />} />
                </Routes>
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;