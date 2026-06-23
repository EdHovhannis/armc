import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import * as moment from 'moment';
import * as React from 'react';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import { connect } from 'react-redux';

import * as indexActions from '../../../store/index/Actions';
import { TimeRange } from '../../../store/index/Types';

import 'bootstrap-daterangepicker/daterangepicker.css';

const ranges = {
  'Последние 5 минут': { end: () => moment.utc(moment()), start: () => moment.utc(moment()).subtract(5, 'minute') },
  'Последние 15 минут': { end: () => moment.utc(moment()), start: () => moment.utc(moment()).subtract(15, 'minute') },
  'Последние 30 минут': { end: () => moment.utc(moment()), start: () => moment.utc(moment()).subtract(30, 'minutes') },
  'Последний час': { end: () => moment.utc(moment()), start: () => moment.utc(moment()).subtract(1, 'hour') },
  'Последние 3 часа': { end: () => moment.utc(moment()), start: () => moment.utc(moment()).subtract(3, 'hours') },
  'Последние 6 часов': { end: () => moment.utc(moment()), start: () => moment.utc(moment()).subtract(6, 'hours') },
  'Последние 12 часов': { end: () => moment.utc(moment()), start: () => moment.utc(moment()).subtract(12, 'hours') },
  'Последние 24 часа': { end: () => moment.utc(moment()), start: () => moment.utc(moment()).subtract(24, 'hours') },
  'Последние 3 дня': { end: () => moment.utc(moment()), start: () => moment.utc(moment()).subtract(3, 'days') },
};

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    setTimeRange: (timeRange: TimeRange) => {
      dispatch(indexActions.setCurrentTimeRange(timeRange));
    },
  };
};

export interface DateTimePickerProps {
  onClick();

  rangeChosenChanged(rangeChosen: boolean);

  onDropdownClick(e);

  setTimeRange(timeRange: TimeRange);
}

export interface DateTimePickerState {
  isOpen: boolean;
  val: string;
  chooseTxt: string;
  range: any;
}

class DateTimePicker extends React.Component<DateTimePickerProps, DateTimePickerState> {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      val: 'Последние 5 минут',
      chooseTxt: 'Выбрать временной промежуток',
      range: { start: () => moment.utc(moment()), end: () => moment.utc(moment()).subtract(5, 'minute') },
    };

    this.handleClickAwayTime = this.handleClickAwayTime.bind(this);
    this.customTime = this.customTime.bind(this);
  }

  handleClickAwayTime(e) {
    if (this.props.onDropdownClick) this.props.onDropdownClick(e);
    if (
      e.target.className === 'monthselect' ||
      e.target.className === 'yearselect' ||
      e.target.className === 'hourselect' ||
      e.target.className === 'minuteselect' ||
      e.target.className === 'secondselect'
    ) {
      return;
    }
    if (e.target.className.includes('start-date') || e.target.className.includes('end-date') || e.target.className.includes('applyBtn')) return;
    if (e.target.id === 'timeId') return;
    this.setState({ isOpen: false });
  }

  customTime(event, picker) {
    const range = {
      start: () => {
        return picker.startDate;
      },
      end: () => {
        return picker.endDate;
      },
    };
    const valStr = picker.startDate.format('YYYY-MM-DD HH:mm:ss') + ' до ' + picker.endDate.format('YYYY-MM-DD HH:mm:ss');
    this.setState({
      val: valStr,
      chooseTxt: picker.startDate.format('YYYY-MM-DD HH:mm:ss') + ' до ' + picker.endDate.format('YYYY-MM-DD HH:mm:ss'),
    });
    this.setState({
      range: range,
    });
    this.props.rangeChosenChanged(true);
    this.props.setTimeRange(range);
  }

  render() {
    const menuRangeItems: Array<JSX.Element> = [];

    Object.keys(ranges).forEach((x) => {
      menuRangeItems.push(
        <MenuItem
          value={x}
          onClick={() => {
            this.setState({
              range: ranges[x],
              val: x,
              chooseTxt: x,
            });
            this.props.rangeChosenChanged(true);
            this.props.setTimeRange(ranges[x]);
            this.setState({ isOpen: false });
          }}
        >
          {x}
        </MenuItem>,
      );
    });

    return (
      <ClickAwayListener onClickAway={this.handleClickAwayTime} mouseEvent={'onMouseUp'}>
        <Grid container direction={'column'} style={{ display: 'inline-block', position: 'relative', width: '100%' }}>
          <Button
            onClick={() => {
              this.setState({ isOpen: !this.state.isOpen });
              if (this.props.onClick) this.props.onClick();
            }}
            variant={'outlined'}
            fullWidth
          >
            <AccessTimeIcon style={{ marginRight: 4 }} />
            <div
              style={{
                color: this.state.val === 'Выбрать временной промежуток' ? '#ff604f' : '#000000',
              }}
            >
              {this.state.val}
            </div>
          </Button>
          {this.state.isOpen ? (
            <Grid
              container
              direction={'column'}
              style={{
                display: 'block',
                position: 'absolute',
                zIndex: 12,
                backgroundColor: 'white',
                border: '1px solid grey',
                padding: 16,
                borderRadius: 10,
              }}
            >
              <React.Fragment>
                <DateRangePicker
                  timePicker={true}
                  timePicker24Hour={true}
                  showDropdowns={true}
                  alwaysShowCalendars={false}
                  locale={{
                    separator: ' - ',
                    applyLabel: 'Применить',
                    cancelLabel: 'Отмена',
                    fromLabel: 'С',
                    toLabel: 'По',
                    customRangeLabel: 'Выберите время',
                    invalidDateLabel: 'Выберите дату',
                    daysOfWeek: ['Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс', 'Пн'],
                    monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
                    firstDay: 1,
                  }}
                  style={{ width: 260, display: 'block', marginBottom: 10 }}
                  onApply={this.customTime}
                  containerStyles={{ width: '100%' }}
                >
                  <MenuItem>Выберите время</MenuItem>
                </DateRangePicker>
                {menuRangeItems}
              </React.Fragment>
            </Grid>
          ) : null}
        </Grid>
      </ClickAwayListener>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimePicker);
