import { Button } from '@material-ui/core';
import * as React from 'react';

import { Field, SchemaPipeline } from '../../../store/pipeline/Types';
import { SchemaIndex, TimestampField } from '../CreateIndexPage';

interface GenerateButtonProps {
  topicIds: Array<number>;
  excludedFields: Array<string>;
  flatten: boolean;
  isLoading: boolean;
  disabled: boolean;
  schemasChanges: (schema: SchemaPipeline, autoSchema: SchemaIndex) => void;

  // schemaChanged(schema: SchemaPipeline): any,

  loadingContinueChanged(loading: boolean): any;

  // autoSchemaChanged(autoSchema: SchemaIndex): any,

  createSchema(topicIds: Array<number>, flatten: boolean, excludedFields: Array<string>, successCallback): any;
}

export class GenerateButton extends React.Component<GenerateButtonProps, any> {
  constructor(props) {
    super(props);
  }

  createSchema(topic: Array<number>, excludedFields: Array<string>, flatten: boolean) {
    const autoSchema: SchemaIndex = {
      timestampFields: [],
      allFields: [],
    };
    this.props.createSchema(topic, flatten, excludedFields, (fields) => {
      Object.keys(fields.messageSchemaMap).forEach((key) => {
        const type = fields.messageSchemaMap[key].elementType;
        const field: Field = {
          name: key,
          fieldType: type === 'TIMESTAMP' ? 'DATE' : type,
        };
        autoSchema.allFields.push(field);
        if (type === 'TIMESTAMP') {
          const timestampField: TimestampField = {
            name: key,
            format: fields.messageSchemaMap[key].format,
          };
          autoSchema.timestampFields.push(timestampField);
        }
      });
    });

    return autoSchema;
  }

  render() {
    return (
      <React.Fragment>
        <Button
          disabled={this.props.disabled}
          type="submit"
          variant="contained"
          color="primary"
          style={{
            marginTop: 12,
            marginBottom: 6,
            marginLeft: 6,
            marginRight: 6,
          }}
          onClick={() => {
            const autoSchema: SchemaIndex = this.createSchema(this.props.topicIds, this.props.excludedFields, this.props.flatten);
            const schema: SchemaPipeline = {
              fields: autoSchema.allFields,
              dynamicFields: [],
            };
            this.props.schemasChanges(schema, autoSchema);
            // this.props.autoSchemaChanged(autoSchema);
            // this.props.schemaChanged(schema);
            this.props.loadingContinueChanged(true);
          }}
        >
          Сгенерировать автоматически
        </Button>
      </React.Fragment>
    );
  }
}
