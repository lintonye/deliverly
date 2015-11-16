/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var Mapbox = require('react-native-mapbox-gl');
var Dimensions = require('Dimensions')
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  MapView,
  TouchableOpacity,
  SliderIOS,
  Animated,
  SwitchIOS,
} = React;

// var { Icon, } = require('react-native-icons');
// var Popover = require('react-native-popover');

// TODO extract common code of filters?

var DestinationsFilter = React.createClass({
  toggleExpand() {
    let state = this.state
    Animated.timing(
      this.state.expandButtonRotation,
      {
        toValue: state.expanded ? 0 : 180,
        // friction: 1,
        duration: 200,
      }
    ).start(() => {
      state.expanded = !state.expanded
      this.setState(state)
    })
  },
  onSwitchValueChange(dest) {
    return (v) => {
      this.state.destinationStatuses[dest] = v
      this.setState(this.state)
    }
  },
  filterContent() {
    if (this.state.expanded) {
      let dests = this.props.destinations
      return dests.map((dest) => {
        let on = this.state.destinationStatuses[dest]
        return (
          <View style={{flexDirection: 'row', margin: 10}}>
            <Text style={{flex: 1, fontSize: 12}}>{dest}</Text>
            <SwitchIOS value={on} onValueChange={ this.onSwitchValueChange(dest) }/>
          </View>
        )
      })
    } else {
      let allOn = true, dests = ''
      for (let dest in this.state.destinationStatuses) {
        if (this.state.destinationStatuses[dest]) {
          if (dests.length > 0) dests += ', '
          dests += dest
        } else {
          allOn = false
        }
      }
      return (<Text style={filterStyles.filterValue}>{ allOn ? 'All' : dests }</Text>);
    }
  },
  render() {
    return (
      <View style={filterStyles.filterContainer}>
        <TouchableOpacity onPress={this.toggleExpand}>
          <View style={filterStyles.header}>
            <Text style={filterStyles.filterTitle}>Destinations</Text>
            <Animated.Text
              style={{
                transform: [
                  {rotate: this.state.expandButtonRotation.interpolate({
                    inputRange: [0, 180],
                    outputRange: ['0deg', '180deg'],
                  }) },
                ],
              }}>▽</Animated.Text>
          </View>
        </TouchableOpacity>
        { this.filterContent() }
      </View>
    )
  },
  getInitialState() {
    let initialStatuses = this.props.destinations.reduce((o, dest) => {
      o[dest] = true; return o }, {})
    return {
      expanded: false,
      expandButtonRotation: new Animated.Value(0),
      destinationStatuses: initialStatuses,
    }
  }
})

// class BudgetFilter extends View {
var BudgetFilter = React.createClass({
  onSliderChange(value) {
    let step = 10
    value = Math.floor(value / step) * step
    this.setState({ value })
  },
  onSlidingComplete() {
    // alert(this.state.value)
    if (this.props.onBudgetChanged) {
      this.props.onBudgetChanged(this.state.value)
    }
  },
  computeValueLabel(value) {
    return value == 0 ? 'Any budget' : `Above $${value}`
  },
  getInitialState() {
    return {
      value: 0,
    }
  },
  render() {
    return (
      <View style={filterStyles.filterContainer}>
        <View style={filterStyles.header}>
          <Text style={filterStyles.filterTitle}>Budget</Text>
        </View>
        <Text style={filterStyles.filterValue} ref='valueLabel'>{this.computeValueLabel(this.state.value)}</Text>
        <SliderIOS
          style={filterStyles.slider}
          value={0}
          maximumValue={100}
          step={10}
          onSlidingComplete={this.onSlidingComplete}
          onValueChange={this.onSliderChange}
          />
      </View>
    )
  }
}
)

