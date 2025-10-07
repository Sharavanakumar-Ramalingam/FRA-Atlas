import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography, 
  Table, 
  Space, 
  Tag, 
  Spin, 
  Progress,
  Alert,
  Button,
  Tooltip,
  Avatar,
  List,
  Badge,
  Divider
} from 'antd';
import { 
  FileTextOutlined, 
  AuditOutlined, 
  GlobalOutlined, 
  BulbOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  RiseOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { api } from '../services/api';

const { Title, Text } = Typography;

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
    <div style={{ padding: '0 8px' }}>
      {/* Welcome Header */}
      <div style={{ 
        marginBottom: 32,
        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
        borderRadius: '16px',
        padding: '32px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: 'none'
        }} />
        
        <Row align="middle" style={{ position: 'relative', zIndex: 1 }}>
          <Col span={16}>
            <Space direction="vertical" size="small">
              <Title level={1} style={{ 
                color: 'white', 
                margin: 0,
                fontSize: '32px',
                fontWeight: 700,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}>
                🌲 Welcome to FRA Atlas 360
              </Title>
              <Typography.Paragraph style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '16px',
                margin: 0,
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)'
              }}>
                Comprehensive Forest Rights Act management system for <strong>Telangana</strong> and <strong>Odisha</strong> states.
                Monitor claims, analyze documents, and make data-driven decisions.
              </Typography.Paragraph>
            </Space>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Statistic
                title={<span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>System Uptime</span>}
                value={99.9}
                suffix="%"
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 700 }}
                prefix={<TrophyOutlined />}
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* API Health Status */}
      {healthStatus === 'unhealthy' && (
        <Alert
          message="System Health Warning"
          description="The backend API is currently unavailable. Some features may not work properly."
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 24 }}
          action={
            <Button size="small" onClick={loadDashboardData} icon={<ReloadOutlined />}>
              Retry Connection
            </Button>
          }
        />
      )}

      {/* Enhanced Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #fff1f0 0%, #ffebe6 100%)',
              border: '1px solid #ffccc7',
              boxShadow: '0 4px 16px rgba(255, 77, 79, 0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            bodyStyle={{ padding: '24px' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 77, 79, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 77, 79, 0.1)';
            }}
          >
            <Statistic
              title={
                <Space>
                  <FileTextOutlined style={{ color: '#f5222d', fontSize: '16px' }} />
                  <span style={{ color: '#8c8c8c', fontWeight: 500, fontSize: '14px' }}>Total Documents</span>
                </Space>
              }
              value={stats.totalDocuments}
              valueStyle={{ color: '#f5222d', fontSize: '28px', fontWeight: 700 }}
              suffix={
                <Tooltip title="Documents processed with OCR + NER">
                  <span style={{ fontSize: '14px', color: '#8c8c8c' }}>files</span>
                </Tooltip>
              }
            />
            <div style={{ marginTop: 12 }}>
              <Tag color="red" size="small" style={{ fontSize: '11px' }}>OCR + NER Processed</Tag>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
              border: '1px solid #b7eb8f',
              boxShadow: '0 4px 16px rgba(82, 196, 26, 0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            bodyStyle={{ padding: '24px' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(82, 196, 26, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(82, 196, 26, 0.1)';
            }}
          >
            <Statistic
              title={
                <Space>
                  <AuditOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                  <span style={{ color: '#8c8c8c', fontWeight: 500, fontSize: '14px' }}>Total Claims</span>
                </Space>
              }
              value={stats.totalClaims}
              valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 700 }}
              suffix={
                <Tooltip title="FRA claims registered">
                  <span style={{ fontSize: '14px', color: '#8c8c8c' }}>claims</span>
                </Tooltip>
              }
            />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tag color="green" size="small" style={{ fontSize: '11px' }}>Active Processing</Tag>
              <span style={{ fontSize: '12px', color: '#52c41a', fontWeight: 500 }}>
                <ArrowUpOutlined style={{ marginRight: 2 }} /> +12%
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
              border: '1px solid #91d5ff',
              boxShadow: '0 4px 16px rgba(24, 144, 255, 0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            bodyStyle={{ padding: '24px' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(24, 144, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(24, 144, 255, 0.1)';
            }}
          >
            <Statistic
              title={
                <Space>
                  <EnvironmentOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                  <span style={{ color: '#8c8c8c', fontWeight: 500, fontSize: '14px' }}>GIS Parcels</span>
                </Space>
              }
              value={stats.totalParcels}
              valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 700 }}
              suffix={
                <Tooltip title="Geo-referenced land parcels">
                  <span style={{ fontSize: '14px', color: '#8c8c8c' }}>parcels</span>
                </Tooltip>
              }
            />
            <div style={{ marginTop: 12 }}>
              <Tag color="blue" size="small" style={{ fontSize: '11px' }}>TS & OD Coverage</Tag>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #fff7e6 0%, #ffd8bf 100%)',
              border: '1px solid #ffcc7a',
              boxShadow: '0 4px 16px rgba(250, 140, 22, 0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            bodyStyle={{ padding: '24px' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(250, 140, 22, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(250, 140, 22, 0.1)';
            }}
          >
            <Statistic
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#fa8c16', fontSize: '16px' }} />
                  <span style={{ color: '#8c8c8c', fontWeight: 500, fontSize: '14px' }}>Pending Claims</span>
                </Space>
              }
              value={stats.pendingClaims}
              valueStyle={{ color: '#fa8c16', fontSize: '28px', fontWeight: 700 }}
              suffix={
                <Tooltip title="Claims awaiting review">
                  <span style={{ fontSize: '14px', color: '#8c8c8c' }}>pending</span>
                </Tooltip>
              }
            />
            <div style={{ marginTop: 12 }}>
              <Progress 
                percent={stats.totalClaims > 0 ? Math.round(((stats.totalClaims - stats.pendingClaims) / stats.totalClaims * 100)) : 0} 
                size="small" 
                strokeColor="#fa8c16"
                showInfo={false}
                style={{ marginBottom: 4 }}
              />
              <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>
                Processing Rate: {stats.totalClaims > 0 ? Math.round(((stats.totalClaims - stats.pendingClaims) / stats.totalClaims * 100)) : 0}%
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Enhanced Recent Claims Section */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col span={24}>
          <Card 
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              border: '1px solid #f0f0f0'
            }}
            title={
              <Space size="large" style={{ justifyContent: 'space-between', width: '100%' }}>
                <Space>
                  <div style={{
                    background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AuditOutlined style={{ color: 'white', fontSize: '16px' }} />
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: '#262626' }}>Recent Claims Activity</span>
                </Space>
                <Space>
                  <Tag 
                    color="blue" 
                    style={{ 
                      borderRadius: '12px', 
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}
                  >
                    {recentClaims.length} active claims
                  </Tag>
                  <Button 
                    type="primary" 
                    size="small" 
                    icon={<EyeOutlined />}
                    onClick={() => window.location.href = '/claims'}
                    style={{ borderRadius: '8px' }}
                  >
                    View All
                  </Button>
                </Space>
              </Space>
            }
            bodyStyle={{ padding: '24px' }}
          >
            <Table
              dataSource={recentClaims}
              columns={claimsColumns.map(col => ({
                ...col,
                title: <span style={{ fontWeight: 600, color: '#595959' }}>{col.title}</span>
              }))}
              pagination={false}
              size="middle"
              rowKey="id"
              locale={{
                emptyText: (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <AuditOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                    <Title level={4} style={{ color: '#8c8c8c', margin: 0 }}>
                      No claims data available
                    </Title>
                    <Text style={{ color: '#bfbfbf' }}>
                      Start by uploading documents or registering new claims
                    </Text>
                  </div>
                )
              }}
              rowClassName={(record, index) => 
                index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
              }
              style={{
                '--table-row-light': '#fafafa',
                '--table-row-dark': '#ffffff'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Enhanced Quick Actions Section */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col span={24}>
          <Title 
            level={3} 
            style={{ 
              marginBottom: 24,
              color: '#262626',
              fontWeight: 600
            }}
          >
            Quick Actions
          </Title>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Card 
            hoverable
            onClick={() => window.location.href = '/upload'}
            style={{ 
              textAlign: 'center', 
              cursor: 'pointer',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #fff1f0 0%, #ffebe6 100%)',
              border: '1px solid #ffccc7',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: '32px 24px' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 77, 79, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #f5222d, #cf1322)',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 12px rgba(245, 34, 45, 0.3)'
            }}>
              <FileTextOutlined style={{ fontSize: '24px', color: 'white' }} />
            </div>
            <Title level={4} style={{ margin: '0 0 8px 0', color: '#f5222d' }}>
              Upload Documents
            </Title>
            <Text style={{ color: '#8c8c8c' }}>
              Upload and process FRA documents with AI-powered OCR and NER
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card 
            hoverable
            onClick={() => window.location.href = '/gis'}
            style={{ 
              textAlign: 'center', 
              cursor: 'pointer',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
              border: '1px solid #91d5ff',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: '32px 24px' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(24, 144, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #1890ff, #096dd9)',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
            }}>
              <EnvironmentOutlined style={{ fontSize: '24px', color: 'white' }} />
            </div>
            <Title level={4} style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
              GIS Viewer
            </Title>
            <Text style={{ color: '#8c8c8c' }}>
              Explore land parcels and claims on interactive maps
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card 
            hoverable
            onClick={() => window.location.href = '/dss'}
            style={{ 
              textAlign: 'center', 
              cursor: 'pointer',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
              border: '1px solid #b7eb8f',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: '32px 24px' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(82, 196, 26, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #52c41a, #389e0d)',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
            }}>
              <BulbOutlined style={{ fontSize: '24px', color: 'white' }} />
            </div>
            <Title level={4} style={{ margin: '0 0 8px 0', color: '#52c41a' }}>
              DSS Recommendations
            </Title>
            <Text style={{ color: '#8c8c8c' }}>
              Get AI-powered decision support for FRA claims
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;