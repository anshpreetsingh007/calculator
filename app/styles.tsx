import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f1117'
  },
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
    paddingHorizontal: 18,
    paddingBottom: 20
  },
  topSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 24
  },
  smallText: {
    color: '#8b93a7',
    fontSize: 16,
    marginBottom: 14,
    textAlign: 'right'
  },
  displayCard: {
    backgroundColor: '#171b26',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 24,
    minHeight: 150,
    justifyContent: 'flex-end'
  },
  expressionText: {
    color: '#7e879b',
    fontSize: 24,
    textAlign: 'right',
    marginBottom: 10
  },
  resultText: {
    color: '#ffffff',
    fontSize: 56,
    fontWeight: '700',
    textAlign: 'right'
  },
  keypad: {
    gap: 14
  },
  row: {
    flexDirection: 'row',
    gap: 14
  },
  button: {
    flex: 1,
    height: 78,
    borderRadius: 24,
    backgroundColor: '#1a1f2b',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonWide: {
    flex: 2.14,
    alignItems: 'flex-start',
    paddingLeft: 30
  },
  buttonText: {
    color: '#f4f7ff',
    fontSize: 28,
    fontWeight: '600'
  },
  actionButton: {
    backgroundColor: '#252c3d'
  },
  operatorButton: {
    backgroundColor: '#2d213f'
  },
  equalButton: {
    backgroundColor: '#5b39d3'
  },
  actionText: {
  color: '#d8deee'
},
operatorText: {
  color: '#cbb8ff'
}
})