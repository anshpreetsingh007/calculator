import React from 'react'
import { SafeAreaView, View, Text, StatusBar, Pressable } from 'react-native'
import { styles } from './styles'

const buttons: string[][] = [
  ['AC', '+/-', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '=']
]

type ButtonType = 'number' | 'operator' | 'action' | 'equal'

type CalcButtonProps = {
  label: string
  wide?: boolean
  type?: ButtonType
}

const CalcButton = ({ label, wide = false, type = 'number' }: CalcButtonProps) => {
  return (
    <Pressable
      style={[
        styles.button,
        wide && styles.buttonWide,
        type === 'operator' && styles.operatorButton,
        type === 'action' && styles.actionButton,
        type === 'equal' && styles.equalButton
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          type === 'action' && styles.actionText,
          type === 'operator' && styles.operatorText
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

export default function Index() {
  const getType = (label: string): ButtonType => {
    if (label === '=') return 'equal'
    if (['+', '-', '×', '÷'].includes(label)) return 'operator'
    if (['AC', '+/-', '%'].includes(label)) return 'action'
    return 'number'
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.topSection}>
          <Text style={styles.smallText}>Calculator</Text>
          <View style={styles.displayCard}>
            <Text style={styles.expressionText}>12 + 8 × 3</Text>
            <Text style={styles.resultText}>36</Text>
          </View>
        </View>

        <View style={styles.keypad}>
          {buttons.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((item) => (
                <CalcButton
                  key={item}
                  label={item}
                  wide={item === '0'}
                  type={getType(item)}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}