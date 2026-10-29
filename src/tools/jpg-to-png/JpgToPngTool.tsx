import React from 'react';
import { DocumentConverterWorkspace } from '../convert-all/DocumentConverterWorkspace';
import { CONVERTER_CONFIGS } from '../convert-all/converterConfigs';

interface JpgToPngToolProps {
  onNavigate: (path: string) => void;
}

export const JpgToPngTool: React.FC<JpgToPngToolProps> = ({ onNavigate }) => {
  return (
    <DocumentConverterWorkspace
      config={CONVERTER_CONFIGS['jpg-to-png']}
      onNavigate={onNavigate}
    />
  );
};
