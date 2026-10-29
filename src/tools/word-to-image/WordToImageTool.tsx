import React from 'react';
import { DocumentConverterWorkspace } from '../convert-all/DocumentConverterWorkspace';
import { CONVERTER_CONFIGS } from '../convert-all/converterConfigs';

interface WordToImageToolProps {
  onNavigate: (path: string) => void;
}

export const WordToImageTool: React.FC<WordToImageToolProps> = ({ onNavigate }) => {
  return (
    <DocumentConverterWorkspace
      config={CONVERTER_CONFIGS['word-to-image']}
      onNavigate={onNavigate}
    />
  );
};
