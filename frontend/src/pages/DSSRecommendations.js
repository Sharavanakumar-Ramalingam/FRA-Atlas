import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Typography, 
  Alert, 
  Spin,
  List,
  Tag,
  Progress,
  Space,
  Divider
} from 'antd';
import { 
  BulbOutlined, 
  SearchOutlined, 
  GiftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { api } from '../services/api';

const { Option } = Select;
const { Title, Text } = Typography;

const DSSRecommendations = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const handleSubmit = async (values) => {
    setLoading(true);
    setRecommendations(null);

    try {
      const params = {
        ...values,
        // Convert empty strings to undefined to avoid API issues
        claim_id: values.claim_id || undefined,
        village: values.village || undefined,
        state: values.state || undefined,
        district: values.district || undefined
      };

      const response = await api.getDSSRecommendations(params);
      setRecommendations(response.data);

    } catch (error) {
      console.error('Error getting DSS recommendations:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to get recommendations';
      setRecommendations({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    form.resetFields();
    setRecommendations(null);
  };

  const getPriorityColor = (priority) => {
    if (priority >= 8) return 'red';
    if (priority >= 6) return 'orange';
    return 'green';
  };

  const getPriorityText = (priority) => {
    if (priority >= 8) return 'High Priority';
    if (priority >= 6) return 'Medium Priority';
    return 'Low Priority';
  };

  const renderSchemeCard = (scheme) => {
    const matchPercentage = scheme.eligibility_match?.match_percentage || 0;
    const priority = scheme.calculated_priority || 0;

    return (
      <Card
        key={scheme.scheme_id}
        size="small"
        className={`scheme-card priority-${priority >= 8 ? 'high' : priority >= 6 ? 'medium' : 'low'}`}
        style={{ marginBottom: 16 }}
        title={
          <Space>
            <GiftOutlined />
            <span>{scheme.name}</span>
            <Tag color={getPriorityColor(priority)}>
              {getPriorityText(priority)}
            </Tag>
          </Space>
        }
        extra={
          <Tag color="blue">
            Score: {priority.toFixed(1)}
          </Tag>
        }
      >
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary">{scheme.description}</Text>
        </div>

        <div style={{ marginBottom: 12 }}>
          <strong>Benefits:</strong> {scheme.benefits}
        </div>

        <div style={{ marginBottom: 12 }}>
          <strong>Ministry:</strong> {scheme.ministry}
        </div>

        {/* Eligibility Match */}
        <div style={{ marginBottom: 8 }}>
          <strong>Eligibility Match:</strong>
          <Progress 
            percent={matchPercentage} 
            size="small" 
            status={matchPercentage >= 70 ? 'success' : matchPercentage >= 40 ? 'active' : 'exception'}
            style={{ marginLeft: 8, width: 200, display: 'inline-block' }}
          />
          <span style={{ marginLeft: 8 }}>{matchPercentage}%</span>
        </div>

        {/* Matched Criteria */}
        {scheme.eligibility_match?.matched_criteria?.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <strong>Matched:</strong>
            <div style={{ marginTop: 4 }}>
              {scheme.eligibility_match.matched_criteria.map((criterion, idx) => (
                <Tag key={idx} color="green" icon={<CheckCircleOutlined />}>
                  {criterion}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* Missing Requirements */}
        {scheme.eligibility_match?.missing_requirements?.length > 0 && (
          <div>
            <strong>Required Documents:</strong>
            <div style={{ marginTop: 4 }}>
              {scheme.eligibility_match.missing_requirements.map((req, idx) => (
                <Tag key={idx} color="orange" icon={<ExclamationCircleOutlined />}>
                  {req}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>🧠 DSS Recommendations</Title>
        <p>Get personalized Central Sector Scheme recommendations for FRA claimants in <strong>Telangana</strong> and <strong>Odisha</strong></p>
      </div>

      {/* Input Form */}
      <Card title="Get Recommendations" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{}}
        >
          <Alert
            message="Provide either a specific Claim ID or location details to get targeted recommendations"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <div style={{ 
            background: '#f9f9f9', 
            padding: '16px', 
            borderRadius: '6px', 
            marginBottom: '16px' 
          }}>
            <Title level={5}>Option 1: Search by Claim ID</Title>
            <Form.Item
              name="claim_id"
              label="Claim ID"
              help="Enter the specific FRA claim ID (1-8 for sample data) for targeted recommendations"
            >
              <Input 
                placeholder="e.g., 1, 2, 3... (sample claim IDs)" 
                type="number"
                suffix={<SearchOutlined />}
                min={1}
                max={8}
              />
            </Form.Item>
          </div>

          <Divider>OR</Divider>

          <div style={{ 
            background: '#f9f9f9', 
            padding: '16px', 
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            <Title level={5}>Option 2: Search by Location</Title>
            <Form.Item
              name="village"
              label="Village"
              rules={[
                { required: false },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const claimId = getFieldValue('claim_id');
                    if (!claimId && !value) {
                      return Promise.reject(new Error('Please provide either Claim ID or Village name'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Select placeholder="Select village" allowClear>
                {/* Telangana Villages */}
                <Option value="Eturunagaram">Eturunagaram (Warangal, Telangana)</Option>
                <Option value="Bhadrachalam">Bhadrachalam (Khammam, Telangana)</Option>
                <Option value="Utnoor">Utnoor (Adilabad, Telangana)</Option>
                <Option value="Medak">Medak (Medak, Telangana)</Option>
                {/* Odisha Villages */}
                <Option value="Bhawanipatna">Bhawanipatna (Kalahandi, Odisha)</Option>
                <Option value="Rayagada">Rayagada (Rayagada, Odisha)</Option>
                <Option value="Sundargarh">Sundargarh (Sundargarh, Odisha)</Option>
                <Option value="Koraput">Koraput (Koraput, Odisha)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="district"
              label="District"
            >
              <Select placeholder="Select district" allowClear>
                {/* Telangana Districts */}
                <Option value="Warangal">Warangal (Telangana)</Option>
                <Option value="Khammam">Khammam (Telangana)</Option>
                <Option value="Adilabad">Adilabad (Telangana)</Option>
                <Option value="Medak">Medak (Telangana)</Option>
                {/* Odisha Districts */}
                <Option value="Kalahandi">Kalahandi (Odisha)</Option>
                <Option value="Rayagada">Rayagada (Odisha)</Option>
                <Option value="Sundargarh">Sundargarh (Odisha)</Option>
                <Option value="Koraput">Koraput (Odisha)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="state"
              label="State"
            >
              <Select placeholder="Select state" allowClear>
                <Option value="Telangana">🏛️ Telangana</Option>
                <Option value="Odisha">🏛️ Odisha</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<BulbOutlined />}
              >
                Get Recommendations
              </Button>
              <Button onClick={resetForm}>
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Loading */}
      {loading && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              Analyzing claim data and generating recommendations...
            </div>
          </div>
        </Card>
      )}

      {/* Error */}
      {recommendations?.error && (
        <Card>
          <Alert
            message="Error Getting Recommendations"
            description={recommendations.error}
            type="error"
            showIcon
          />
        </Card>
      )}

      {/* Recommendations Results */}
      {recommendations && !recommendations.error && (
        <div>
          {/* Summary */}
          <Card title="Recommendation Summary" style={{ marginBottom: 16 }}>
            <div style={{ background: '#f6ffed', padding: '16px', borderRadius: '6px' }}>
              <Space direction="vertical" size="small">
                <div>
                  <strong>Total Schemes Found:</strong> {recommendations.summary?.total_schemes || 0}
                </div>
                <div>
                  <strong>High Priority:</strong> {recommendations.summary?.high_priority_count || 0} schemes
                </div>
                <div>
                  <strong>Medium Priority:</strong> {recommendations.summary?.medium_priority_count || 0} schemes
                </div>
                <div>
                  <strong>Low Priority:</strong> {recommendations.summary?.low_priority_count || 0} schemes
                </div>
              </Space>
            </div>

            {/* Top 3 Recommendations */}
            {recommendations.summary?.top_3_recommendations?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <strong>Top 3 Recommendations:</strong>
                <ol style={{ marginTop: 8 }}>
                  {recommendations.summary.top_3_recommendations.map((scheme, idx) => (
                    <li key={idx}>{scheme}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Immediate Actions */}
            {recommendations.summary?.immediate_actions?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <strong>Immediate Actions:</strong>
                <List
                  size="small"
                  dataSource={recommendations.summary.immediate_actions}
                  renderItem={(action) => (
                    <List.Item>
                      <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                      {action}
                    </List.Item>
                  )}
                />
              </div>
            )}
          </Card>

          {/* Detailed Recommendations */}
          <Card title="Detailed Scheme Recommendations">
            {recommendations.recommendations?.length > 0 ? (
              recommendations.recommendations.map(renderSchemeCard)
            ) : (
              <Alert
                message="No recommendations found"
                description="No suitable schemes found for the provided criteria."
                type="info"
                showIcon
              />
            )}
          </Card>

          {/* Context Information */}
          {recommendations.context && (
            <Card title="Analysis Context" style={{ marginTop: 16 }}>
              <div style={{ fontSize: '12px', color: '#666' }}>
                <p><strong>Location:</strong> {recommendations.context.location?.village}, {recommendations.context.location?.district}, {recommendations.context.location?.state}</p>
                <p><strong>Tribal Area:</strong> {recommendations.context.location?.is_tribal_area ? 'Yes' : 'No'}</p>
                <p><strong>Analysis Date:</strong> {new Date(recommendations.generated_at).toLocaleString()}</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Instructions */}
      <Card title="📋 How to Use DSS Recommendations" style={{ marginTop: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
          <div>
            <Title level={4} style={{ color: '#1890ff' }}>🎯 Available Sample Data</Title>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <p><strong>Telangana Claims (IDs 1-4):</strong></p>
              <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                <li>ID 1: Warangal - Eturunagaram (Approved)</li>
                <li>ID 2: Khammam - Bhadrachalam (Pending)</li>
                <li>ID 3: Adilabad - Utnoor (Approved)</li>
                <li>ID 4: Medak - Medak (Rejected)</li>
              </ul>
              
              <p><strong>Odisha Claims (IDs 5-8):</strong></p>
              <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                <li>ID 5: Kalahandi - Bhawanipatna (Approved)</li>
                <li>ID 6: Rayagada - Rayagada (Pending)</li>
                <li>ID 7: Sundargarh - Sundargarh (Pending)</li>
                <li>ID 8: Koraput - Koraput (Approved)</li>
              </ul>
            </div>
          </div>
          
          <div>
            <Title level={4} style={{ color: '#1890ff' }}>🧠 Decision Support System Features</Title>
            <ul style={{ fontSize: '14px', color: '#666', paddingLeft: '20px' }}>
              <li><strong>Contextual Analysis:</strong> Analyzes claim location, type, and demographic factors</li>
              <li><strong>Scheme Matching:</strong> Matches FRA claims with relevant Central Sector Schemes</li>
              <li><strong>Priority Scoring:</strong> Assigns priority scores based on eligibility and context</li>
              <li><strong>Documentation Guidance:</strong> Lists required documents for each scheme</li>
              <li><strong>Actionable Insights:</strong> Provides immediate next steps for claimants</li>
            </ul>
          </div>
          
          <div style={{ gridColumn: 'span 2' }}>
            <Title level={4} style={{ color: '#1890ff' }}>💰 Supported Central Sector Schemes</Title>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '14px' }}>
              <div style={{ padding: '12px', background: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
                <strong>🌾 PM-KISAN</strong><br/>
                <small>Pradhan Mantri Kisan Samman Nidhi - Income support for farmers</small>
              </div>
              <div style={{ padding: '12px', background: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
                <strong>🏗️ MGNREGA</strong><br/>
                <small>Employment Guarantee - 100 days guaranteed employment</small>
              </div>
              <div style={{ padding: '12px', background: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
                <strong>💧 Jal Jeevan Mission</strong><br/>
                <small>Water Connection - Safe drinking water access</small>
              </div>
              <div style={{ padding: '12px', background: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
                <strong>🛡️ DAJGUA</strong><br/>
                <small>Livelihood Support - Tribal development programs</small>
              </div>
              <div style={{ padding: '12px', background: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
                <strong>🏠 PMAY-Gramin</strong><br/>
                <small>Rural Housing - Pucca house construction</small>
              </div>
              <div style={{ padding: '12px', background: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
                <strong>🌱 PMFBY</strong><br/>
                <small>Crop Insurance - Agricultural risk coverage</small>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DSSRecommendations;