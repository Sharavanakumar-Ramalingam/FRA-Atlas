import React from 'react';
import { Layout, Typography, Space, Avatar, Dropdown, Button, Badge, Tooltip } from 'antd';
import { 
  GlobalOutlined, 
  FileTextOutlined, 
  UserOutlined, 
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  InfoCircleOutlined,
  DashboardOutlined,
  FolderOutlined,
  EnvironmentOutlined,
  BulbOutlined
} from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

const Header = () => {
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile Settings',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'System Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined />, active: false },
    { key: 'claims', label: 'Claims', icon: <FileTextOutlined />, active: true },
    { key: 'documents', label: 'Documents', icon: <FolderOutlined />, active: false },
    { key: 'gis', label: 'GIS Viewer', icon: <EnvironmentOutlined />, active: false },
    { key: 'dss', label: 'DSS', icon: <BulbOutlined />, active: false },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        .fra-header {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .nav-item {
          position: relative;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .nav-item:hover {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6 !important;
          transform: translateY(-1px);
        }
        
        .nav-item.active {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .nav-item.active:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          transform: translateY(-1px);
        }
        
        .status-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          padding: 6px 12px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          position: relative;
          overflow: hidden;
        }
        
        .status-badge::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .action-btn {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          height: 40px;
          width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.8);
        }
        
        .action-btn:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
          transform: translateY(-1px);
        }
        
        .user-dropdown {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.9);
        }
        
        .user-dropdown:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
          transform: translateY(-1px);
        }
      `}</style>
      
      <AntHeader className="fra-header" style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '0 4%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        height: '72px',
        fontFamily: 'Inter, sans-serif'
      }}>
        
        {/* Left Section - Logo and Title */}
        <div style={{ display: 'flex', alignItems: 'center', minWidth: '240px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            padding: '10px',
            borderRadius: '14px',
            marginRight: '16px',
            boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              animation: 'pulse 3s infinite'
            }} />
            <GlobalOutlined style={{ 
              fontSize: '26px', 
              color: 'white',
              position: 'relative',
              zIndex: 1
            }} />
          </div>
          <div>
            <Title level={4} style={{ 
              color: '#111827', 
              margin: 0,
              fontWeight: 700,
              fontSize: '24px',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '-0.02em'
            }}>
              FRA Atlas 360
            </Title>
            <Text style={{ 
              color: '#6b7280', 
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif'
            }}>
              Forest Rights Management System
            </Text>
          </div>
        </div>

        {/* Center Section - Navigation */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          background: 'rgba(249, 250, 251, 0.8)',
          padding: '6px',
          borderRadius: '12px',
          border: '1px solid rgba(229, 231, 235, 0.8)'
        }}>
          {navItems.map((item) => (
            <div
              key={item.key}
              className={`nav-item ${item.active ? 'active' : ''}`}
              style={{
                color: item.active ? 'white' : '#374151',
                fontWeight: item.active ? 600 : 500,
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              <span style={{ fontSize: '14px' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        {/* Right Section - Actions and User */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          minWidth: '240px',
          justifyContent: 'flex-end'
        }}>
          {/* System Status Badge */}
          <div className="status-badge">
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#ffffff',
              animation: 'pulse 2s infinite'
            }} />
            <Text style={{ 
              color: 'white', 
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              SIH 2025
            </Text>
          </div>

          {/* Notifications */}
          <Tooltip title="Notifications" placement="bottom">
            <Badge count={3} size="small">
              <Button 
                type="text" 
                icon={<BellOutlined style={{ fontSize: '16px', color: '#6b7280' }} />}
                className="action-btn"
              />
            </Badge>
          </Tooltip>

          {/* Help */}
          <Tooltip title="Help & Documentation" placement="bottom">
            <Button 
              type="text" 
              icon={<InfoCircleOutlined style={{ fontSize: '16px', color: '#6b7280' }} />}
              className="action-btn"
            />
          </Tooltip>

          {/* User Menu */}
          <Dropdown 
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <div className="user-dropdown">
              <Avatar 
                size={36}
                icon={<UserOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Text style={{ 
                  color: '#111827', 
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  fontFamily: 'Inter, sans-serif'
                }}>
                  FRA Officer
                </Text>
                <Text style={{ 
                  color: '#6b7280', 
                  fontSize: '12px',
                  fontWeight: 400,
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Administrator
                </Text>
              </div>
            </div>
          </Dropdown>
        </div>
      </AntHeader>
    </>
  );
};

export default Header;