import React from 'react';
import { Layout, Menu, Typography, Space, Badge } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UploadOutlined,
  FileSearchOutlined,
  GlobalOutlined,
  BulbOutlined,
  HomeOutlined,
  CloudUploadOutlined,
  AuditOutlined,
  EnvironmentOutlined,
  RobotOutlined
} from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: (
        <Space>
          <span>Dashboard</span>
          <Badge count="Live" style={{ 
            background: '#52c41a', 
            fontSize: '10px',
            height: '16px',
            lineHeight: '14px',
            borderRadius: '8px'
          }} />
        </Space>
      ),
    },
    {
      key: '/upload',
      icon: <CloudUploadOutlined />,
      label: 'Document Upload',
    },
    {
      key: '/claims',
      icon: <AuditOutlined />,
      label: (
        <Space>
          <span>Claims Management</span>
          <Badge count={8} style={{ 
            background: '#fa8c16', 
            fontSize: '10px',
            height: '16px',
            lineHeight: '14px'
          }} />
        </Space>
      ),
    },
    {
      key: '/gis',
      icon: <EnvironmentOutlined />,
      label: 'GIS Viewer',
    },
    {
      key: '/dss',
      icon: <RobotOutlined />,
      label: 'AI Recommendations',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      width={280}
      style={{
        background: '#ffffff',
        borderRight: '1px solid #f0f2f5',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.06)',
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* Sidebar Header */}
      <div style={{ 
        padding: '24px 20px 16px 20px',
        borderBottom: '1px solid #f0f2f5',
        background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)'
      }}>
        <Space direction="vertical" size={0}>
          <Text style={{ 
            fontSize: '13px', 
            color: '#8c8c8c',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Navigation
          </Text>
          <Text style={{ 
            fontSize: '11px', 
            color: '#bfbfbf',
            fontWeight: 400
          }}>
            Forest Rights Management
          </Text>
        </Space>
      </div>

      {/* Main Navigation */}
      <div style={{ padding: '16px 12px' }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            borderRight: 0,
            background: 'transparent'
          }}
          theme="light"
        />
      </div>

      {/* Quick Stats */}
      <div style={{ 
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20px',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
        borderTop: '1px solid #d6f7ff'
      }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text style={{ 
            fontSize: '12px', 
            color: '#1890ff',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            System Status
          </Text>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: '11px', color: '#666' }}>Active Claims</Text>
            <Badge count={8} style={{ 
              background: '#52c41a',
              fontSize: '10px',
              minWidth: '18px',
              height: '18px',
              lineHeight: '16px'
            }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: '11px', color: '#666' }}>States Coverage</Text>
            <Text style={{ fontSize: '11px', color: '#1890ff', fontWeight: 600 }}>TS, OD</Text>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: '11px', color: '#666' }}>System Health</Text>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#52c41a',
              boxShadow: '0 0 4px rgba(82, 196, 26, 0.6)'
            }} />
          </div>
        </Space>
      </div>

      {/* Custom Styles for Menu Items */}
      <style jsx>{`
        .ant-menu-item {
          margin: 4px 0 !important;
          height: 44px !important;
          line-height: 44px !important;
          border-radius: 10px !important;
          transition: all 0.3s ease !important;
        }
        
        .ant-menu-item:hover {
          background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%) !important;
          transform: translateX(4px) !important;
        }
        
        .ant-menu-item-selected {
          background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
          color: white !important;
          transform: translateX(6px) !important;
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3) !important;
        }
        
        .ant-menu-item-selected .ant-menu-item-icon,
        .ant-menu-item-selected span {
          color: white !important;
        }
        
        .ant-menu-item-icon {
          font-size: 18px !important;
          margin-inline-end: 12px !important;
        }
      `}</style>
    </Sider>
  );
};

export default Sidebar;