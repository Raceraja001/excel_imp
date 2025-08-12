import React, { useState, useEffect } from 'react';
import './DataValidator.css';

function DataValidator({ fileInfo, onValidationComplete }) {
  const [validationResults, setValidationResults] = useState(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (fileInfo) {
      performValidation();
    }
  }, [fileInfo]);

  const performValidation = async () => {
    setValidating(true);
    
    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const results = analyzeData(fileInfo);
    setValidationResults(results);
    setValidating(false);
    
    if (onValidationComplete) {
      onValidationComplete(results);
    }
  };

  const analyzeData = (fileInfo) => {
    const results = {
      totalRows: fileInfo.rows,
      totalColumns: fileInfo.columns.length,
      qualityScore: 0,
      issues: [],
      columnAnalysis: {},
      recommendations: []
    };

    let qualityPoints = 0;
    let maxPoints = 0;

    // Analyze each column
    fileInfo.columns.forEach(column => {
      const columnData = fileInfo.preview.map(row => row[column]);
      const analysis = analyzeColumn(column, columnData);
      results.columnAnalysis[column] = analysis;
      
      qualityPoints += analysis.qualityScore;
      maxPoints += 100;
      
      // Collect issues
      if (analysis.issues.length > 0) {
        results.issues.push(...analysis.issues.map(issue => ({
          column,
          type: issue.type,
          message: issue.message,
          severity: issue.severity
        })));
      }
    });

    // Calculate overall quality score
    results.qualityScore = Math.round((qualityPoints / maxPoints) * 100);

    // Generate recommendations
    results.recommendations = generateRecommendations(results);

    return results;
  };

  const analyzeColumn = (columnName, data) => {
    const analysis = {
      name: columnName,
      dataType: 'unknown',
      nullCount: 0,
      uniqueCount: 0,
      duplicateCount: 0,
      patterns: [],
      issues: [],
      qualityScore: 100
    };

    const nonNullData = data.filter(value => value !== null && value !== undefined && value !== '');
    analysis.nullCount = data.length - nonNullData.length;
    analysis.uniqueCount = new Set(nonNullData).size;
    analysis.duplicateCount = nonNullData.length - analysis.uniqueCount;

    if (nonNullData.length === 0) {
      analysis.dataType = 'empty';
      analysis.qualityScore = 0;
      analysis.issues.push({
        type: 'empty_column',
        message: 'Column contains no data',
        severity: 'high'
      });
      return analysis;
    }

    // Detect data type
    analysis.dataType = detectDataType(nonNullData);

    // Validate based on detected type
    switch (analysis.dataType) {
      case 'email':
        validateEmails(nonNullData, analysis);
        break;
      case 'phone':
        validatePhones(nonNullData, analysis);
        break;
      case 'date':
        validateDates(nonNullData, analysis);
        break;
      case 'number':
        validateNumbers(nonNullData, analysis);
        break;
      default:
        validateText(nonNullData, analysis);
    }

    // Check for high null percentage
    const nullPercentage = (analysis.nullCount / data.length) * 100;
    if (nullPercentage > 20) {
      analysis.qualityScore -= 20;
      analysis.issues.push({
        type: 'high_nulls',
        message: `${nullPercentage.toFixed(1)}% null values`,
        severity: nullPercentage > 50 ? 'high' : 'medium'
      });
    }

    // Check for low uniqueness (potential duplicates)
    const uniquenessRatio = analysis.uniqueCount / nonNullData.length;
    if (uniquenessRatio < 0.8 && analysis.dataType !== 'category') {
      analysis.qualityScore -= 15;
      analysis.issues.push({
        type: 'low_uniqueness',
        message: `Only ${(uniquenessRatio * 100).toFixed(1)}% unique values`,
        severity: 'medium'
      });
    }

    return analysis;
  };

  const detectDataType = (data) => {
    const sample = data.slice(0, Math.min(10, data.length));
    
    // Check for emails
    if (sample.every(value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)))) {
      return 'email';
    }
    
    // Check for phone numbers
    if (sample.every(value => /^[\+]?[\d\s\-\(\)]{7,}$/.test(String(value)))) {
      return 'phone';
    }
    
    // Check for dates
    if (sample.every(value => !isNaN(Date.parse(String(value))))) {
      return 'date';
    }
    
    // Check for numbers
    if (sample.every(value => !isNaN(parseFloat(String(value))))) {
      return 'number';
    }
    
    // Check for categories (repeated values)
    const uniqueValues = new Set(data);
    if (uniqueValues.size <= Math.max(5, data.length * 0.1)) {
      return 'category';
    }
    
    return 'text';
  };

  const validateEmails = (data, analysis) => {
    const invalidEmails = data.filter(email => 
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))
    );
    
    if (invalidEmails.length > 0) {
      analysis.qualityScore -= Math.min(30, (invalidEmails.length / data.length) * 100);
      analysis.issues.push({
        type: 'invalid_email',
        message: `${invalidEmails.length} invalid email addresses`,
        severity: 'high'
      });
    }
  };

  const validatePhones = (data, analysis) => {
    const invalidPhones = data.filter(phone => 
      !/^[\+]?[\d\s\-\(\)]{7,}$/.test(String(phone))
    );
    
    if (invalidPhones.length > 0) {
      analysis.qualityScore -= Math.min(25, (invalidPhones.length / data.length) * 100);
      analysis.issues.push({
        type: 'invalid_phone',
        message: `${invalidPhones.length} invalid phone numbers`,
        severity: 'medium'
      });
    }
  };

  const validateDates = (data, analysis) => {
    const invalidDates = data.filter(date => 
      isNaN(Date.parse(String(date)))
    );
    
    if (invalidDates.length > 0) {
      analysis.qualityScore -= Math.min(25, (invalidDates.length / data.length) * 100);
      analysis.issues.push({
        type: 'invalid_date',
        message: `${invalidDates.length} invalid dates`,
        severity: 'medium'
      });
    }
  };

  const validateNumbers = (data, analysis) => {
    const invalidNumbers = data.filter(num => 
      isNaN(parseFloat(String(num)))
    );
    
    if (invalidNumbers.length > 0) {
      analysis.qualityScore -= Math.min(20, (invalidNumbers.length / data.length) * 100);
      analysis.issues.push({
        type: 'invalid_number',
        message: `${invalidNumbers.length} invalid numbers`,
        severity: 'medium'
      });
    }
  };

  const validateText = (data, analysis) => {
    // Check for excessive whitespace
    const whitespaceIssues = data.filter(text => 
      String(text).trim() !== String(text) || /\s{2,}/.test(String(text))
    );
    
    if (whitespaceIssues.length > 0) {
      analysis.qualityScore -= 10;
      analysis.issues.push({
        type: 'whitespace_issues',
        message: `${whitespaceIssues.length} values with whitespace issues`,
        severity: 'low'
      });
    }
  };

  const generateRecommendations = (results) => {
    const recommendations = [];
    
    if (results.qualityScore < 70) {
      recommendations.push({
        type: 'quality',
        message: 'Consider cleaning data before import',
        action: 'Add data cleansing transformations'
      });
    }
    
    const highNullColumns = Object.entries(results.columnAnalysis)
      .filter(([_, analysis]) => (analysis.nullCount / results.totalRows) > 0.3)
      .map(([name, _]) => name);
    
    if (highNullColumns.length > 0) {
      recommendations.push({
        type: 'nulls',
        message: `Columns with high null values: ${highNullColumns.join(', ')}`,
        action: 'Consider null handling strategies'
      });
    }
    
    const duplicateColumns = Object.entries(results.columnAnalysis)
      .filter(([_, analysis]) => analysis.duplicateCount > results.totalRows * 0.5)
      .map(([name, _]) => name);
    
    if (duplicateColumns.length > 0) {
      recommendations.push({
        type: 'duplicates',
        message: `Columns with many duplicates: ${duplicateColumns.join(', ')}`,
        action: 'Consider duplicate removal or grouping'
      });
    }
    
    return recommendations;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#d13438';
      case 'medium': return '#ffb900';
      case 'low': return '#107c10';
      default: return '#605e5c';
    }
  };

  const getQualityColor = (score) => {
    if (score >= 80) return '#107c10';
    if (score >= 60) return '#ffb900';
    return '#d13438';
  };

  if (!validationResults) {
    return (
      <div className="data-validator">
        <div className="validation-header">
          <div className="validation-title">
            <span>🔍</span>
            Data Quality Analysis
          </div>
          {validating && (
            <div className="validation-loading">
              <div className="loading-spinner"></div>
              Analyzing data quality...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="data-validator">
      <div className="validation-header">
        <div className="validation-title">
          <span>🔍</span>
          Data Quality Analysis
        </div>
        <div className="quality-score" style={{ color: getQualityColor(validationResults.qualityScore) }}>
          {validationResults.qualityScore}%
        </div>
      </div>

      <div className="validation-summary">
        <div className="summary-item">
          <div className="summary-label">Total Rows</div>
          <div className="summary-value">{validationResults.totalRows.toLocaleString()}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Columns</div>
          <div className="summary-value">{validationResults.totalColumns}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Issues Found</div>
          <div className="summary-value">{validationResults.issues.length}</div>
        </div>
      </div>

      {validationResults.issues.length > 0 && (
        <div className="validation-issues">
          <div className="issues-header">Data Quality Issues</div>
          {validationResults.issues.slice(0, 5).map((issue, index) => (
            <div key={index} className="issue-item">
              <div 
                className="issue-severity" 
                style={{ backgroundColor: getSeverityColor(issue.severity) }}
              ></div>
              <div className="issue-content">
                <div className="issue-column">{issue.column}</div>
                <div className="issue-message">{issue.message}</div>
              </div>
            </div>
          ))}
          {validationResults.issues.length > 5 && (
            <div className="issues-more">
              +{validationResults.issues.length - 5} more issues
            </div>
          )}
        </div>
      )}

      {validationResults.recommendations.length > 0 && (
        <div className="validation-recommendations">
          <div className="recommendations-header">Recommendations</div>
          {validationResults.recommendations.map((rec, index) => (
            <div key={index} className="recommendation-item">
              <div className="recommendation-icon">💡</div>
              <div className="recommendation-content">
                <div className="recommendation-message">{rec.message}</div>
                <div className="recommendation-action">{rec.action}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="column-analysis">
        <div className="analysis-header">Column Analysis</div>
        <div className="analysis-grid">
          {Object.entries(validationResults.columnAnalysis).map(([name, analysis]) => (
            <div key={name} className="column-card">
              <div className="column-header">
                <div className="column-name">{name}</div>
                <div className={`column-type type-${analysis.dataType}`}>
                  {analysis.dataType}
                </div>
              </div>
              <div className="column-stats">
                <div className="stat-item">
                  <span className="stat-label">Nulls:</span>
                  <span className="stat-value">{analysis.nullCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Unique:</span>
                  <span className="stat-value">{analysis.uniqueCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Quality:</span>
                  <span 
                    className="stat-value" 
                    style={{ color: getQualityColor(analysis.qualityScore) }}
                  >
                    {analysis.qualityScore}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DataValidator;