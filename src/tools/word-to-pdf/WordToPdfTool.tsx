import React from 'react';
import { DocumentConverterWorkspace } from '../convert-all/DocumentConverterWorkspace';
import { CONVERTER_CONFIGS } from '../convert-all/converterConfigs';

interface WordToPdfToolProps {
  onNavigate: (path: string) => void;
}

export const WordToPdfTool: React.FC<WordToPdfToolProps> = ({ onNavigate }) => {
  return (
    <DocumentConverterWorkspace
      config={CONVERTER_CONFIGS['word-to-pdf']}
      onNavigate={onNavigate}
    />
  );
};
