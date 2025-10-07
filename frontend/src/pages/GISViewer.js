import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Space, Typography, Alert } from 'antd';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
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

// Component to handle map bounds fitting
const MapBoundsHandler = ({ parcelsData }) => {
  const map = useMap();
  
  useEffect(() => {
    if (parcelsData && parcelsData.features && parcelsData.features.length > 0) {
      setTimeout(() => {
        const group = new L.featureGroup();
        parcelsData.features.forEach(feature => {
          if (feature.geometry && feature.geometry.coordinates) {
            const layer = L.geoJSON(feature);
            group.addLayer(layer);
          }
        });
        if (group.getLayers().length > 0) {
          map.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
      }, 500);
    }
  }, [parcelsData, map]);
  
  return null;
};

const GISViewer = () => {
  const [loading, setLoading] = useState(false);
  const [parcelsData, setParcelsData] = useState(null);
  const [filters, setFilters] = useState({
    state: undefined,
    district: undefined,
    village: undefined
  });
  const [mapCenter, setMapCenter] = useState([19.5, 82.5]); // Center between Telangana and Odisha
  const [mapZoom, setMapZoom] = useState(6);

  useEffect(() => {
    loadParcelsData();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadParcelsData = async () => {
    setLoading(true);
    try {
      const response = await api.getParcels(filters);
      const data = response.data;
      
      console.log('Received parcels data:', data); // Debug log
      
      if (data && data.type === 'FeatureCollection') {
        // Filter out features with invalid geometry
        const validFeatures = data.features.filter(feature => {
          if (!feature.geometry || !feature.geometry.coordinates) {
            console.warn('Skipping feature with invalid geometry:', feature);
            return false;
          }
          return true;
        });
        
        const featuresData = {
          ...data,
          features: validFeatures
        };
        
        setParcelsData(featuresData);
        
      } else {
        console.warn('Invalid data format received:', data);
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
      const status = props.status || 'pending';
      const statusText = status.charAt(0).toUpperCase() + status.slice(1);
      const statusColor = status === 'approved' ? '#52c41a' : status === 'rejected' ? '#f5222d' : '#fa8c16';
      
      const popupContent = `
        <div style="min-width: 280px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <h4 style="margin: 0 0 12px 0; color: #1890ff; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px;">📍 FRA Parcel Details</h4>
          
          <div style="margin-bottom: 12px;">
            <span style="background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">
              ${statusText.toUpperCase()}
            </span>
          </div>
          
          <div style="display: grid; gap: 6px;">
            <p style="margin: 0;"><strong>👤 Claimant:</strong> ${props.claimant_name || 'N/A'}</p>
            <p style="margin: 0;"><strong>📋 Claim Type:</strong> ${props.claim_type || 'N/A'}</p>
            <p style="margin: 0;"><strong>🏷️ Parcel ID:</strong> ${props.parcel_id || 'N/A'}</p>
            <p style="margin: 0;"><strong>🏘️ Village:</strong> ${props.village || 'N/A'}</p>
            <p style="margin: 0;"><strong>🏛️ District:</strong> ${props.district || 'N/A'}</p>
            <p style="margin: 0;"><strong>🗺️ State:</strong> ${props.state || 'N/A'}</p>
            <p style="margin: 0;"><strong>📏 Area:</strong> ${props.area_hectares ? `${props.area_hectares} hectares` : 'N/A'}</p>
            <p style="margin: 0;"><strong>🌾 Land Type:</strong> ${props.land_type || 'N/A'}</p>
            <p style="margin: 0;"><strong>📊 Survey Number:</strong> ${props.survey_number || 'N/A'}</p>
            ${props.boundaries ? `<p style="margin: 6px 0 0 0;"><strong>🗺️ Boundaries:</strong><br><small>${props.boundaries}</small></p>` : ''}
          </div>
        </div>
      `;
      layer.bindPopup(popupContent);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>🗺️ FRA Atlas - GIS Viewer</Title>
        <p>Interactive map visualization of Forest Rights Act parcels in <strong>Telangana</strong> and <strong>Odisha</strong> states</p>
      </div>

      {/* Map Controls */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Space size="middle">
            <Button 
              type={filters.state === 'Telangana' ? 'primary' : 'default'}
              onClick={() => setFilters({ state: 'Telangana', district: undefined, village: undefined })}
              style={{ borderRadius: '6px' }}
            >
              🏛️ Telangana
            </Button>
            <Button 
              type={filters.state === 'Odisha' ? 'primary' : 'default'}
              onClick={() => setFilters({ state: 'Odisha', district: undefined, village: undefined })}
              style={{ borderRadius: '6px' }}
            >
              🏛️ Odisha
            </Button>
            <Button 
              onClick={() => setFilters({ state: undefined, district: undefined, village: undefined })}
              style={{ borderRadius: '6px' }}
            >
              🌍 View All
            </Button>
          </Space>
        </div>
        
        <Space size="middle" wrap>
          <Select
            placeholder="Select State"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('state', value)}
            value={filters.state}
          >
            <Option value="Telangana">Telangana</Option>
            <Option value="Odisha">Odisha</Option>
          </Select>

          <Select
            placeholder="Select District"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('district', value)}
            value={filters.district}
            disabled={!filters.state}
          >
            {/* Telangana Districts */}
            {filters.state === 'Telangana' && (
              <>
                <Option value="Warangal">Warangal</Option>
                <Option value="Khammam">Khammam</Option>
                <Option value="Adilabad">Adilabad</Option>
                <Option value="Medak">Medak</Option>
              </>
            )}
            {/* Odisha Districts */}
            {filters.state === 'Odisha' && (
              <>
                <Option value="Kalahandi">Kalahandi</Option>
                <Option value="Rayagada">Rayagada</Option>
                <Option value="Sundargarh">Sundargarh</Option>
                <Option value="Koraput">Koraput</Option>
              </>
            )}
          </Select>

          <Select
            placeholder="Select Village"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('village', value)}
            value={filters.village}
            disabled={!filters.district}
          >
            {/* Telangana Villages */}
            {filters.state === 'Telangana' && filters.district === 'Warangal' && (
              <Option value="Eturunagaram">Eturunagaram</Option>
            )}
            {filters.state === 'Telangana' && filters.district === 'Khammam' && (
              <Option value="Bhadrachalam">Bhadrachalam</Option>
            )}
            {filters.state === 'Telangana' && filters.district === 'Adilabad' && (
              <Option value="Utnoor">Utnoor</Option>
            )}
            {filters.state === 'Telangana' && filters.district === 'Medak' && (
              <Option value="Medak">Medak</Option>
            )}
            {/* Odisha Villages */}
            {filters.state === 'Odisha' && filters.district === 'Kalahandi' && (
              <Option value="Bhawanipatna">Bhawanipatna</Option>
            )}
            {filters.state === 'Odisha' && filters.district === 'Rayagada' && (
              <Option value="Rayagada">Rayagada</Option>
            )}
            {filters.state === 'Odisha' && filters.district === 'Sundargarh' && (
              <Option value="Sundargarh">Sundargarh</Option>
            )}
            {filters.state === 'Odisha' && filters.district === 'Koraput' && (
              <Option value="Koraput">Koraput</Option>
            )}
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
            <span>🌏 FRA Parcels Map - Telangana & Odisha</span>
            {parcelsData && (
              <span style={{ fontWeight: 'normal', fontSize: '14px', color: '#666' }}>
                ({parcelsData.features?.length || 0} parcels loaded)
              </span>
            )}
          </Space>
        }
        loading={loading}
      >
        {!parcelsData && !loading && (
          <Alert
            message="🗺️ No FRA parcel data available"
            description="No spatial data found for the selected location. Try selecting Telangana or Odisha state to view available FRA parcels, or adjust your filters."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" onClick={() => {
                setFilters({ state: 'Telangana', district: undefined, village: undefined });
              }}>
                View Telangana Parcels
              </Button>
            }
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
            
            {/* Handle map bounds automatically */}
            <MapBoundsHandler parcelsData={parcelsData} />
          </MapContainer>
        </div>

        {/* Legend with status counts */}
        <div style={{ marginTop: 16, padding: '16px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#1890ff' }}>📊 Claim Status Legend</h4>
          <Space size="large" wrap>
            <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'white', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                backgroundColor: '#52c41a', 
                marginRight: '12px',
                borderRadius: '4px',
                border: '2px solid #389e0d'
              }}></div>
              <span style={{ fontWeight: '500' }}>✅ Approved ({parcelsData ? parcelsData.features.filter(f => f.properties.status === 'approved').length : 0})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'white', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                backgroundColor: '#fa8c16', 
                marginRight: '12px',
                borderRadius: '4px',
                border: '2px solid #d46b08'
              }}></div>
              <span style={{ fontWeight: '500' }}>⏳ Pending ({parcelsData ? parcelsData.features.filter(f => f.properties.status === 'pending').length : 0})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'white', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                backgroundColor: '#f5222d', 
                marginRight: '12px',
                borderRadius: '4px',
                border: '2px solid #cf1322'
              }}></div>
              <span style={{ fontWeight: '500' }}>❌ Rejected ({parcelsData ? parcelsData.features.filter(f => f.properties.status === 'rejected').length : 0})</span>
            </div>
          </Space>
          
          {parcelsData && parcelsData.features.length > 0 && (
            <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(255,255,255,0.7)', borderRadius: '4px' }}>
              <small style={{ color: '#666', fontStyle: 'italic' }}>
                💡 Click on any parcel to view detailed claim information. Colors represent real-time claim status from the Claims Management system.
              </small>
            </div>
          )}
        </div>
      </Card>

      {/* Instructions */}
      <Card title="🚀 How to Use the FRA GIS Viewer" style={{ marginTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div>
            <h4 style={{ color: '#1890ff', marginBottom: '8px' }}>🔍 Filtering Parcels</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Select <strong>Telangana</strong> or <strong>Odisha</strong> state to view FRA parcels</li>
              <li>Choose specific districts and villages to narrow down results</li>
              <li>Use "Clear Filters" to reset and view all available parcels</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#1890ff', marginBottom: '8px' }}>🗺️ Map Interaction</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Click on any colored parcel to view detailed claim information</li>
              <li>Use mouse wheel or zoom controls to zoom in/out</li>
              <li>Drag to pan around the map</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#1890ff', marginBottom: '8px' }}>🎨 Status Colors</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><span style={{ color: '#52c41a', fontWeight: 'bold' }}>Green</span> = Approved claims (rights granted)</li>
              <li><span style={{ color: '#fa8c16', fontWeight: 'bold' }}>Orange</span> = Pending claims (under review)</li>
              <li><span style={{ color: '#f5222d', fontWeight: 'bold' }}>Red</span> = Rejected claims (denied)</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#1890ff', marginBottom: '8px' }}>🔄 Real-time Updates</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Status changes in Claims Management reflect immediately here</li>
              <li>Click "Refresh Map" to reload latest data</li>
              <li>Map automatically focuses on available parcels</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GISViewer;