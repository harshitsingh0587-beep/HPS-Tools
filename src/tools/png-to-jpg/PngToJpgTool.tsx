import React from 'react';
import { DocumentConverterWorkspace } from '../convert-all/DocumentConverterWorkspace';
import { CONVERTER_CONFIGS } from '../convert-all/converterConfigs';

interface PngToJpgToolProps {
  onNavigate: (path: string) => void;
}

export const PngToJpgTool: React.FC<PngToJpgToolProps> = ({ onNavigate }) => {
  return (
    <DocumentConverterWorkspace
      config={CONVERTER_CONFIGS['png-to-jpg']}
      onNavigate={onNavigate}
    />
  );
};
