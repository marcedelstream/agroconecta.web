import { useEffect, useState } from 'react'
import { Keyboard, Platform } from 'react-native'

/** true mientras el teclado está abierto. En iOS usa los eventos "Will" para moverse junto con el teclado. */
export function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const show = Keyboard.addListener(showEvent, () => setVisible(true))
    const hide = Keyboard.addListener(hideEvent, () => setVisible(false))
    return () => {
      show.remove()
      hide.remove()
    }
  }, [])
  return visible
}
