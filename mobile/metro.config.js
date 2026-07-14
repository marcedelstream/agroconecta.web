const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

// react-native-youtube-iframe usa el EventEmitter de Node ('events'), que no es un módulo
// nativo de RN — Metro lo trata como stdlib de Node y no lo resuelve solo por estar en
// node_modules como dependencia transitiva. Se fuerza el mapeo al paquete instalado.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  events: require.resolve('events'),
}

module.exports = withNativeWind(config, { input: './global.css' })
