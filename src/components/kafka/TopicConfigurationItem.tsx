import { Grid } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar/AppBar';
import Tab from '@material-ui/core/Tab/Tab';
import Tabs from '@material-ui/core/Tabs/Tabs';
import * as React from 'react';

import PermissionUserView from '../../containers/permissions/PermissionUserView';
import { AuthType } from '../../store/auth/Types';
import { ClientACLRecord, KafkaTopic } from '../../store/kafka/Types';
import { Project } from '../../store/project/Types';
import { Resource, Role } from '../../store/role/Types';
import { Loader } from '../utils/Loader';

import ACLConfigurationItem from './ACLConfigurationItem';
import TopicInfoForm from './TopicInfoForm';

export interface TopicConfigurationItemState {
  currentTab: number;
  topic: KafkaTopic;
  aclRecords: Array<ClientACLRecord>;
}

export interface TopicConfigurationItemProps {
  isAdmin: boolean;
  authType: AuthType;
  canEdit: boolean;
  isLoading: boolean;
  aclEnable: boolean;
  aclRecords: Array<ClientACLRecord>;
  refreshACL: () => void;
  topic: KafkaTopic;
  projectShortName: string;
  projects: Array<Project>;
  updateTopic: (topic: KafkaTopic, onSuccess?) => void;
  displayError: (msg: string) => void;
  addACL: (topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], successCallback?) => void;
  deleteACL: (topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], successCallback?) => void;
  updateACL: (topicName: string, projectShortName: string, aclRecords: ClientACLRecord[], successCallback?) => void;
}

export default class TopicConfigurationItem extends React.Component<TopicConfigurationItemProps, TopicConfigurationItemState> {
  topicViewParts: Array<any>;
  isLegacyMode: boolean;

  constructor(props) {
    super(props);
    this.isLegacyMode = this.props.authType === 'legacy';
    this.topicViewParts = [];

    this.state = {
      topic: this.props.topic,
      currentTab: 0,
      aclRecords: this.props.aclRecords,
    };
  }

  buildParts() {
    const configMenuItem = [
      {
        name: 'Конфигурация топика',
        value: (
          <TopicInfoForm
            canEdit={this.props.canEdit}
            isAdmin={this.props.isAdmin}
            initialTopic={this.props.topic}
            projects={this.props.projects}
            handleTopicSubmit={(topic) => {
              this.props.updateTopic(topic);
            }}
          />
        ),
      },
    ];
    const rightsMenuItem = [
      {
        name: 'Права',
        value: (
          <React.Fragment>
            <Grid item container alignItems="center" justifyContent="center" style={{ marginTop: '1vw' }}>
              <Grid item xs={9}>
                <PermissionUserView
                  canEditAccess={this.props.isAdmin || this.props.topic.canManageAccess}
                  resourceId={this.props.topic.id}
                  resource={Resource.KAFKA}
                  roles={[Role.KAFKA_EDITOR, Role.KAFKA_VIEWER]}
                  showSharedToggle
                />
              </Grid>
            </Grid>
          </React.Fragment>
        ),
      },
    ];
    const aclMenuItem = [
      {
        name: 'ACL',
        value: (
          <React.Fragment>
            <Grid item container alignItems="center" justifyContent="center" style={{ marginTop: '1vw' }}>
              <Grid item xs={9}>
                <ACLConfigurationItem
                  deleteACL={this.props.deleteACL}
                  refreshACL={this.props.refreshACL}
                  aclRecords={this.props.aclRecords}
                  projectShortName={this.props.projectShortName}
                  topicName={this.props.topic.name}
                  canEdit={this.props.isAdmin || this.props.canEdit}
                  displayError={this.props.displayError}
                  addACL={this.props.addACL}
                  updateACL={this.props.updateACL}
                />
              </Grid>
            </Grid>
          </React.Fragment>
        ),
      },
    ];
    this.topicViewParts = [...configMenuItem];
    if (this.isLegacyMode) {
      this.topicViewParts = [...this.topicViewParts].concat(rightsMenuItem);
    }
    if (this.props.aclEnable) {
      this.topicViewParts = [...this.topicViewParts].concat(aclMenuItem);
    }
  }

  render() {
    return (
      <React.Fragment>
        {!this.props.isLoading && this.props.topic != null && this.renderInfo()}
        {this.props.isLoading && this.props.topic == null && <Loader />}
      </React.Fragment>
    );
  }

  renderInfo() {
    this.buildParts();
    return (
      <React.Fragment>
        <Grid container justifyContent="center">
          <Grid spacing={2} style={{ width: '80%', marginTop: 12 }}>
            <Grid item xs={6} style={{ maxWidth: '100%' }}>
              <AppBar position="static">
                <Tabs
                  style={{ maxWidth: '500' }}
                  centered
                  value={this.state.currentTab}
                  onChange={(event, value) => {
                    this.setState({ currentTab: value });
                  }}
                >
                  {this.topicViewParts.map((part, index) => {
                    // if (index !== this.topicViewParts.length && !(!this.props.isAdmin && index === 0)
                    //     && !(!this.props.isAdmin && index === 2))
                    return <Tab label={part.name} icon={part.icon} />;
                  })}
                </Tabs>
              </AppBar>
            </Grid>
          </Grid>
          <Grid spacing={2} style={{ width: '100%', marginTop: 12 }}>
            <Grid item xs={10} style={{ maxWidth: '100%' }}>
              {this.topicViewParts[this.state.currentTab].value}
            </Grid>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}
