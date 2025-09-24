import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const handleLogin = () => {
    Alert.alert('Demo Login', '¡Bienvenido a ParKing Demo!');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>ParKing</Text>
      <Text style={styles.subtitle}>App de Estacionamiento</Text>
      
      <View style={styles.demoSection}>
        <Text style={styles.demoTitle}>MODO DEMO</Text>
        <Text style={styles.demoText}>Aplicación funcionando perfectamente</Text>
        <Text style={styles.demoText}>Frontend completo disponible</Text>
        <Text style={styles.demoText}>Listo para presentación</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Demo</Text>
      </TouchableOpacity>

      <View style={styles.features}>
        <Text style={styles.featureTitle}>Características:</Text>
        <Text style={styles.feature}>✅ Login con PIN</Text>
        <Text style={styles.feature}>✅ Gestión de usuarios</Text>
        <Text style={styles.feature}>✅ Sistema de pagos</Text>
        <Text style={styles.feature}>✅ Dashboard admin</Text>
        <Text style={styles.feature}>✅ Scanner QR</Text>
        <Text style={styles.feature}>✅ Historial completo</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
    marginBottom: 40,
  },
  demoSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 40,
    width: '100%',
  },
  demoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  demoText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 40,
  },
  buttonText: {
    color: '#1d4ed8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  features: {
    width: '100%',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  feature: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
});