import React from 'react';
import { DocumentConverterWorkspace } from '../convert-all/DocumentConverterWorkspace';
import { CONVERTER_CONFIGS } from '../convert-all/converterConfigs';

interface PdfToWordToolProps {
  onNavigate: (path: string) => void;
}

export const PdfToWordTool: React.FC<PdfToWordToolProps> = ({ onNavigate }) => {
  return (
    <DocumentConverterWorkspace
      config={CONVERTER_CONFIGS['pdf-to-word']}
      onNavigate={onNavigate}
    />
  );
};
