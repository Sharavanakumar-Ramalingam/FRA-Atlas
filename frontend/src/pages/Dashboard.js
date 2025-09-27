import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Space, Tag, Spin } from 'antd';
import { 
  FileTextOutlined, 
  AuditOutlined, 
  GlobalOutlined, 
  BulbOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { api } from '../services/api';

const { Title } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalClaims: 0,
    totalParcels: 0,
    pendingClaims: 0
  });
  const [recentClaims, setRecentClaims] = useState([]);
  const [healthStatus, setHealthStatus] = useState('checking');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check API health
      try {
        await api.healthCheck();
        setHealthStatus('healthy');
      } catch (error) {
        setHealthStatus('unhealthy');
      }

      // Load documents
      const documentsResponse = await api.getDocuments({ limit: 5 });
      const documents = documentsResponse.data || [];

      // Load claims
      const claimsResponse = await api.getClaims({ limit: 10 });
      const claims = claimsResponse.data || [];

      // Load parcels
      const parcelsResponse = await api.getParcels();
      const parcels = parcelsResponse.data?.features || [];

      // Calculate stats
      setStats({
        totalDocuments: documents.length,
        totalClaims: claims.length,
        totalParcels: parcels.length,
        pendingClaims: claims.filter(claim => claim.status === 'pending').length
      });

      setRecentClaims(claims.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setHealthStatus('unhealthy');
    } finally {
      setLoading(false);
    }
  };

  const claimsColumns = [
    {
      title: 'Claimant Name',
      dataIndex: 'claimant_name',
      key: 'claimant_name',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'Village',
      dataIndex: 'village',
      key: 'village',
    },
    {
      title: 'District',
      dataIndex: 'district',
      key: 'district',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'approved' ? 'green' : 
                     status === 'rejected' ? 'red' : 'orange';
        const icon = status === 'approved' ? <CheckCircleOutlined /> :
                     status === 'rejected' ? <ExclamationCircleOutlined /> : 
                     <ClockCircleOutlined />;
        
        return (
          <Tag color={color} icon={icon}>
            {status?.toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: 'Area (Ha)',
      dataIndex: 'area_hectares',
      key: 'area_hectares',
      render: (area) => area ? `${area} ha` : 'N/A'
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>FRA Atlas 360 Dashboard</Title>
        <p>Forest Rights Act Management System Overview</p>
      </div>

      {/* API Health Status */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card size="small">
            <Space>
              <span>API Status:</span>
              {healthStatus === 'healthy' ? (
                <Tag color="green" icon={<CheckCircleOutlined />}>Healthy</Tag>
              ) : healthStatus === 'unhealthy' ? (
                <Tag color="red" icon={<ExclamationCircleOutlined />}>Unhealthy</Tag>
              ) : (
                <Tag color="orange" icon={<ClockCircleOutlined />}>Checking...</Tag>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="dashboard-stats">
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="Total Documents"
              value={stats.totalDocuments}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="Total Claims"
              value={stats.totalClaims}
              prefix={<AuditOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="Total Parcels"
              value={stats.totalParcels}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card>
            <Statistic
              title="Pending Claims"
              value={stats.pendingClaims}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Claims */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <AuditOutlined />
                <span>Recent Claims</span>
              </Space>
            }
            extra={
              <Tag color="blue">{recentClaims.length} claims</Tag>
            }
          >
            <Table
              dataSource={recentClaims}
              columns={claimsColumns}
              pagination={false}
              size="small"
              rowKey="id"
              locale={{
                emptyText: 'No claims data available'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card 
            hoverable
            onClick={() => window.location.href = '/upload'}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <FileTextOutlined style={{ fontSize: '2em', color: '#52c41a' }} />
            <div style={{ marginTop: 8 }}>Upload New Document</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card 
            hoverable
            onClick={() => window.location.href = '/gis'}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <GlobalOutlined style={{ fontSize: '2em', color: '#1890ff' }} />
            <div style={{ marginTop: 8 }}>View GIS Map</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card 
            hoverable
            onClick={() => window.location.href = '/dss'}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <BulbOutlined style={{ fontSize: '2em', color: '#fa8c16' }} />
            <div style={{ marginTop: 8 }}>Get DSS Recommendations</div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;