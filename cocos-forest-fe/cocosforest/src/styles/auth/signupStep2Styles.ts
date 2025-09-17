import { StyleSheet } from 'react-native';

export const signupStep2Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7CB342',
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 40,
  },
  passwordHint: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 30,
    lineHeight: 16,
  },
});