import React from 'react';
import { DocumentConverterWorkspace } from '../convert-all/DocumentConverterWorkspace';
import { CONVERTER_CONFIGS } from '../convert-all/converterConfigs';

interface ImageToPdfToolProps {
  onNavigate: (path: string) => void;
}

export const ImageToPdfTool: React.FC<ImageToPdfToolProps> = ({ onNavigate }) => {
  return (
    <DocumentConverterWorkspace
      config={CONVERTER_CONFIGS['image-to-pdf']}
      onNavigate={onNavigate}
    />
  );
};
