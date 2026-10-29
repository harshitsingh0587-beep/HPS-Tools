import React from 'react';
import { DocumentConverterWorkspace } from '../convert-all/DocumentConverterWorkspace';
import { CONVERTER_CONFIGS } from '../convert-all/converterConfigs';

interface ImageToPowerpointToolProps {
  onNavigate: (path: string) => void;
}

export const ImageToPowerpointTool: React.FC<ImageToPowerpointToolProps> = ({ onNavigate }) => {
  return (
    <DocumentConverterWorkspace
      config={CONVERTER_CONFIGS['image-to-powerpoint']}
      onNavigate={onNavigate}
    />
  );
};
