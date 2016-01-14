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
  LayoutAnimation,
  SwitchIOS,
} = React;

let ServerApi = require('./serverApi')

let Prefs = require('./prefs')

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
      LayoutAnimation.spring()
      this.setState(state)
    })
  },
  onSwitchValueChange(dest) {
    return (v) => {
      let destinations = { ...this.state.filter.destinations }
      destinations[dest] = v
      let filter = { ...this.state.filter, destinations }
      this.setState({...this.state, filter})
      this.props.onFilterChange(filter)
    }
  },
  filterContent() {
    if (this.state.expanded) {
      let dests = this.state.filter.destinations
      let tags = []
      for (let dest in dests) {
        if (dests.hasOwnProperty(dest)) {
          let on = dests[dest]
          tags.push(
            <View style={{flexDirection: 'row', margin: 10}}>
              <Text style={{flex: 1, fontSize: 12}}>{dest}</Text>
              <SwitchIOS value={on} onValueChange={ this.onSwitchValueChange(dest) }/>
            </View>
          )
        }
      }
      return tags
    } else {
      let allOn = true, dests = ''
      for (let dest in this.state.filter.destinations) {
        if (this.state.filter.destinations.hasOwnProperty(dest)) {
          if (this.state.filter.destinations[dest]) {
            if (dests.length > 0) dests += ', '
            dests += dest
          } else {
            allOn = false
          }
        }
      }
      return <Text style={filterStyles.filterValue}>{ allOn ? 'All' : dests }</Text>;
    }
  },
  render() {
    if (this.state.filter.destinations === undefined) {
      this.state.filter = { ...this.props.initialFilter }
    }

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
    let expanded = true
    return {
      expanded: expanded,
      expandButtonRotation: new Animated.Value(expanded ? 180 : 0),
      filter: {}
    }
  }
})

// class BudgetFilter extends View {
var BudgetFilter = React.createClass({
  onSliderChange(value) {
    let step = 10
    let budgetAbove = Math.floor(value / step) * step
    let filter = { ...this.state.filter, budgetAbove }
    this.setState({...this.state, filter})
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
      filter: {}
    }
  },
  getBudgetAbove() {
    return this.state.filter.budgetAbove
  },
  render() {
    if (this.state.filter.budgetAbove === undefined) {
      this.state.filter = { ...this.props.initialFilter }
    }

    return (
      <View style={filterStyles.filterContainer}>
        <View style={filterStyles.header}>
          <Text style={filterStyles.filterTitle}>Budget</Text>
        </View>
        <Text style={filterStyles.filterValue} ref='valueLabel'>{this.computeValueLabel(this.getBudgetAbove())}</Text>
        <SliderIOS
          style={filterStyles.slider}
          value={this.getBudgetAbove()}
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
  onFilterChange(filter) {
      this.props.onFilterChange(filter)
  },

  render() {
    return (
      <View
        style={this.style()}
        isVisible={this.props.isVisible}
        fromRect={this.props.fromRect}>
        <DestinationsFilter initialFilter={this.props.initialFilter}
          onFilterChange={this.onFilterChange} />
        <BudgetFilter initialFilter={this.props.initialFilter}
          onBudgetChanged={this.onFilterChange} />
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
    fontSize: 12,
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
    this.setState({
      filterPopover: { isVisible: false }
    })
  },

  render() {
    let filterPopover
    if (this.state.filterPopover.isVisible) {
      filterPopover =
        <FilterPopover
          isVisible={this.state.filterPopover.isVisible}
          fromRect={this.state.filterPopover.buttonRect}
          onClose={this.closePopover}
          initialFilter={this.state.filter}
          onFilterChange={this.onFilterChange}
          />
    }
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
          <TouchableOpacity ref='btFilter' onPress={
              this.state.filterPopover.isVisible ? this.closeFilterPopover :
                this.showFilterPopover}>
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
          annotations={this.state.map.annotations}
          direction={0}
          accessToken="sk.eyJ1IjoiamltdWxhYnMiLCJhIjoiY2lnd2w1Y2F3MHQ0cnd5bTBtYm1mNzFlbSJ9.hJTKysrSX6M55PD_W-vs-w"
          centerCoordinate={this.state.map.center}
          zoomLevel={this.state.map.zoom}
          styleURL={'asset://styles/streets-v8.json'}
          />
        { filterPopover }
      </View>
    );
  },

  getInitialState() {
    return {
      position: 'Unknown',
      map: {
        // annotations: [
        //   {coordinates: [37.33756603, -122.04120235],
        //     type: 'point',
        //     title: 'Haha', subtitle: 'Superman1', hasLeftCallout: false, hasRightCallout: true},
        //     {coordinates: [37.32756608, -122.04120245],
        //       type: 'point',
        //       title: 'Haha', subtitle: 'Superman2', hasLeftCallout: true, hasRightCallout: true}
        //     ],
        center: { latitude: 48.468635, longitude: -123.324363, },
        zoom: 13,
      },

      filterPopover: {
        isVisible: false,
      },

      deliveryRequests: [],
      filter: {}
    };
  },

  locateMe() {
    navigator.geolocation.getCurrentPosition(
      (position) => this.setState({position}),
      (error) => console.log(error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  },

  onFilterChange(filter) {
    this.state.filter = filter
    this.setState(this.state)
    console.log('will fetch new delivery requests')
    console.log(this.state)

    let request2marker = (request) => {
      return {
        coordinates: request.coordinates,
        type: 'point',
        title: `${request.type} Budget:$${request.budget}`,
        subtitle: `Destination: ${request.destination}`,
      }
    }

    ServerApi.getDeliveryRequests(this.state.filter, (requests) => {
      this.state.deliveryRequests = requests
      this.state.map.annotations = requests.map(request2marker)
      this.setState(this.state)
    })
  },

  componentDidMount() {
    ServerApi.getDestinations((dests) => {
      let prefFilter = Prefs.getFilter()
      let destFilter = dests.reduce((o, dest) => {
        o[dest] = prefFilter.destinations[dest] || true ; return o }, {})
      this.onFilterChange({ ...prefFilter, destinations: destFilter })
    });
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
