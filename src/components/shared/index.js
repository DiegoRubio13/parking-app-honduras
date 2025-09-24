/**
 * PaRKING App - Shared Components Index
 * 
 * Professional component library for the PaRKING parking app
 * All components follow modern React Native best practices and accessibility guidelines
 * 
 * Usage:
 * import { Button, StatusCard, QRDisplay } from '../components/shared';
 * 
 * or
 * 
 * import Button from '../components/shared/Button';
 */

// Core UI Components
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Card } from './Card';

// Specialized Components
export { default as QRDisplay } from './QRDisplay';
export { default as StatusCard } from './StatusCard';
export { default as LoadingSpinner, DotSpinner } from './LoadingSpinner';

// Card Variants
export {
  InfoCard,
  WarningCard,
  ErrorCard,
  SuccessCard,
  GradientCard,
} from './Card';

// Re-export commonly used components with aliases for convenience
export { Button as ParkingButton } from './Button';
export { StatusCard as ParkingStatusCard } from './StatusCard';
export { QRDisplay as ParkingQRCode } from './QRDisplay';

/**
 * Component Usage Examples and Guidelines
 * 
 * BUTTON COMPONENT
 * ================
 * 
 * Primary actions:
 * <Button title="Iniciar Sesión" onPress={handleLogin} />
 * 
 * Secondary actions:
 * <Button title="Cancelar" variant="secondary" onPress={handleCancel} />
 * 
 * Loading states:
 * <Button title="Guardando..." loading={isLoading} disabled />
 * 
 * With icons:
 * <Button title="Eliminar" leftIcon={<TrashIcon />} variant="outline" />
 * 
 * 
 * INPUT COMPONENT
 * ===============
 * 
 * Basic input:
 * <Input 
 *   label="Email" 
 *   value={email} 
 *   onChangeText={setEmail}
 *   keyboardType="email-address"
 * />
 * 
 * With validation:
 * <Input 
 *   label="Contraseña"
 *   value={password}
 *   onChangeText={setPassword}
 *   secureTextEntry
 *   state={passwordError ? "error" : "normal"}
 *   helperText={passwordError}
 * />
 * 
 * With icons:
 * <Input 
 *   label="Buscar"
 *   leftIcon={<SearchIcon />}
 *   rightIcon={<ClearIcon onPress={() => setValue('')} />}
 * />
 * 
 * 
 * QR DISPLAY COMPONENT
 * ====================
 * 
 * Basic QR code:
 * <QRDisplay value="parking-session-12345" />
 * 
 * Large QR with animation:
 * <QRDisplay 
 *   value={sessionId} 
 *   size="large"
 *   showAnimation={true}
 * />
 * 
 * QR with logo:
 * <QRDisplay 
 *   value={userQRData}
 *   logoSource={/* Use static image source or Ionicons */}
 * />
 * 
 * 
 * STATUS CARD COMPONENT
 * =====================
 * 
 * Active parking session:
 * <StatusCard 
 *   status="inside"
 *   title="Sesión activa"
 *   subtitle="Tiempo: 2h 15min"
 *   onPress={handleViewSession}
 * />
 * 
 * Error state with action:
 * <StatusCard 
 *   status="error"
 *   title="Error de conexión"
 *   subtitle="No se pudo conectar al servidor"
 *   actionText="Reintentar"
 *   onActionPress={handleRetry}
 * />
 * 
 * 
 * LOADING SPINNER COMPONENT
 * =========================
 * 
 * Basic spinner:
 * <LoadingSpinner />
 * 
 * Large spinner:
 * <LoadingSpinner size="large" color={Colors.primary[600]} />
 * 
 * Full-screen loading:
 * <LoadingSpinner showOverlay={true} />
 * 
 * Dot spinner:
 * <DotSpinner size="medium" color={Colors.success[500]} />
 * 
 * 
 * CARD COMPONENT
 * ==============
 * 
 * Basic content card:
 * <Card padding="medium">
 *   <Text>Card content here</Text>
 * </Card>
 * 
 * Pressable card:
 * <Card onPress={handlePress} variant="elevated">
 *   <UserProfile />
 * </Card>
 * 
 * Specialized cards:
 * <InfoCard>
 *   <Text>Information message</Text>
 * </InfoCard>
 * 
 * <WarningCard>
 *   <Text>Warning message</Text>
 * </WarningCard>
 * 
 * <ErrorCard>
 *   <Text>Error message</Text>
 * </ErrorCard>
 * 
 * <SuccessCard>
 *   <Text>Success message</Text>
 * </SuccessCard>
 * 
 * 
 * ACCESSIBILITY BEST PRACTICES
 * =============================
 * 
 * 1. Always provide meaningful accessibilityLabel props
 * 2. Use testID for testing
 * 3. Ensure proper contrast ratios (already handled by color system)
 * 4. Support screen readers with appropriate roles and states
 * 5. Make interactive elements at least 44x44 points
 * 
 * 
 * PERFORMANCE CONSIDERATIONS
 * ==========================
 * 
 * 1. All components are optimized with React.memo where appropriate
 * 2. Animations use native driver when possible
 * 3. Heavy computations are memoized
 * 4. Styles are created using StyleSheet.create for performance
 * 
 * 
 * THEMING
 * =======
 * 
 * All components automatically use the PaRKING color system from:
 * ../../constants/colors.js
 * 
 * Colors adapt to light/dark mode preferences and maintain
 * professional appearance across the app.
 */