var FilterPopover = React.createClass({
  render() {
    let dests =
      ['Victoria', 'Landford', 'View Royal', 'Saanich']
    return (
      <View
        style={this.style()}
        isVisible={this.props.isVisible}
        fromRect={this.props.fromRect}>
        <DestinationsFilter destinations={dests}/>
        <BudgetFilter />
      </View>
    )
  },
  style() {
    let popoverW = 300, popoverH = 500
    let screenW = Dimensions.get('window').width
    let screenH = Dimensions.get('window').height
    return {
      opacity: this.props.isVisible ? 1 : 0,
      position: 'absolute',
      top: (screenH - popoverH) / 2,
      left: (screenW - popoverW) / 2,
      width: popoverW,
    };
  }
});

let commonPadding = {
  margin: 5,
  padding: 5,
}

var filterStyles = StyleSheet.create({
  filterContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    // backgroundColor: '#dddddd',
    ...commonPadding,
  },
  expandButton: {
    fontSize: 20,
  },
  filterTitle: {
    flex: 1,
    fontSize: 15,
  },
  filterValue: {
    fontSize: 10,
    ...commonPadding,
  },
  slider: {
    width: 280,
    marginLeft: 5,
    ...commonPadding,
  },
});

var deliverly = React.createClass({
  showFilterPopover() {
    this.refs.btFilter.measure((ox, oy, width, height, px, py) => {
      this.setState({
        filterPopover: {
          isVisible: true,
          buttonRect: {x: px, y: py, width: width, height: height}
        },
      });
    });
  },

  closeFilterPopover() {
    setState({
      filterPopover: { isVisible: false }
    })
  },

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <TouchableOpacity>
            <Text
              name='fontawesome|crosshairs'
              size={20}
              color='#333333'
              style={styles.toolbarButton}
              >Locate me</Text>
          </TouchableOpacity>
          <Text style={styles.toolbarTitle}>Deliverly</Text>
          <TouchableOpacity ref='btFilter' onPress={this.showFilterPopover}>
            <Text
              name='fontawesome|filter'
              size={20}
              color='#333333'
              style={styles.toolbarButton}
              >Filter</Text>
          </TouchableOpacity>
        </View>
        <Mapbox style={styles.map}
          zoomEnabled={true}
          annotations={this.state.annotations}
          direction={0}
          accessToken="sk.eyJ1IjoiamltdWxhYnMiLCJhIjoiY2lnd2w1Y2F3MHQ0cnd5bTBtYm1mNzFlbSJ9.hJTKysrSX6M55PD_W-vs-w"
          centerCoordinate={this.state.center}
          zoomLevel={this.state.zoom}
          styleURL={'asset://styles/streets-v8.json'}
          />
        <FilterPopover
          isVisible={this.state.filterPopover.isVisible}
          fromRect={this.state.filterPopover.buttonRect}
          onClose={this.closePopover}
          />
      </View>
    );
  },

  getInitialState() {
    return {
      position: 'Unknown',
      annotations: [
        {coordinates: [37.33756603, -122.04120235],
          type: 'point',
          title: 'Haha', subtitle: 'Superman1', hasLeftCallout: false, hasRightCallout: true},
        {coordinates: [37.32756608, -122.04120245],
          type: 'point',
          title: 'Haha', subtitle: 'Superman2', hasLeftCallout: true, hasRightCallout: true}
      ],
      center: { latitude: 37.33756603, longitude: -122.04120235 },
      zoom: 13,
      filterPopover: {
        isVisible: true,
        buttonRect: {x: 10, y: 80, width: 10, height: 10}
      }
    };
  },

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      (position) => this.setState({position}),
      (error) => console.log(error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  },

  componentWillUnmount() {
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: '#81c04d',
    paddingTop: 30,
    paddingBottom: 10,
  },
  toolbarTitle: {
    textAlign: "center",
    marginTop: 5,
    flex: 1,
    fontSize: 18,
  },
  toolbarButton: {
    padding: 5,
  },
  map: {
    flex: 1,
  },
});

AppRegistry.registerComponent('deliverly', () => deliverly);
