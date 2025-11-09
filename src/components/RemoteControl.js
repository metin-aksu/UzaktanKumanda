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

const RemoteControl = ({ onKeyPress, tvType }) => {
  const renderButton = (label, key, style = {}) => (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={() => onKeyPress(key)}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  const renderRoundButton = (label, key, style = {}) => (
    <TouchableOpacity
      style={[styles.roundButton, style]}
      onPress={() => onKeyPress(key)}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Güç ve Menü */}
      <View style={styles.row}>
        {renderButton('⏻', 'POWER', styles.powerButton)}
        {renderButton('⌂', 'HOME')}
        {renderButton('☰', 'MENU')}
        {renderButton('◄', 'BACK')}
      </View>

      {/* Navigasyon */}
      <View style={styles.navigationContainer}>
        <View style={styles.navigationRow}>
          <View style={styles.spacer} />
          {renderRoundButton('▲', 'UP')}
          <View style={styles.spacer} />
        </View>
        <View style={styles.navigationRow}>
          {renderRoundButton('◄', 'LEFT')}
          {renderRoundButton('OK', 'OK', styles.okButton)}
          {renderRoundButton('►', 'RIGHT')}
        </View>
        <View style={styles.navigationRow}>
          <View style={styles.spacer} />
          {renderRoundButton('▼', 'DOWN')}
          <View style={styles.spacer} />
        </View>
      </View>

      {/* Ses Kontrolü */}
      <View style={styles.row}>
        {renderButton('VOL-', 'VOLUME_DOWN', styles.volumeButton)}
        {renderButton('🔇', 'MUTE')}
        {renderButton('VOL+', 'VOLUME_UP', styles.volumeButton)}
      </View>

      {/* Kanal Kontrolü */}
      <View style={styles.row}>
        {renderButton('CH-', 'CHANNEL_DOWN', styles.channelButton)}
        {renderButton('INFO', 'INFO')}
        {renderButton('CH+', 'CHANNEL_UP', styles.channelButton)}
      </View>

      {/* Renkli Tuşlar */}
      <View style={styles.row}>
        {renderButton('●', 'RED', [styles.colorButton, styles.redButton])}
        {renderButton('●', 'GREEN', [styles.colorButton, styles.greenButton])}
        {renderButton('●', 'YELLOW', [styles.colorButton, styles.yellowButton])}
        {renderButton('●', 'BLUE', [styles.colorButton, styles.blueButton])}
      </View>

      {/* Medya Kontrol */}
      <View style={styles.row}>
        {renderButton('⏮', 'PREVIOUS')}
        {renderButton('⏪', 'REWIND')}
        {renderButton('⏯', 'PLAY_PAUSE')}
        {renderButton('⏩', 'FAST_FORWARD')}
        {renderButton('⏭', 'NEXT')}
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
          {renderButton('◄', 'DASH', styles.numberButton)}
          {renderButton('0', 'DIGIT_0', styles.numberButton)}
          {renderButton('►', 'ENTER', styles.numberButton)}
        </View>
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
    backgroundColor: '#1a1a1a',
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
  roundButton: {
    backgroundColor: '#333',
    width: 60,
    height: 60,
    borderRadius: 30,
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
  okButton: {
    backgroundColor: '#4caf50',
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  volumeButton: {
    backgroundColor: '#1976d2',
  },
  channelButton: {
    backgroundColor: '#7b1fa2',
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  redButton: {
    backgroundColor: '#f44336',
  },
  greenButton: {
    backgroundColor: '#4caf50',
  },
  yellowButton: {
    backgroundColor: '#ffeb3b',
  },
  blueButton: {
    backgroundColor: '#2196f3',
  },
  numberButton: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: '#424242',
  },
  specialButton: {
    backgroundColor: '#ff9800',
  },
  navigationContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 3,
  },
  spacer: {
    width: 60,
  },
  numberPad: {
    marginTop: 10,
  },
});

export default RemoteControl;
