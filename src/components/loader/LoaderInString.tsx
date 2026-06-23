import * as React from 'react';
import './style.css';
interface LoaderProps {
  style?: any;
  showText?: boolean;
  showLoader?: boolean;
}

export const LoaderInString = ({ showText = true, showLoader = true, style = undefined }: LoaderProps) => {
  return (
    <div className="container">
      {showLoader && (
        <div className="icon-container">
          <div className="loading-icon loader"></div>
        </div>
      )}
      {showText && (
        <div className="description">
          <code style={style}>Загрузка статусов</code>
        </div>
      )}
    </div>
  );
};
