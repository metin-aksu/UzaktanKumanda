/**
 * Remote Control Component
 * Televizyon kumanda düğmeleri
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import PowerIcon from './PowerIcon';

const RemoteControl = ({ onKeyPress, tvType }) => {
  const renderButton = (label, key, style = {}) => (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={() => onKeyPress(key)}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  const renderIconButton = (icon, key, style = {}) => (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={() => onKeyPress(key)}>
      {icon}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Üst sıra: Power, Ses+, Kanal+ */}
      <View style={styles.row}>
        {renderIconButton(<PowerIcon size={28} color="#fff" />, 'POWER', styles.powerButton)}
        {renderButton('VOL+', 'VOLUME_UP', styles.volumeButton)}
        {renderButton('CH+', 'CHANNEL_UP', styles.channelButton)}
      </View>

      {/* Alt sıra: Mute, Ses-, Kanal- */}
      <View style={styles.row}>
        {renderButton('🔇', 'MUTE')}
        {renderButton('VOL-', 'VOLUME_DOWN', styles.volumeButton)}
        {renderButton('CH-', 'CHANNEL_DOWN', styles.channelButton)}
      </View>

      {/* Sayı Tuşları */}
      <View style={styles.numberPad}>
        <View style={styles.row}>
          {renderButton('1', 'DIGIT_1', styles.numberButton)}
          {renderButton('2', 'DIGIT_2', styles.numberButton)}
          {renderButton('3', 'DIGIT_3', styles.numberButton)}
        </View>
        <View style={styles.row}>
          {renderButton('4', 'DIGIT_4', styles.numberButton)}
          {renderButton('5', 'DIGIT_5', styles.numberButton)}
          {renderButton('6', 'DIGIT_6', styles.numberButton)}
        </View>
        <View style={styles.row}>
          {renderButton('7', 'DIGIT_7', styles.numberButton)}
          {renderButton('8', 'DIGIT_8', styles.numberButton)}
          {renderButton('9', 'DIGIT_9', styles.numberButton)}
        </View>
        <View style={styles.row}>
          {renderButton('⌂', 'HOME', styles.numberButton)}
          {renderButton('0', 'DIGIT_0', styles.numberButton)}
          {renderButton('☰', 'MENU', styles.numberButton)}
        </View>
      </View>

      {/* Medya Kontrol */}
      <View style={styles.row}>
        {renderButton('⏮', 'PREVIOUS')}
        {renderButton('⏪', 'REWIND')}
        {renderButton('⏯', 'PLAY_PAUSE')}
        {renderButton('⏩', 'FAST_FORWARD')}
        {renderButton('⏭', 'NEXT')}
      </View>

      {/* Özel Tuşlar */}
      {tvType === 'philips' && (
        <View style={styles.row}>
          {renderButton('SOURCE', 'SOURCE', styles.specialButton)}
          {renderButton('💡', 'AMBILIGHT', styles.specialButton)}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingTop: 20,
    backgroundColor: '#000',
    borderRadius: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 5,
  },
  button: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  powerButton: {
    backgroundColor: '#d32f2f',
  },
  volumeButton: {
    backgroundColor: '#1976d2',
  },
  channelButton: {
    backgroundColor: '#7b1fa2',
  },
  numberButton: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: '#424242',
  },
  specialButton: {
    backgroundColor: '#ff9800',
  },
  spacer: {
    flex: 1,
  },
  numberPad: {
    marginTop: 10,
    marginBottom: 40,
  },
});

export default RemoteControl;
