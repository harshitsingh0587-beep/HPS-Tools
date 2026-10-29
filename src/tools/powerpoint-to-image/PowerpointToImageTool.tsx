import React from 'react';
import { DocumentConverterWorkspace } from '../convert-all/DocumentConverterWorkspace';
import { CONVERTER_CONFIGS } from '../convert-all/converterConfigs';

interface PowerpointToImageToolProps {
  onNavigate: (path: string) => void;
}

export const PowerpointToImageTool: React.FC<PowerpointToImageToolProps> = ({ onNavigate }) => {
  return (
    <DocumentConverterWorkspace
      config={CONVERTER_CONFIGS['powerpoint-to-image']}
      onNavigate={onNavigate}
    />
  );
};
