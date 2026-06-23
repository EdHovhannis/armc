import { Button } from '@material-ui/core';
import * as React from 'react';

import { ARCHIVE_TYPES, ArchiveSchema, Field } from '../../../store/archive/Types';
import { SchemaArchive } from '../ArchiveEditorForm';

interface GenerateButtonPartProps {
  topicIds: Array<number>;
  exclude: Array<string>;
  flatten: boolean;
  isLoading: boolean;
  disabled: boolean;

  schemaChanged(schema: ArchiveSchema): any;

  loadingContinueChanged(loading: boolean): any;

  autoSchemaChanged(autoSchema: SchemaArchive): any;

  createSchema(topicId: Array<number>, flatten: boolean, excludedFields: Array<string>, successCallback): any;
}

export class GenerateButtonPart extends React.Component<GenerateButtonPartProps, any> {
  constructor(props) {
    super(props);
  }

  createSchema(topic: Array<number>, excludedFields: Array<string>, flatten: boolean) {
    const autoSchema: SchemaArchive = {
      allFields: [],
    };
    this.props.createSchema(topic, flatten, excludedFields, (fields) => {
      Object.keys(fields.messageSchemaMap).forEach((key) => {
        const type = fields.messageSchemaMap[key].elementType;
        const field: Field = {
          name: key,
          type: type === 'TIMESTAMP' ? ARCHIVE_TYPES.DATE : type,
        };
        if (field.type === ARCHIVE_TYPES.DATE) {
          field.format = fields.messageSchemaMap[key].format;
        }
        autoSchema.allFields.push(field);
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
            const autoSchema: SchemaArchive = this.createSchema(this.props.topicIds, this.props.exclude, this.props.flatten);
            const schema: ArchiveSchema = {
              fields: autoSchema.allFields,
            };
            this.props.autoSchemaChanged(autoSchema);
            this.props.schemaChanged(schema);
            this.props.loadingContinueChanged(true);
          }}
        >
          Сгенерировать автоматически
        </Button>
      </React.Fragment>
    );
  }
}
