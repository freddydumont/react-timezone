import React from 'react';
import PropTypes from 'prop-types';

import timezones from './timezones';

class TimezonePicker extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    offset: PropTypes.oneOf(['GMT', 'UTC']),
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    inputProps: PropTypes.shape({
      onBlur: PropTypes.func,
      onFocus: PropTypes.func,
      onChange: PropTypes.func,
      onKeyDown: PropTypes.func,
    }),
  };

  static defaultProps = {
    value: '',
    offset: 'GMT',
    className: '',
    inputProps: {},
  };

  state = {
    focus: null,
    query: '',
    currentZone: this.props.value ? timezones.find(zone => zone.name === this.props.value) : null,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.value !== (state.currentZone ? state.currentZone.name : '')) {
      return { currentZone: timezones.find(zone => zone.name === props.value) };
    }
    return null;
  }

  stringifyZone(zone, offset) {
    const ensure2Digits = num => (num > 9 ? `${num}` : `0${num}`);

    return `(${offset}${zone.offset < 0 ? '-' : '+'}${ensure2Digits(Math.floor(Math.abs(zone.offset)))}:${ensure2Digits(Math.abs((zone.offset % 1) * 60))}) ${zone.label}`;
  }

  timezones() {
    if (!this.state.query.trim()) return timezones;

    return timezones.filter(zone =>
      zone.label
        .toLowerCase()
        .replace(/\s+/g, '')
        .includes(this.state.query.toLowerCase().replace(/\s+/g, '')));
  }

  handleFocus = (e) => {
    this.setState({ focus: 0 });

    if (this.props.inputProps.onFocus) {
      this.props.inputProps.onFocus(e);
    }
  };

  handleBlur = (e) => {
    this.setState({ focus: null, query: '' });

    if (this.props.inputProps.onBlur) {
      this.props.inputProps.onBlur(e);
    }
  };

  handleChange = (e) => {
    this.setState({ query: e.currentTarget.value, focus: 0 });

    if (this.props.inputProps.onChange) {
      this.props.inputProps.onChange(e);
    }
  };

  handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      const zones = this.timezones();
      this.setState(state => ({ focus: state.focus === zones.length ? 0 : state.focus + 1 }));
    } else if (e.key === 'ArrowUp') {
      const zones = this.timezones();
      this.setState(state => ({ focus: state.focus === 0 ? zones.length - 1 : state.focus - 1 }));
    } else if (e.key === 'Escape' && this.input) {
      this.input.blur();
    } else if (e.key === 'Enter') {
      const zones = this.timezones();
      if (zones[this.state.focus]) {
        this.handleZoneChange(zones[this.state.focus]);
      }
    }

    if (this.props.inputProps.onKeyDown) {
      this.props.inputProps.onKeyDown(e);
    }
  };

  handleItemHover = (index) => {
    this.setState({ focus: index });
  };

  handleZoneChange = (zone) => {
    this.props.onChange(zone.name);
  };

  render() {
    const { offset, inputProps } = this.props;
    const { currentZone, focus, query } = this.state;

    const open = focus !== null;

    return (
      <div className={this.props.className}>
        <input
          type="text"
          autoComplete="off"
          {...inputProps}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          value={currentZone && !open ? this.stringifyZone(currentZone, offset) : query}
          ref={(input) => {
            this.input = input;
          }}
        />

        <ul className={open ? 'open' : ''}>
          {this.timezones().map((zone, index) => (
            <li key={zone.name}>
              <button
                title={zone.label}
                onMouseDown={() => this.handleZoneChange(zone)}
                onMouseOver={() => this.handleItemHover(index)}
                onFocus={() => this.handleItemHover(index)}
                className={focus === index ? 'focus' : ''}
              >
                {this.stringifyZone(zone, offset)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export { TimezonePicker as default, timezones };
