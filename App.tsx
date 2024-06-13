import React, { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { GOOGLE_MAPS_KEY } from '@env';
import MapViewDirections from 'react-native-maps-directions';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function App() {
  const mapRef = useRef(null);
  const [origin, setOrigin] = useState({
    latitude: -23.679136,
    longitude: -70.409701,
  });

  const [centerLocation, setCenterLocation] = useState({
    latitude: -23.679136,
    longitude: -70.409701,
  });

  const [originAddress, setOriginAddress] = useState('Universidad Católica del Norte');
  const [centerAddress, setCenterAddress] = useState('Tu ubicación');

  useEffect(() => {
    getLocationPermission();
  }, []);

  async function getLocationPermission() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permiso denegado');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    const current = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setCenterLocation(current);
    centerMap(current);
    getAddress(current.latitude, current.longitude, setCenterAddress);
  }

  const centerMap = (location) => {
    mapRef.current.animateToRegion({
      ...location,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }, 1000);
  };

  const onRegionChangeComplete = (region) => {
    setCenterLocation({
      latitude: region.latitude,
      longitude: region.longitude,
    });
    getAddress(region.latitude, region.longitude, setCenterAddress);
  };

  const getAddress = async (latitude, longitude, setAddress) => {
    try {
      console.log("hola")
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}`);
      const json = await response.json();
      if (json.results && json.results.length > 0) { 
        setAddress(json.results[0].formatted_address);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: origin.latitude,
          longitude: origin.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        <Marker
          coordinate={origin}
        />

        <MapViewDirections
          origin={origin}
          destination={centerLocation}
          apikey={GOOGLE_MAPS_KEY}
          strokeColor='red'
          strokeWidth={6}
        />
      </MapView>
      {/* Marcador visual en el centro del mapa */}
      <View style={styles.centerMarker}>
        <View style={styles.markerFixed} />
      </View>
      {/* Barra de direcciones */}
      <View style={styles.addressBar}>
        <Text style={styles.textBar}>Origen: {originAddress}</Text>
        <Text style={styles.textBar}>Destino: {centerAddress}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -24,
  },
  markerFixed: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderColor: '#ff0000',
    borderWidth: 3,
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
  },
  addressBar: {
    position: 'absolute',
    top: '7%',
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textBar: {
    margin: 3
  }
});
