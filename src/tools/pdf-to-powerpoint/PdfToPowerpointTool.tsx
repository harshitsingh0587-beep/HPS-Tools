import React from 'react';
import { DocumentConverterWorkspace } from '../convert-all/DocumentConverterWorkspace';
import { CONVERTER_CONFIGS } from '../convert-all/converterConfigs';

interface PdfToPowerpointToolProps {
  onNavigate: (path: string) => void;
}

export const PdfToPowerpointTool: React.FC<PdfToPowerpointToolProps> = ({ onNavigate }) => {
  return (
    <DocumentConverterWorkspace
      config={CONVERTER_CONFIGS['pdf-to-powerpoint']}
      onNavigate={onNavigate}
    />
  );
};
