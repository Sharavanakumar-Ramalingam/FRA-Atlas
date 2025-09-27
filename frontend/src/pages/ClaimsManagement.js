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
  Statistic
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ExportOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { api } from '../services/api';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

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
      title: 'Claim ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => <Tag color="blue">#{id}</Tag>
    },
    {
      title: 'Claimant Name',
      dataIndex: 'claimant_name',
      key: 'claimant_name',
      width: 150,
      render: (name) => <strong>{name}</strong>
    },
    {
      title: 'Claim Type',
      dataIndex: 'claim_type',
      key: 'claim_type',
      width: 120,
      render: (type) => <Tag>{type || 'N/A'}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 120
    },
    {
      title: 'District',
      dataIndex: 'district',
      key: 'district',
      width: 120
    },
    {
      title: 'Village',
      dataIndex: 'village',
      key: 'village',
      width: 120
    },
    {
      title: 'Area (Ha)',
      dataIndex: 'area_hectares',
      key: 'area_hectares',
      width: 100,
      render: (area) => area ? `${area} ha` : 'N/A',
      align: 'right'
    },
    {
      title: 'Created Date',
      dataIndex: 'created_date',
      key: 'created_date',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
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
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Claims Management</Title>
        <p>Manage and track Forest Rights Act claims across regions</p>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={6} sm={6} md={6} lg={6}>
          <Card>
            <Statistic
              title="Total Claims"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={6} sm={6} md={6} lg={6}>
          <Card>
            <Statistic
              title="Approved"
              value={stats.approved}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={6} sm={6} md={6} lg={6}>
          <Card>
            <Statistic
              title="Pending"
              value={stats.pending}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={6} sm={6} md={6} lg={6}>
          <Card>
            <Statistic
              title="Rejected"
              value={stats.rejected}
              valueStyle={{ color: '#f5222d' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="middle" wrap>
          <Search
            placeholder="Search by claimant, village, district..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          
          <Select
            placeholder="State"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('state', value)}
            value={filters.state}
          >
            <Option value="Andhra Pradesh">Andhra Pradesh</Option>
            <Option value="Chhattisgarh">Chhattisgarh</Option>
            <Option value="Jharkhand">Jharkhand</Option>
            <Option value="Madhya Pradesh">Madhya Pradesh</Option>
            <Option value="Odisha">Odisha</Option>
          </Select>

          <Select
            placeholder="Status"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => handleFilterChange('status', value)}
            value={filters.status}
          >
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
          </Select>

          <Select
            placeholder="Claim Type"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('claim_type', value)}
            value={filters.claim_type}
          >
            <Option value="Individual">Individual</Option>
            <Option value="Community">Community</Option>
            <Option value="Joint">Joint</Option>
          </Select>

          <Button 
            icon={<FilterOutlined />} 
            onClick={resetFilters}
          >
            Clear Filters
          </Button>

          <Button 
            type="primary" 
            icon={<ExportOutlined />}
            onClick={() => console.log('Export functionality')}
          >
            Export
          </Button>
        </Space>
      </Card>

      {/* Claims Table */}
      <Card title={`Claims List (${filteredClaims.length} records)`}>
        <Table
          columns={columns}
          dataSource={filteredClaims}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} claims`,
            defaultPageSize: 20,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1200 }}
          size="small"
          className="claims-table"
        />
      </Card>
    </div>
  );
};

export default ClaimsManagement;