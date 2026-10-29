import React from 'react';
import { DocumentConverterWorkspace } from '../convert-all/DocumentConverterWorkspace';
import { CONVERTER_CONFIGS } from '../convert-all/converterConfigs';

interface ImageToWordToolProps {
  onNavigate: (path: string) => void;
}

export const ImageToWordTool: React.FC<ImageToWordToolProps> = ({ onNavigate }) => {
  return (
    <DocumentConverterWorkspace
      config={CONVERTER_CONFIGS['image-to-word']}
      onNavigate={onNavigate}
    />
  );
};
