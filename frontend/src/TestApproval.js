// Simple test to verify claim approval functionality
import React from 'react';

const TestApproval = () => {
  const testClaim = {
    id: 1,
    claimant_name: "Test User",
    status: "pending"
  };

  const handleTest = async () => {
    console.log("Testing with claim:", testClaim);
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/claims/${testClaim.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          officer_name: 'Test Officer',
          verification_notes: 'Test approval',
          approval_date: new Date().toISOString()
        })
      });
      
      const result = await response.text();
      console.log("API Response:", result);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  return (
    <div>
      <h3>Test Approval</h3>
      <button onClick={handleTest}>Test API Call</button>
    </div>
  );
};

export default TestApproval;