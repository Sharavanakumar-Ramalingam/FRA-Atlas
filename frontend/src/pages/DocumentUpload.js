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
  Tag
} from 'antd';
import { 
  InboxOutlined, 
  FileTextOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { api } from '../services/api';

const { Dragger } = Upload;
const { Title, Paragraph } = Typography;

const DocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);

  const handleUpload = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await api.uploadDocument(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadResult(response.data);
      message.success('Document processed successfully!');

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.detail || 'Upload failed';
      message.error(errorMessage);
      setUploadResult({ error: errorMessage });
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
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Upload FRA Documents</Title>
        <Paragraph>
          Upload PDF documents containing Forest Rights Act (FRA) claims, reports, or related documents. 
          The system will automatically extract text using OCR and identify entities using NER.
        </Paragraph>
      </div>

      {/* Upload Area */}
      <Card title="Document Upload" style={{ marginBottom: 24 }}>
        <Dragger 
          {...uploadProps}
          disabled={uploading}
          className="upload-area"
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 48, color: uploading ? '#d9d9d9' : '#40a9ff' }} />
          </p>
          <p className="ant-upload-text">
            {uploading ? 'Processing document...' : 'Click or drag PDF file to this area to upload'}
          </p>
          <p className="ant-upload-hint">
            Support for single PDF file upload. Maximum file size: 50MB.
          </p>
        </Dragger>

        {/* Progress Bar */}
        {uploading && (
          <div style={{ marginTop: 16 }}>
            <Progress 
              percent={uploadProgress} 
              status={uploadProgress === 100 ? 'success' : 'active'}
              format={(percent) => `${percent}% ${percent < 90 ? 'Uploading...' : 'Processing...'}`}
            />
          </div>
        )}
      </Card>

      {/* Upload Result */}
      {uploadResult && (
        <Card 
          title={
            <Space>
              {uploadResult.error ? (
                <FileTextOutlined style={{ color: '#ff4d4f' }} />
              ) : (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              )}
              <span>Processing Result</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          {uploadResult.error ? (
            <Alert
              message="Processing Failed"
              description={uploadResult.error}
              type="error"
              showIcon
            />
          ) : (
            <div>
              <Alert
                message="Document Processed Successfully"
                description="OCR and NER processing completed. Document has been added to the database."
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Descriptions title="Processing Details" bordered size="small">
                <Descriptions.Item label="Document ID">
                  <Tag color="blue">{uploadResult.id}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Filename">
                  {uploadResult.filename}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color="green">{uploadResult.status}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Entities Found">
                  <Tag color="orange">{uploadResult.entities_found}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Text Length">
                  {uploadResult.text_length} characters
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Card>
      )}

      {/* Instructions */}
      <Card title="Processing Information">
        <div style={{ color: '#666' }}>
          <Title level={4}>What happens when you upload?</Title>
          <ol>
            <li><strong>OCR Processing:</strong> Text is extracted from the PDF using Tesseract OCR</li>
            <li><strong>NER Processing:</strong> Named entities (persons, locations, dates, etc.) are identified</li>
            <li><strong>Database Storage:</strong> Processed data is stored in PostGIS database</li>
            <li><strong>Analysis Ready:</strong> Document becomes available for claims analysis and GIS visualization</li>
          </ol>
          
          <Title level={4}>Supported Content:</Title>
          <ul>
            <li>FRA claim applications</li>
            <li>Government reports and notifications</li>
            <li>Land survey documents</li>
            <li>Forest clearance documents</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default DocumentUpload;