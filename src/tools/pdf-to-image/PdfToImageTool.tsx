import React from 'react';
import { DocumentConverterWorkspace } from '../convert-all/DocumentConverterWorkspace';
import { CONVERTER_CONFIGS } from '../convert-all/converterConfigs';

interface PdfToImageToolProps {
  onNavigate: (path: string) => void;
}

export const PdfToImageTool: React.FC<PdfToImageToolProps> = ({ onNavigate }) => {
  return (
    <DocumentConverterWorkspace
      config={CONVERTER_CONFIGS['pdf-to-image']}
      onNavigate={onNavigate}
    />
  );
};
