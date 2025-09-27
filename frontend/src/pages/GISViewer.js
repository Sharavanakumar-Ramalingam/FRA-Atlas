import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Space, Typography, Alert } from 'antd';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { GlobalOutlined, AppstoreOutlined, ReloadOutlined } from '@ant-design/icons';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const { Option } = Select;
const { Title } = Typography;

const GISViewer = () => {
  const [loading, setLoading] = useState(false);
  const [parcelsData, setParcelsData] = useState(null);
  const [filters, setFilters] = useState({
    state: undefined,
    district: undefined,
    village: undefined
  });
  const [mapCenter] = useState([20.5937, 78.9629]); // Center of India
  const [mapZoom] = useState(5);

  useEffect(() => {
    loadParcelsData();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadParcelsData = async () => {
    setLoading(true);
    try {
      const response = await api.getParcels(filters);
      const data = response.data;
      
      if (data && data.type === 'FeatureCollection') {
        setParcelsData(data);
      } else {
        setParcelsData(null);
      }
    } catch (error) {
      console.error('Error loading parcels data:', error);
      setParcelsData(null);
    } finally {
      setLoading(false);
    }
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
      village: undefined
    });
  };

  const getFeatureStyle = (feature) => {
    // Style parcels based on properties
    const properties = feature.properties || {};
    const status = properties.status || 'pending';
    
    let color;
    switch (status) {
      case 'approved':
        color = '#52c41a';
        break;
      case 'rejected':
        color = '#f5222d';
        break;
      default:
        color = '#fa8c16';
    }

    return {
      fillColor: color,
      fillOpacity: 0.6,
      color: color,
      weight: 2,
      opacity: 0.8
    };
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const props = feature.properties;
      const popupContent = `
        <div style="min-width: 200px;">
          <h4>Parcel Information</h4>
          <p><strong>Parcel ID:</strong> ${props.parcel_id || 'N/A'}</p>
          <p><strong>Village:</strong> ${props.village || 'N/A'}</p>
          <p><strong>District:</strong> ${props.district || 'N/A'}</p>
          <p><strong>State:</strong> ${props.state || 'N/A'}</p>
          <p><strong>Area:</strong> ${props.area_hectares ? `${props.area_hectares} ha` : 'N/A'}</p>
          <p><strong>Land Type:</strong> ${props.land_type || 'N/A'}</p>
          <p><strong>Survey Number:</strong> ${props.survey_number || 'N/A'}</p>
        </div>
      `;
      layer.bindPopup(popupContent);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>GIS Viewer</Title>
        <p>Interactive map visualization of FRA parcels and claims</p>
      </div>

      {/* Map Controls */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" wrap>
          <Select
            placeholder="Select State"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('state', value)}
            value={filters.state}
          >
            <Option value="Andhra Pradesh">Andhra Pradesh</Option>
            <Option value="Arunachal Pradesh">Arunachal Pradesh</Option>
            <Option value="Assam">Assam</Option>
            <Option value="Chhattisgarh">Chhattisgarh</Option>
            <Option value="Jharkhand">Jharkhand</Option>
            <Option value="Madhya Pradesh">Madhya Pradesh</Option>
            <Option value="Maharashtra">Maharashtra</Option>
            <Option value="Odisha">Odisha</Option>
            <Option value="Rajasthan">Rajasthan</Option>
            <Option value="West Bengal">West Bengal</Option>
          </Select>

          <Select
            placeholder="Select District"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('district', value)}
            value={filters.district}
            disabled={!filters.state}
          >
            {/* Districts would be populated based on selected state */}
            <Option value="District 1">District 1</Option>
            <Option value="District 2">District 2</Option>
          </Select>

          <Select
            placeholder="Select Village"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('village', value)}
            value={filters.village}
            disabled={!filters.district}
          >
            {/* Villages would be populated based on selected district */}
            <Option value="Village 1">Village 1</Option>
            <Option value="Village 2">Village 2</Option>
          </Select>

          <Button 
            icon={<AppstoreOutlined />} 
            onClick={resetFilters}
          >
            Clear Filters
          </Button>

          <Button 
            type="primary"
            icon={<ReloadOutlined />} 
            onClick={loadParcelsData}
            loading={loading}
          >
            Refresh Map
          </Button>
        </Space>
      </Card>

      {/* Map */}
      <Card 
        title={
          <Space>
            <GlobalOutlined />
            <span>FRA Parcels Map</span>
            {parcelsData && (
              <span style={{ fontWeight: 'normal', fontSize: '14px' }}>
                ({parcelsData.features?.length || 0} parcels)
              </span>
            )}
          </Space>
        }
        loading={loading}
      >
        {!parcelsData && !loading && (
          <Alert
            message="No parcel data available"
            description="No spatial data found for the selected filters. Try adjusting your filters or upload documents with spatial information."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <div style={{ height: '600px', width: '100%' }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
          >
            {/* Base map layer */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Satellite layer option */}
            {/* <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            /> */}

            {/* FRA Parcels GeoJSON Layer */}
            {parcelsData && parcelsData.features && parcelsData.features.length > 0 && (
              <GeoJSON
                data={parcelsData}
                style={getFeatureStyle}
                onEachFeature={onEachFeature}
              />
            )}
          </MapContainer>
        </div>

        {/* Legend */}
        <div style={{ marginTop: 16, padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
          <h4 style={{ margin: '0 0 8px 0' }}>Legend</h4>
          <Space>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                backgroundColor: '#52c41a', 
                marginRight: '8px',
                border: '1px solid #ccc'
              }}></div>
              <span>Approved Claims</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                backgroundColor: '#fa8c16', 
                marginRight: '8px',
                border: '1px solid #ccc'
              }}></div>
              <span>Pending Claims</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                backgroundColor: '#f5222d', 
                marginRight: '8px',
                border: '1px solid #ccc'
              }}></div>
              <span>Rejected Claims</span>
            </div>
          </Space>
        </div>
      </Card>

      {/* Instructions */}
      <Card title="How to Use" style={{ marginTop: 16 }}>
        <ul>
          <li>Use the filters above to narrow down parcels by location</li>
          <li>Click on any parcel on the map to view detailed information</li>
          <li>Different colors represent different claim statuses (see legend)</li>
          <li>Use the map controls to zoom and pan around the map</li>
          <li>Click "Refresh Map" to reload the data after changing filters</li>
        </ul>
      </Card>
    </div>
  );
};

export default GISViewer;