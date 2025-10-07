import React, { useState } from 'react';
import { 
  Card, 
  Upload, 
  message, 
  Progress, 
  Typography, 
  Space, 
  Alert,
  Descriptions,
  Tag,
  Button,
  Row,
  Col,
  Statistic,
  Steps,
  Tooltip,
  Divider
} from 'antd';
import { 
  InboxOutlined, 
  FileTextOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  ScanOutlined,
  DatabaseOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  FileProtectOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { api } from '../services/api';

const { Dragger } = Upload;
const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const DocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [fileInfo, setFileInfo] = useState(null);

  const handleUpload = async (file) => {
    // Validate file
    const isValidSize = file.size / 1024 / 1024 < 50; // 50MB limit
    if (!isValidSize) {
      message.error('File size must be smaller than 50MB!');
      return false;
    }

    const isPDF = file.type === 'application/pdf';
    if (!isPDF) {
      message.error('Please upload a PDF file only!');
      return false;
    }

    setFileInfo({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
      type: file.type
    });

    setUploading(true);
    setUploadProgress(0);
    setUploadResult(null);
    setCurrentStep(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Step 1: Upload
      setCurrentStep(0);
      setUploadProgress(20);
      
      // Simulate realistic progress updates
      const progressSteps = [
        { step: 0, progress: 20, delay: 500 },   // Upload
        { step: 1, progress: 40, delay: 1000 },  // OCR
        { step: 2, progress: 70, delay: 1500 },  // NER
        { step: 3, progress: 90, delay: 1000 },  // Database
      ];

      for (let i = 0; i < progressSteps.length; i++) {
        setTimeout(() => {
          setCurrentStep(progressSteps[i].step);
          setUploadProgress(progressSteps[i].progress);
        }, progressSteps[i].delay * (i + 1));
      }

      const response = await api.uploadDocument(formData);
      
      setCurrentStep(4);
      setUploadProgress(100);
      
      setUploadResult(response.data);
      message.success('🎉 Document processed successfully!');

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.detail || 'Upload failed';
      message.error(`❌ ${errorMessage}`);
      setUploadResult({ error: errorMessage });
      setCurrentStep(-1);
    } finally {
      setUploading(false);
    }

    // Prevent default upload behavior
    return false;
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf',
    beforeUpload: handleUpload,
    showUploadList: false,
    onDrop: (e) => {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  const resetUpload = () => {
    setUploading(false);
    setUploadProgress(0);
    setUploadResult(null);
    setCurrentStep(-1);
    setFileInfo(null);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>📄 FRA Document Upload & Processing</Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          Upload PDF documents for <strong>Telangana</strong> and <strong>Odisha</strong> Forest Rights Act claims. 
          Our AI-powered system will automatically extract text using OCR and identify key entities using NER for efficient processing.
        </Paragraph>
      </div>

      {/* Statistics Row */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic 
              title="Supported States" 
              value={2} 
              prefix={<GlobalOutlined />}
              suffix="States"
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>Telangana & Odisha</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic 
              title="Max File Size" 
              value={50} 
              prefix={<FileProtectOutlined />}
              suffix="MB"
              valueStyle={{ color: '#52c41a' }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>PDF Documents Only</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic 
              title="Processing Time" 
              value="2-5" 
              prefix={<ScanOutlined />}
              suffix="mins"
              valueStyle={{ color: '#fa8c16' }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>OCR + NER Analysis</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic 
              title="Auto Extraction" 
              value="100" 
              prefix={<DatabaseOutlined />}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>AI-Powered Processing</Text>
          </Card>
        </Col>
      </Row>

      {/* Upload Area */}
      <Card 
        title={
          <Space>
            <CloudUploadOutlined />
            <span>Document Upload Center</span>
            {fileInfo && (
              <Tag color="blue">{fileInfo.name}</Tag>
            )}
          </Space>
        } 
        style={{ marginBottom: 24 }}
        extra={
          uploadResult && (
            <Button onClick={resetUpload} size="small">
              Upload Another
            </Button>
          )
        }
      >
        {!uploadResult && (
          <>
            <Alert
              message="📋 Document Requirements"
              description="Please ensure your PDF contains FRA-related content for Telangana or Odisha. Supported documents include claim applications, survey reports, and official notifications."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Dragger 
              {...uploadProps}
              disabled={uploading}
              className="upload-area"
              style={{ 
                background: uploading ? '#f5f5f5' : 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)',
                border: uploading ? '2px dashed #d9d9d9' : '2px dashed #40a9ff',
                borderRadius: '12px',
                padding: '40px 20px',
                transition: 'all 0.3s ease'
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ 
                  fontSize: 64, 
                  color: uploading ? '#d9d9d9' : '#40a9ff',
                  marginBottom: '16px'
                }} />
              </p>
              <p className="ant-upload-text" style={{ 
                fontSize: '18px', 
                fontWeight: '500',
                color: uploading ? '#999' : '#333',
                marginBottom: '8px'
              }}>
                {uploading ? '🔄 Processing your document...' : '📁 Click or drag PDF file here to upload'}
              </p>
              <p className="ant-upload-hint" style={{ 
                fontSize: '14px',
                color: '#666',
                marginBottom: '0'
              }}>
                Support for single PDF file upload. Maximum file size: 50MB.<br/>
                <Text type="secondary">Optimized for FRA documents from Telangana and Odisha</Text>
              </p>
            </Dragger>
          </>
        )}

        {/* File Info Display */}
        {fileInfo && uploading && (
          <Card size="small" style={{ marginTop: 16, background: '#f0f9ff', border: '1px solid #bae7ff' }}>
            <Row>
              <Col span={8}>
                <Text strong>📄 File: </Text>{fileInfo.name}
              </Col>
              <Col span={8}>
                <Text strong>📏 Size: </Text>{fileInfo.size} MB
              </Col>
              <Col span={8}>
                <Text strong>📝 Type: </Text>PDF Document
              </Col>
            </Row>
          </Card>
        )}

        {/* Processing Steps */}
        {uploading && (
          <div style={{ marginTop: 24 }}>
            <Title level={4} style={{ marginBottom: 16 }}>🔄 Processing Pipeline</Title>
            <Steps 
              current={currentStep} 
              size="small"
              items={[
                {
                  title: 'Upload',
                  description: 'Transferring file',
                  icon: <CloudUploadOutlined />
                },
                {
                  title: 'OCR Scan',
                  description: 'Extracting text',
                  icon: <ScanOutlined />
                },
                {
                  title: 'NER Analysis',
                  description: 'Finding entities',
                  icon: <EyeOutlined />
                },
                {
                  title: 'Database',
                  description: 'Storing data',
                  icon: <DatabaseOutlined />
                },
                {
                  title: 'Complete',
                  description: 'Ready for analysis',
                  icon: <CheckCircleOutlined />
                }
              ]}
            />
            
            <div style={{ marginTop: 16 }}>
              <Progress 
                percent={uploadProgress} 
                status={uploadProgress === 100 ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                format={(percent) => `${percent}% ${
                  percent < 20 ? 'Uploading...' : 
                  percent < 40 ? 'OCR Processing...' : 
                  percent < 70 ? 'NER Analysis...' : 
                  percent < 90 ? 'Saving to Database...' : 
                  'Complete!'
                }`}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Upload Result */}
      {uploadResult && (
        <Card 
          title={
            <Space>
              {uploadResult.error ? (
                <WarningOutlined style={{ color: '#ff4d4f' }} />
              ) : (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              )}
              <span>{uploadResult.error ? '❌ Processing Failed' : '✅ Processing Complete'}</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
          extra={
            !uploadResult.error && (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Success
              </Tag>
            )
          }
        >
          {uploadResult.error ? (
            <Alert
              message="Processing Failed"
              description={
                <div>
                  <p>{uploadResult.error}</p>
                  <p style={{ marginTop: 8 }}>
                    <Text type="secondary">
                      💡 Please ensure your PDF contains readable text and is related to FRA claims for Telangana or Odisha.
                    </Text>
                  </p>
                </div>
              }
              type="error"
              showIcon
              action={
                <Button size="small" onClick={resetUpload} type="primary">
                  Try Again
                </Button>
              }
            />
          ) : (
            <div>
              <Alert
                message="🎉 Document Successfully Processed!"
                description="Your FRA document has been processed using OCR and NER technology. All extracted data is now available for claims analysis and GIS visualization."
                type="success"
                showIcon
                style={{ marginBottom: 20 }}
              />
              
              <Row gutter={16}>
                <Col span={12}>
                  <Card size="small" style={{ background: '#f6ffed' }}>
                    <Descriptions title="📋 Document Information" size="small" column={1}>
                      <Descriptions.Item label="Document ID">
                        <Tag color="blue" style={{ fontFamily: 'monospace' }}>
                          {uploadResult.id}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Filename">
                        <Tooltip title={uploadResult.filename}>
                          <Text code>{uploadResult.filename}</Text>
                        </Tooltip>
                      </Descriptions.Item>
                      <Descriptions.Item label="Processing Status">
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          {uploadResult.status}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card size="small" style={{ background: '#fff7e6' }}>
                    <Descriptions title="🤖 AI Analysis Results" size="small" column={1}>
                      <Descriptions.Item label="Entities Extracted">
                        <Tag color="orange" icon={<EyeOutlined />}>
                          {uploadResult.entities_found} entities
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Text Extracted">
                        <Tag color="purple" icon={<ScanOutlined />}>
                          {uploadResult.text_length} characters
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Processing Time">
                        <Tag color="cyan" icon={<InfoCircleOutlined />}>
                          ~2-3 minutes
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>

              <Divider />

              <div style={{ textAlign: 'center', padding: '20px', background: '#fafafa', borderRadius: '8px' }}>
                <Title level={4} style={{ color: '#1890ff', marginBottom: 8 }}>🚀 What's Next?</Title>
                <Space size="large" wrap>
                  <div>
                    <Text strong>📊 Claims Management</Text><br/>
                    <Text type="secondary" style={{ fontSize: '12px' }}>View extracted claims data</Text>
                  </div>
                  <div>
                    <Text strong>🗺️ GIS Visualization</Text><br/>
                    <Text type="secondary" style={{ fontSize: '12px' }}>See spatial data on map</Text>
                  </div>
                  <div>
                    <Text strong>🧠 DSS Analysis</Text><br/>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Get AI recommendations</Text>
                  </div>
                </Space>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Enhanced Instructions */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="🔄 Processing Pipeline" style={{ height: '100%' }}>
            <div style={{ color: '#666' }}>
              <Title level={5} style={{ color: '#1890ff' }}>How Document Processing Works:</Title>
              <Steps 
                direction="vertical" 
                size="small"
                items={[
                  {
                    title: 'File Upload',
                    description: 'Secure PDF upload to our servers',
                    icon: <CloudUploadOutlined />
                  },
                  {
                    title: 'OCR Processing',
                    description: 'Extract text using Tesseract OCR technology',
                    icon: <ScanOutlined />
                  },
                  {
                    title: 'NER Analysis',
                    description: 'Identify entities (persons, locations, dates) using AI',
                    icon: <EyeOutlined />
                  },
                  {
                    title: 'Database Storage',
                    description: 'Store processed data in PostGIS database',
                    icon: <DatabaseOutlined />
                  },
                  {
                    title: 'Analysis Ready',
                    description: 'Document available for claims analysis and GIS visualization',
                    icon: <CheckCircleOutlined />
                  }
                ]}
              />
            </div>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="📝 Supported Document Types" style={{ height: '100%' }}>
            <div style={{ color: '#666' }}>
              <Title level={5} style={{ color: '#1890ff' }}>Optimized for Telangana & Odisha FRA Content:</Title>
              
              <div style={{ marginBottom: 16 }}>
                <Title level={6} style={{ color: '#52c41a', marginBottom: 8 }}>✅ Recommended Documents:</Title>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li><strong>FRA Claim Applications</strong> - Individual & community claims</li>
                  <li><strong>Forest Survey Reports</strong> - Land measurement documents</li>
                  <li><strong>Government Notifications</strong> - Official FRA announcements</li>
                  <li><strong>Land Title Documents</strong> - Patta and revenue records</li>
                  <li><strong>Community Certificates</strong> - Tribal verification documents</li>
                </ul>
              </div>
              
              <div>
                <Title level={6} style={{ color: '#fa8c16', marginBottom: 8 }}>📋 Technical Requirements:</Title>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li>PDF format only (max 50MB)</li>
                  <li>Clear, readable text (not handwritten)</li>
                  <li>English or local language content</li>
                  <li>Documents related to forest rights</li>
                </ul>
              </div>
              
              <Alert
                message="💡 Pro Tip"
                description="For best results, ensure your PDF has clear, high-resolution text. Scanned documents work well if the text is legible."
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DocumentUpload;