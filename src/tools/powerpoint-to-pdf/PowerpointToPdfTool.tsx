import React from 'react';
import { DocumentConverterWorkspace } from '../convert-all/DocumentConverterWorkspace';
import { CONVERTER_CONFIGS } from '../convert-all/converterConfigs';

interface PowerpointToPdfToolProps {
  onNavigate: (path: string) => void;
}

export const PowerpointToPdfTool: React.FC<PowerpointToPdfToolProps> = ({ onNavigate }) => {
  return (
    <DocumentConverterWorkspace
      config={CONVERTER_CONFIGS['powerpoint-to-pdf']}
      onNavigate={onNavigate}
    />
  );
};
