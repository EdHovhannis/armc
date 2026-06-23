import { DataGrid } from '@material-ui/data-grid';
import React from 'react';

export class DraggableDataGrid extends React.Component<any, any> {
  private dragStartColumn: any = null;

  handleDragStart = (column: any, e: React.DragEvent) => {
    this.dragStartColumn = column;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', column.field);
    (e.target as HTMLElement).style.opacity = '0.5';
  };

  handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '';
  };

  handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  handleDrop = (targetColumn: any, e: React.DragEvent) => {
    e.preventDefault();
    if (!this.dragStartColumn || this.dragStartColumn.field === targetColumn.field) return;

    const columns = [...this.props.columns];
    const fromIndex = columns.findIndex((c) => c.field === this.dragStartColumn.field);
    const toIndex = columns.findIndex((c) => c.field === targetColumn.field);

    const [removed] = columns.splice(fromIndex, 1);
    columns.splice(toIndex, 0, removed);

    const flexValue = 1 / columns.length;
    columns.forEach((col) => {
      col.flex = flexValue;
    });

    this.props.onColumnReorder(columns);
    this.dragStartColumn = null;
  };

  render() {
    const { columns, onColumnReorder, ...restProps } = this.props;

    const draggableColumns = columns.map((col: any) => ({
      ...col,
      renderHeader: (params: any) => (
        <div
          draggable
          onDragStart={(e) => this.handleDragStart(col, e)}
          onDragEnd={this.handleDragEnd}
          onDragOver={this.handleDragOver}
          onDrop={(e) => this.handleDrop(col, e)}
          style={{ cursor: 'grab', userSelect: 'none', width: '100%' }}
        >
          {col.headerName}
        </div>
      ),
    }));

    return <DataGrid {...restProps} columns={draggableColumns} />;
  }
}
