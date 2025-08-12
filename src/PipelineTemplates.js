import React, { useState } from 'react';
import './PipelineTemplates.css';

function PipelineTemplates({ onSelectTemplate, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    {
      id: 'clean-import',
      name: 'Clean Excel Import',
      description: 'Upload → Validate → Clean → Import',
      icon: '🧹',
      steps: [
        { component: 'upload', name: 'Excel Source', description: 'Upload Excel file' },
        { component: 'validator', name: 'Data Validator', description: 'Analyze data quality' },
        { component: 'cleaner', name: 'Data Cleaner', description: 'Fix common issues' },
        { component: 'import', name: 'MySQL Import', description: 'Import to database' }
      ],
      config: {
        autoClean: true,
        validateBeforeImport: true,
        handleNulls: 'fill',
        removeDuplicates: true
      }
    },
    {
      id: 'quick-analysis',
      name: 'Quick Analysis',
      description: 'Upload → Validate → Export Report',
      icon: '📊',
      steps: [
        { component: 'upload', name: 'Excel Source', description: 'Upload Excel file' },
        { component: 'validator', name: 'Data Validator', description: 'Analyze data quality' },
        { component: 'reporter', name: 'Report Generator', description: 'Generate quality report' }
      ],
      config: {
        generateReport: true,
        exportFormat: 'json',
        includeStatistics: true
      }
    },
    {
      id: 'schema-mapping',
      name: 'Schema Mapping',
      description: 'Upload → Map → Validate → Import',
      icon: '🎯',
      steps: [
        { component: 'upload', name: 'Excel Source', description: 'Upload Excel file' },
        { component: 'mapping', name: 'Column Mapper', description: 'Map to schema' },
        { component: 'validator', name: 'Data Validator', description: 'Validate mapping' },
        { component: 'import', name: 'MySQL Import', description: 'Import to database' }
      ],
      config: {
        useSchema: true,
        validateMapping: true,
        strictMode: true
      }
    },
    {
      id: 'custom-table',
      name: 'Custom Table Creation',
      description: 'Upload → Generate Table → Import',
      icon: '🏗️',
      steps: [
        { component: 'upload', name: 'Excel Source', description: 'Upload Excel file' },
        { component: 'create-table', name: 'Table Generator', description: 'Create custom table' },
        { component: 'import', name: 'Direct Import', description: 'Import to new table' }
      ],
      config: {
        createTable: true,
        autoDetectTypes: true,
        optimizeStructure: true
      }
    }
  ];

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate && onSelectTemplate) {
      onSelectTemplate(selectedTemplate);
    }
    onClose();
  };

  return (
    <div className="templates-overlay">
      <div className="templates-modal">
        <div className="templates-header">
          <div className="templates-title">
            <span>🚀</span>
            Pipeline Templates
          </div>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="templates-content">
          <div className="templates-grid">
            {templates.map(template => (
              <div 
                key={template.id}
                className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="template-header">
                  <div className="template-icon">{template.icon}</div>
                  <div className="template-info">
                    <div className="template-name">{template.name}</div>
                    <div className="template-description">{template.description}</div>
                  </div>
                </div>

                <div className="template-steps">
                  {template.steps.map((step, index) => (
                    <div key={index} className="template-step">
                      <div className="step-connector">
                        {index < template.steps.length - 1 && <div className="connector-line"></div>}
                      </div>
                      <div className="step-content">
                        <div className="step-name">{step.name}</div>
                        <div className="step-description">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedTemplate && (
            <div className="template-details">
              <div className="details-header">
                <span>{selectedTemplate.icon}</span>
                {selectedTemplate.name}
              </div>
              
              <div className="details-content">
                <div className="details-section">
                  <div className="section-title">Pipeline Steps</div>
                  <div className="steps-list">
                    {selectedTemplate.steps.map((step, index) => (
                      <div key={index} className="step-item">
                        <div className="step-number">{index + 1}</div>
                        <div className="step-details">
                          <div className="step-title">{step.name}</div>
                          <div className="step-desc">{step.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="details-section">
                  <div className="section-title">Configuration</div>
                  <div className="config-list">
                    {Object.entries(selectedTemplate.config).map(([key, value]) => (
                      <div key={key} className="config-item">
                        <span className="config-key">{key}:</span>
                        <span className="config-value">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="templates-footer">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button 
            onClick={handleUseTemplate} 
            disabled={!selectedTemplate}
            className="use-template-btn"
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}

export default PipelineTemplates;