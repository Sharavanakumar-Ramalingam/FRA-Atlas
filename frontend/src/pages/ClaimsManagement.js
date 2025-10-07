import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Select, 
  Button, 
  Space, 
  Tag, 
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  message,
  Descriptions,
  Alert
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ExportOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  BulbOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { api } from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { Search } = Input;

const ClaimsManagement = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    state: undefined,
    district: undefined,
    village: undefined,
    claim_type: undefined,
    status: undefined
  });
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [recommendationModalVisible, setRecommendationModalVisible] = useState(false);
  const [currentRecommendation, setCurrentRecommendation] = useState(null);
  const [approvalForm] = Form.useForm();

  useEffect(() => {
    loadClaims();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadClaims = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        limit: 100
      };
      const response = await api.getClaims(params);
      setClaims(response.data || []);
    } catch (error) {
      console.error('Error loading claims:', error);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      state: undefined,
      district: undefined,
      village: undefined,
      claim_type: undefined,
      status: undefined
    });
    setSearchText('');
  };

  // Approval action handlers
  const handleApprovalAction = (claim, action) => {
    confirm({
      title: `${action === 'approve' ? 'Approve' : 'Reject'} Claim`,
      content: `Are you sure you want to ${action} this claim by ${claim.claimant_name}?`,
      okText: action === 'approve' ? 'Approve' : 'Reject',
      okType: action === 'approve' ? 'primary' : 'danger',
      cancelText: 'Cancel',
      onOk: () => processApproval(claim, action),
    });
  };

  const processApproval = async (claim, action) => {
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      const updateData = {
        status: newStatus,
        officer_name: 'Current Officer', // In real app, get from auth context
        verification_notes: `Claim ${action}d through management interface`,
        approval_date: new Date().toISOString()
      };

      await api.updateClaimStatus(claim.id, updateData);
      message.success(`Claim ${action}d successfully`);
      loadClaims(); // Refresh the list
    } catch (error) {
      console.error(`Error ${action}ing claim:`, error);
      message.error(`Failed to ${action} claim`);
    }
  };

  const showClaimDetails = (claim) => {
    setSelectedClaim(claim);
    setDetailsModalVisible(true);
  };

  const getRecommendation = async (claim) => {
    try {
      const response = await api.getDSSRecommendation({
        claim_id: claim.id,
        land_area: claim.area_hectares,
        claim_type: claim.claim_type,
        documents_submitted: true // Simplified for demo
      });
      console.log('DSS API Response:', response); // Debug log
      setCurrentRecommendation(response.data);
      setRecommendationModalVisible(true);
    } catch (error) {
      console.error('Error getting recommendation:', error);
      message.error('Failed to get recommendation');
    }
  };

  const filteredClaims = claims.filter(claim => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      claim.claimant_name?.toLowerCase().includes(searchLower) ||
      claim.village?.toLowerCase().includes(searchLower) ||
      claim.district?.toLowerCase().includes(searchLower) ||
      claim.state?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'rejected':
        return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#fa8c16' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'orange';
    }
  };

  const columns = [
    {
      title: 'Claim Info',
      key: 'claimInfo',
      width: 200,
      render: (record) => (
        <div style={{ padding: '8px 0', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <Tag color="blue" style={{ fontWeight: 600, fontSize: '12px', margin: 0, fontFamily: 'Inter, sans-serif' }}>
              #{record.id}
            </Tag>
            <span style={{ marginLeft: '8px', fontSize: '12px', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
              {new Date(record.created_date).toLocaleDateString()}
            </span>
          </div>
          <div style={{ 
            fontWeight: 700, 
            color: '#111827', 
            fontSize: '16px', 
            marginBottom: '4px',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.025em'
          }}>
            {record.claimant_name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Tag 
              color={record.claim_type === 'Individual' ? 'purple' : record.claim_type === 'Community' ? 'geekblue' : 'cyan'}
              style={{ 
                fontSize: '11px', 
                padding: '3px 8px', 
                lineHeight: '18px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500
              }}
            >
              {record.claim_type}
            </Tag>
            {record.area_hectares && (
              <span style={{ 
                fontSize: '12px', 
                color: '#374151', 
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
              }}>
                {record.area_hectares} ha
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Location',
      key: 'location',
      width: 180,
      render: (record) => (
        <div style={{ padding: '8px 0', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ 
            fontWeight: 700, 
            color: '#111827', 
            fontSize: '15px', 
            marginBottom: '6px',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.025em'
          }}>
            📍 {record.village}
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: '#4b5563', 
            lineHeight: '1.4',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500
          }}>
            {record.district}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif'
          }}>
            {record.state}
          </div>
        </div>
      )
    },
    {
      title: 'Status & Priority',
      key: 'statusPriority',
      width: 150,
      render: (record) => (
        <div style={{ padding: '8px 0', fontFamily: 'Inter, sans-serif' }}>
          <Tag 
            color={getStatusColor(record.status)} 
            icon={getStatusIcon(record.status)}
            style={{ 
              fontWeight: 700, 
              borderRadius: '18px', 
              padding: '8px 14px',
              fontSize: '12px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              width: 'fit-content',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.025em'
            }}
          >
            {record.status?.toUpperCase()}
          </Tag>
          {record.status === 'pending' && (
            <div style={{ 
              fontSize: '11px', 
              color: '#ea580c', 
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif'
            }}>
              ⏰ Needs Review
            </div>
          )}
          {record.status === 'approved' && (
            <div style={{ 
              fontSize: '11px', 
              color: '#16a34a', 
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif'
            }}>
              ✅ Completed
            </div>
          )}
          {record.status === 'rejected' && (
            <div style={{ 
              fontSize: '11px', 
              color: '#dc2626', 
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif'
            }}>
              ❌ Declined
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Quick Actions',
      key: 'quickActions',
      width: 160,
      render: (record) => (
        <div style={{ padding: '4px 0', fontFamily: 'Inter, sans-serif' }}>
          <Space direction="vertical" size="small" style={{ display: 'flex' }}>
            <Space size="small">
              <Button 
                type="primary" 
                size="small" 
                icon={<EyeOutlined />}
                onClick={() => showClaimDetails(record)}
                style={{ 
                  borderRadius: '8px',
                  fontSize: '12px',
                  height: '32px',
                  minWidth: '70px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600
                }}
              >
                View
              </Button>
              <Button 
                size="small" 
                icon={<BulbOutlined />}
                onClick={() => getRecommendation(record)}
                style={{ 
                  borderRadius: '8px',
                  fontSize: '12px',
                  height: '32px',
                  minWidth: '60px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600
                }}
              >
                DSS
              </Button>
            </Space>
            {record.status === 'pending' && (
              <Space size="small">
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<CheckOutlined />}
                  onClick={() => handleApprovalAction(record, 'approve')}
                  style={{ 
                    borderRadius: '8px', 
                    background: '#16a34a', 
                    borderColor: '#16a34a',
                    fontSize: '11px',
                    height: '30px',
                    minWidth: '75px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600
                  }}
                >
                  Approve
                </Button>
                <Button 
                  danger 
                  size="small" 
                  icon={<CloseOutlined />}
                  onClick={() => handleApprovalAction(record, 'reject')}
                  style={{ 
                    borderRadius: '8px',
                    fontSize: '11px',
                    height: '30px',
                    minWidth: '70px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600
                  }}
                >
                  Reject
                </Button>
              </Space>
            )}
          </Space>
        </div>
      )
    }
  ];

  // Calculate statistics
  const stats = {
    total: filteredClaims.length,
    approved: filteredClaims.filter(c => c.status === 'approved').length,
    pending: filteredClaims.filter(c => c.status === 'pending').length,
    rejected: filteredClaims.filter(c => c.status === 'rejected').length
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .enhanced-claims-table {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        }
        
        .enhanced-claims-table .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
          border-bottom: 2px solid #e6f7ff !important;
          font-weight: 600 !important;
          color: #262626 !important;
          font-size: 14px !important;
          padding: 18px 16px !important;
          font-family: 'Inter', sans-serif !important;
          letter-spacing: 0.025em !important;
        }
        
        .enhanced-claims-table .ant-table-tbody > tr.table-row-even {
          background-color: #fafbfc !important;
        }
        
        .enhanced-claims-table .ant-table-tbody > tr.table-row-odd {
          background-color: #ffffff !important;
        }
        
        .enhanced-claims-table .ant-table-tbody > tr:hover {
          background-color: #f0f9ff !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15) !important;
          transition: all 0.2s ease !important;
        }
        
        .enhanced-claims-table .ant-table-tbody > tr.row-pending {
          border-left: 4px solid #fa8c16 !important;
        }
        
        .enhanced-claims-table .ant-table-tbody > tr.row-approved {
          border-left: 4px solid #52c41a !important;
        }
        
        .enhanced-claims-table .ant-table-tbody > tr.row-rejected {
          border-left: 4px solid #f5222d !important;
        }
        
        .enhanced-claims-table .ant-table-tbody > tr > td {
          padding: 16px !important;
          border-bottom: 1px solid #f5f5f5 !important;
          vertical-align: top !important;
          font-family: 'Inter', sans-serif !important;
        }
        
        .enhanced-claims-table .ant-table {
          border-radius: 12px !important;
          overflow: hidden !important;
        }
        
        .enhanced-claims-table .ant-pagination {
          margin-top: 24px !important;
          padding: 0 24px 24px 24px !important;
          font-family: 'Inter', sans-serif !important;
        }
        
        .enhanced-claims-table .ant-pagination .ant-pagination-item {
          font-size: 14px !important;
        }
        
        .enhanced-claims-table .ant-btn {
          font-family: 'Inter', sans-serif !important;
          font-weight: 500 !important;
        }
        
        .enhanced-claims-table .ant-tag {
          font-family: 'Inter', sans-serif !important;
          font-weight: 500 !important;
        }
      `}</style>
      <div style={{ padding: '0 8px' }}>
      {/* Enhanced Header Section */}
      <div style={{ 
        marginBottom: 32,
        background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
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
        
        <Row align="middle" justify="space-between" style={{ position: 'relative', zIndex: 1 }}>
          <Col>
            <Space direction="vertical" size="small">
              <Title level={1} style={{ 
                color: 'white', 
                margin: 0,
                fontSize: '32px',
                fontWeight: 700,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}>
                📋 Claims Management
              </Title>
              <Text style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '16px',
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)'
              }}>
                Monitor, review, and process Forest Rights Act claims across <strong>Telangana</strong> and <strong>Odisha</strong>.
              </Text>
            </Space>
          </Col>
          <Col>
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}>
              <Statistic
                title={<span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>Active Claims</span>}
                value={filteredClaims.length}
                valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 700 }}
                prefix={<FileTextOutlined />}
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* Enhanced Statistics */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
              border: '1px solid #91d5ff',
              boxShadow: '0 4px 16px rgba(24, 144, 255, 0.1)',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={
                <Space>
                  <FileTextOutlined style={{ color: '#1890ff' }} />
                  <span style={{ 
                    color: '#6b7280', 
                    fontWeight: 600,
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Total Claims
                  </span>
                </Space>
              }
              value={stats.total}
              valueStyle={{ 
                color: '#1890ff', 
                fontSize: '32px', 
                fontWeight: 800,
                fontFamily: 'Inter, sans-serif'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
              border: '1px solid #b7eb8f',
              boxShadow: '0 4px 16px rgba(82, 196, 26, 0.1)',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span style={{ 
                    color: '#6b7280', 
                    fontWeight: 600,
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Approved
                  </span>
                </Space>
              }
              value={stats.approved}
              valueStyle={{ 
                color: '#16a34a', 
                fontSize: '32px', 
                fontWeight: 800,
                fontFamily: 'Inter, sans-serif'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #fff7e6 0%, #ffd8bf 100%)',
              border: '1px solid #ffcc7a',
              boxShadow: '0 4px 16px rgba(250, 140, 22, 0.1)',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                  <span style={{ 
                    color: '#6b7280', 
                    fontWeight: 600,
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Pending
                  </span>
                </Space>
              }
              value={stats.pending}
              valueStyle={{ 
                color: '#ea580c', 
                fontSize: '32px', 
                fontWeight: 800,
                fontFamily: 'Inter, sans-serif'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #fff1f0 0%, #ffebe6 100%)',
              border: '1px solid #ffccc7',
              boxShadow: '0 4px 16px rgba(255, 77, 79, 0.1)',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={
                <Space>
                  <ExclamationCircleOutlined style={{ color: '#f5222d' }} />
                  <span style={{ 
                    color: '#6b7280', 
                    fontWeight: 600,
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Rejected
                  </span>
                </Space>
              }
              value={stats.rejected}
              valueStyle={{ 
                color: '#dc2626', 
                fontSize: '32px', 
                fontWeight: 800,
                fontFamily: 'Inter, sans-serif'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Enhanced Filters and Search */}
      <Card 
        style={{ 
          marginBottom: 32,
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
        }}
        title={
          <Space>
            <FilterOutlined style={{ color: '#1890ff' }} />
            <span style={{ 
              fontWeight: 700, 
              color: '#111827',
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.025em'
            }}>
              Search & Filters
            </span>
          </Space>
        }
        bodyStyle={{ padding: '24px' }}
      >
        <Space size="middle" wrap style={{ width: '100%' }}>
          <Search
            placeholder="Search by claimant, village, district..."
            allowClear
            onSearch={handleSearch}
            style={{ 
              width: 300, 
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            }}
            prefix={<SearchOutlined />}
          />
          
          <Select
            placeholder="Select State"
            style={{ 
              width: 160, 
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            }}
            value={filters.state}
            onChange={(value) => handleFilterChange('state', value)}
            allowClear
          >
            <Option value="Telangana">Telangana</Option>
            <Option value="Odisha">Odisha</Option>
          </Select>

          <Select
            placeholder="Select District"
            style={{ 
              width: 160, 
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            }}
            value={filters.district}
            onChange={(value) => handleFilterChange('district', value)}
            allowClear
          >
            <Option value="Warangal">Warangal</Option>
            <Option value="Khammam">Khammam</Option>
            <Option value="Koraput">Koraput</Option>
            <Option value="Rayagada">Rayagada</Option>
          </Select>

          <Select
            placeholder="Select Village"
            style={{ 
              width: 160, 
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            }}
            value={filters.village}
            onChange={(value) => handleFilterChange('village', value)}
            allowClear
          >
            <Option value="Eturnagaram">Eturnagaram</Option>
            <Option value="Mulugu">Mulugu</Option>
            <Option value="Kothagudem">Kothagudem</Option>
            <Option value="Similiguda">Similiguda</Option>
          </Select>

          <Select
            placeholder="Claim Type"
            style={{ 
              width: 140, 
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            }}
            value={filters.claim_type}
            onChange={(value) => handleFilterChange('claim_type', value)}
            allowClear
          >
            <Option value="Individual">Individual</Option>
            <Option value="Community">Community</Option>
            <Option value="Joint">Joint</Option>
          </Select>

          <Select
            placeholder="Status"
            style={{ 
              width: 130, 
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            }}
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            allowClear
          >
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
          </Select>

          <Button 
            icon={<FilterOutlined />} 
            onClick={resetFilters}
            style={{ 
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            Clear
          </Button>

          <Button 
            type="primary" 
            icon={<ExportOutlined />}
            onClick={() => console.log('Export functionality')}
            style={{ 
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            Export
          </Button>
        </Space>
      </Card>

      {/* Enhanced Claims Table */}
      <Card 
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
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
                <FileTextOutlined style={{ color: 'white', fontSize: '16px' }} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 600, color: '#262626' }}>
                Claims List ({filteredClaims.length} records)
              </span>
            </Space>
            <Space>
              <Tag color="blue" style={{ fontSize: '12px', padding: '4px 8px' }}>
                {stats.pending} Pending
              </Tag>
              <Tag color="green" style={{ fontSize: '12px', padding: '4px 8px' }}>
                {stats.approved} Approved
              </Tag>
              <Tag color="red" style={{ fontSize: '12px', padding: '4px 8px' }}>
                {stats.rejected} Rejected
              </Tag>
            </Space>
          </Space>
        }
        bodyStyle={{ padding: '0' }}
      >
        {/* Table Header Info */}
        <div style={{ 
          padding: '16px 24px', 
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: '14px', color: '#595959' }}>
              💡 <strong>Pro Tip:</strong> Click on any claim to view detailed information or use quick actions for faster processing
            </Text>
            <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
              Last updated: {new Date().toLocaleTimeString()}
            </Text>
          </Space>
        </div>
        <div style={{ padding: '24px' }}>
          <Table
            columns={columns}
            dataSource={filteredClaims}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} claims`,
              defaultPageSize: 15,
              pageSizeOptions: ['10', '15', '25', '50'],
              style: { marginTop: '16px' },
              size: 'default',
              position: ['bottomCenter']
            }}
            scroll={{ x: 800 }}
            size="middle"
            className="enhanced-claims-table"
            rowClassName={(record, index) => {
              let baseClass = index % 2 === 0 ? 'table-row-even' : 'table-row-odd';
              if (record.status === 'pending') baseClass += ' row-pending';
              if (record.status === 'approved') baseClass += ' row-approved';
              if (record.status === 'rejected') baseClass += ' row-rejected';
              return baseClass;
            }}
            onRow={(record) => ({
              onClick: () => {
                // Optional: Quick preview on row click
                console.log('Row clicked:', record);
              },
              style: { cursor: 'pointer' }
            })}
            style={{ 
              '--table-header-bg': 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              '--table-row-hover-bg': '#f0f9ff',
              border: '1px solid #f0f0f0',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
            locale={{
              emptyText: (
                <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
                    borderRadius: '50%',
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px'
                  }}>
                    <FileTextOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                  </div>
                  <div style={{ fontSize: '18px', color: '#262626', marginBottom: '8px', fontWeight: 600 }}>
                    No claims found
                  </div>
                  <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '16px' }}>
                    No claims match your current search criteria
                  </div>
                  <Button 
                    type="primary" 
                    onClick={resetFilters}
                    style={{ borderRadius: '8px' }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )
            }}
          />
        </div>
      </Card>

      {/* Claim Details Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Claim Details</span>
          </Space>
        }
        visible={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={null}
        width={800}
        bodyStyle={{ padding: '24px' }}
      >
        {selectedClaim && (
          <Descriptions bordered column={2} size="middle" style={{ marginTop: '16px' }}>
            <Descriptions.Item label="Claim ID" span={1}>
              <Tag color="blue" style={{ fontWeight: 500 }}>#{selectedClaim.id}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status" span={1}>
              <Tag 
                color={getStatusColor(selectedClaim.status)}
                icon={getStatusIcon(selectedClaim.status)}
                style={{ fontWeight: 500 }}
              >
                {selectedClaim.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Applicant" span={2}>
              <Text strong style={{ fontSize: '16px' }}>{selectedClaim.claimant_name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Claim Type">{selectedClaim.claim_type}</Descriptions.Item>
            <Descriptions.Item label="Land Area">{selectedClaim.area_hectares} hectares</Descriptions.Item>
            <Descriptions.Item label="Village">{selectedClaim.village}</Descriptions.Item>
            <Descriptions.Item label="District">{selectedClaim.district}</Descriptions.Item>
            <Descriptions.Item label="State">{selectedClaim.state}</Descriptions.Item>
            <Descriptions.Item label="Submitted" span={1}>
              {new Date(selectedClaim.created_date).toLocaleDateString()}
            </Descriptions.Item>
            {selectedClaim.verification_notes && (
              <Descriptions.Item label="Verification Notes" span={2}>
                <Text>{selectedClaim.verification_notes}</Text>
              </Descriptions.Item>
            )}
            {selectedClaim.officer_name && (
              <Descriptions.Item label="Verified By" span={2}>
                <Text>{selectedClaim.officer_name}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* DSS Recommendation Modal */}
      <Modal
        title={
          <Space>
            <BulbOutlined style={{ color: '#fa8c16' }} />
            <span style={{ fontSize: '18px', fontWeight: 600 }}>DSS Recommendation</span>
          </Space>
        }
        visible={recommendationModalVisible}
        onCancel={() => setRecommendationModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setRecommendationModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
        bodyStyle={{ padding: '24px' }}
      >
        {currentRecommendation && (
          <div>
            <Alert
              message={`Recommendation: ${currentRecommendation.recommendation}`}
              description={currentRecommendation.reasoning}
              type={currentRecommendation.recommendation === 'APPROVE' ? 'success' : 'warning'}
              showIcon
              style={{ marginBottom: 16, borderRadius: '8px' }}
            />
            <Descriptions bordered size="middle" style={{ marginBottom: '16px' }}>
              <Descriptions.Item label="Confidence Score" span={2}>
                <Text strong>{(currentRecommendation.confidence_score * 100).toFixed(1)}%</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Risk Level" span={2}>
                <Text>{currentRecommendation.risk_factors?.length || 0} factors identified</Text>
              </Descriptions.Item>
            </Descriptions>
            {currentRecommendation.suggested_schemes && (
              <div style={{ marginTop: 16 }}>
                <Title level={5} style={{ color: '#262626' }}>Suggested Schemes:</Title>
                <ul style={{ marginLeft: '16px' }}>
                  {currentRecommendation.suggested_schemes.map((scheme, index) => (
                    <li key={index} style={{ marginBottom: '4px' }}>
                      <Text>{scheme}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
      </div>
    </>
  );
};

export default ClaimsManagement;