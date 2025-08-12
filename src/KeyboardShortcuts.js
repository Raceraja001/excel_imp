import { useEffect } from 'react';

function KeyboardShortcuts({ 
  onRunPipeline, 
  onExportData, 
  onRunQuality, 
  onRefreshPreview,
  onSaveConfig,
  onUndo 
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if Ctrl (or Cmd on Mac) is pressed
      const isCtrlPressed = event.ctrlKey || event.metaKey;
      
      if (isCtrlPressed) {
        switch (event.key.toLowerCase()) {
          case 'r':
            event.preventDefault();
            onRunPipeline && onRunPipeline();
            break;
          case 'e':
            event.preventDefault();
            onExportData && onExportData();
            break;
          case 'q':
            event.preventDefault();
            onRunQuality && onRunQuality();
            break;
          case 's':
            event.preventDefault();
            onSaveConfig && onSaveConfig();
            break;
          case 'z':
            event.preventDefault();
            onUndo && onUndo();
            break;
          default:
            break;
        }
      } else if (event.key === 'F5') {
        event.preventDefault();
        onRefreshPreview && onRefreshPreview();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onRunPipeline, onExportData, onRunQuality, onRefreshPreview, onSaveConfig, onUndo]);

  return null; // This component doesn't render anything
}

export default KeyboardShortcuts;