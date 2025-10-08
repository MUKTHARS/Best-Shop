import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Global Styles
export const globalStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  containerWhite: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowAround: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  // Spacing
  p0: { padding: 0 },
  p4: { padding: 4 },
  p8: { padding: 8 },
  p12: { padding: 12 },
  p16: { padding: 16 },
  p20: { padding: 20 },
  p24: { padding: 24 },
  
  m0: { margin: 0 },
  m4: { margin: 4 },
  m8: { margin: 8 },
  m12: { margin: 12 },
  m16: { margin: 16 },
  m20: { margin: 20 },
  m24: { margin: 24 },

  // Margins
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  mt16: { marginTop: 16 },
  mt20: { marginTop: 20 },
  mt24: { marginTop: 24 },

  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
  mb20: { marginBottom: 20 },
  mb24: { marginBottom: 24 },

  ml4: { marginLeft: 4 },
  ml8: { marginLeft: 8 },
  ml12: { marginLeft: 12 },
  ml16: { marginLeft: 16 },
  ml20: { marginLeft: 20 },
  ml24: { marginLeft: 24 },

  mr4: { marginRight: 4 },
  mr8: { marginRight: 8 },
  mr12: { marginRight: 12 },
  mr16: { marginRight: 16 },
  mr20: { marginRight: 20 },
  mr24: { marginRight: 24 },

  mx4: { marginHorizontal: 4 },
  mx8: { marginHorizontal: 8 },
  mx12: { marginHorizontal: 12 },
  mx16: { marginHorizontal: 16 },
  mx20: { marginHorizontal: 20 },
  mx24: { marginHorizontal: 24 },

  my4: { marginVertical: 4 },
  my8: { marginVertical: 8 },
  my12: { marginVertical: 12 },
  my16: { marginVertical: 16 },
  my20: { marginVertical: 20 },
  my24: { marginVertical: 24 },

  // Paddings
  pt4: { paddingTop: 4 },
  pt8: { paddingTop: 8 },
  pt12: { paddingTop: 12 },
  pt16: { paddingTop: 16 },
  pt20: { paddingTop: 20 },
  pt24: { paddingTop: 24 },

  pb4: { paddingBottom: 4 },
  pb8: { paddingBottom: 8 },
  pb12: { paddingBottom: 12 },
  pb16: { paddingBottom: 16 },
  pb20: { paddingBottom: 20 },
  pb24: { paddingBottom: 24 },

  pl4: { paddingLeft: 4 },
  pl8: { paddingLeft: 8 },
  pl12: { paddingLeft: 12 },
  pl16: { paddingLeft: 16 },
  pl20: { paddingLeft: 20 },
  pl24: { paddingLeft: 24 },

  pr4: { paddingRight: 4 },
  pr8: { paddingRight: 8 },
  pr12: { paddingRight: 12 },
  pr16: { paddingRight: 16 },
  pr20: { paddingRight: 20 },
  pr24: { paddingRight: 24 },

  px4: { paddingHorizontal: 4 },
  px8: { paddingHorizontal: 8 },
  px12: { paddingHorizontal: 12 },
  px16: { paddingHorizontal: 16 },
  px20: { paddingHorizontal: 20 },
  px24: { paddingHorizontal: 24 },

  py4: { paddingVertical: 4 },
  py8: { paddingVertical: 8 },
  py12: { paddingVertical: 12 },
  py16: { paddingVertical: 16 },
  py20: { paddingVertical: 20 },
  py24: { paddingVertical: 24 },

  // Typography
  textXs: {
    fontSize: 12,
    lineHeight: 16,
  },
  textSm: {
    fontSize: 14,
    lineHeight: 20,
  },
  textBase: {
    fontSize: 16,
    lineHeight: 24,
  },
  textLg: {
    fontSize: 18,
    lineHeight: 28,
  },
  textXl: {
    fontSize: 20,
    lineHeight: 28,
  },
  text2Xl: {
    fontSize: 24,
    lineHeight: 32,
  },
  text3Xl: {
    fontSize: 30,
    lineHeight: 36,
  },

  // Font Weights
  fontNormal: {
    fontWeight: '400',
  },
  fontMedium: {
    fontWeight: '500',
  },
  fontSemibold: {
    fontWeight: '600',
  },
  fontBold: {
    fontWeight: '700',
  },

  // Text Colors
  textPrimary: {
    color: '#333333',
  },
  textSecondary: {
    color: '#666666',
  },
  textMuted: {
    color: '#999999',
  },
  textLight: {
    color: '#CCCCCC',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textSuccess: {
    color: '#28A745',
  },
  textDanger: {
    color: '#DC3545',
  },
  textWarning: {
    color: '#FFC107',
  },
  textInfo: {
    color: '#17A2B8',
  },

  // Background Colors
  bgPrimary: {
    backgroundColor: '#007AFF',
  },
  bgSecondary: {
    backgroundColor: '#6C757D',
  },
  bgSuccess: {
    backgroundColor: '#28A745',
  },
  bgDanger: {
    backgroundColor: '#DC3545',
  },
  bgWarning: {
    backgroundColor: '#FFC107',
  },
  bgInfo: {
    backgroundColor: '#17A2B8',
  },
  bgLight: {
    backgroundColor: '#F8F9FA',
  },
  bgDark: {
    backgroundColor: '#343A40',
  },
  bgWhite: {
    backgroundColor: '#FFFFFF',
  },
  bgTransparent: {
    backgroundColor: 'transparent',
  },

  // Borders
  border: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  border0: {
    borderWidth: 0,
  },
  border1: {
    borderWidth: 1,
  },
  border2: {
    borderWidth: 2,
  },
  borderPrimary: {
    borderColor: '#007AFF',
  },
  borderSecondary: {
    borderColor: '#6C757D',
  },
  borderSuccess: {
    borderColor: '#28A745',
  },
  borderDanger: {
    borderColor: '#DC3545',
  },
  borderWarning: {
    borderColor: '#FFC107',
  },
  borderLight: {
    borderColor: '#F8F9FA',
  },
  borderDark: {
    borderColor: '#343A40',
  },

  // Border Radius
  roundedNone: {
    borderRadius: 0,
  },
  roundedSm: {
    borderRadius: 2,
  },
  rounded: {
    borderRadius: 4,
  },
  roundedMd: {
    borderRadius: 6,
  },
  roundedLg: {
    borderRadius: 8,
  },
  roundedXl: {
    borderRadius: 12,
  },
  rounded2Xl: {
    borderRadius: 16,
  },
  roundedFull: {
    borderRadius: 9999,
  },

  // Shadows
  shadowSm: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  shadow: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  shadowMd: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  shadowLg: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  // Flex
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  flex3: {
    flex: 3,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexCol: {
    flexDirection: 'column',
  },
  itemsStart: {
    alignItems: 'flex-start',
  },
  itemsCenter: {
    alignItems: 'center',
  },
  itemsEnd: {
    alignItems: 'flex-end',
  },
  itemsStretch: {
    alignItems: 'stretch',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  justifyAround: {
    justifyContent: 'space-around',
  },

  // Position
  absolute: {
    position: 'absolute',
  },
  relative: {
    position: 'relative',
  },
  top0: { top: 0 },
  right0: { right: 0 },
  bottom0: { bottom: 0 },
  left0: { left: 0 },

  // Dimensions
  wFull: {
    width: '100%',
  },
  hFull: {
    height: '100%',
  },
  screenWidth: {
    width: width,
  },
  screenHeight: {
    height: height,
  },

  // Text Alignment
  textLeft: {
    textAlign: 'left',
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  textJustify: {
    textAlign: 'justify',
  },
});

// Common component styles
export const componentStyles = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#6C757D',
  },
  buttonSuccess: {
    backgroundColor: '#28A745',
  },
  buttonDanger: {
    backgroundColor: '#DC3545',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
};

// Export commonly used style combinations
export const commonStyles = {
  screen: globalStyles.container,
  screenWithPadding: [globalStyles.container, globalStyles.p16],
  card: componentStyles.card,
  input: componentStyles.input,
  button: componentStyles.button,
  buttonPrimary: [componentStyles.button, componentStyles.buttonPrimary],
  buttonSecondary: [componentStyles.button, componentStyles.buttonSecondary],
  buttonSuccess: [componentStyles.button, componentStyles.buttonSuccess],
  buttonDanger: [componentStyles.button, componentStyles.buttonDanger],
  buttonText: componentStyles.buttonText,
  title: [globalStyles.text2Xl, globalStyles.fontBold, globalStyles.textPrimary],
  subtitle: [globalStyles.textLg, globalStyles.textSecondary],
  body: [globalStyles.textBase, globalStyles.textPrimary],
  caption: [globalStyles.textSm, globalStyles.textMuted],
};