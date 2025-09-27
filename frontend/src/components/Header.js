import React from 'react';
import { Layout, Typography, Space } from 'antd';
import { GlobalOutlined, FileTextOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header = () => {
  return (
    <AntHeader style={{ 
      background: '#52c41a', 
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <Space align="center">
        <GlobalOutlined style={{ fontSize: '24px', color: 'white' }} />
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          FRA Atlas 360
        </Title>
      </Space>
      <Space>
        <FileTextOutlined style={{ fontSize: '20px', color: 'white' }} />
        <span style={{ color: 'white' }}>Smart India Hackathon 2025</span>
      </Space>
    </AntHeader>
  );
};

export default Header;