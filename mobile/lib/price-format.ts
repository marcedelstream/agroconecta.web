import type { MarketPrice } from './types'

// Formato de precios compartido por el tablero de Inicio v1 (PriceBoard) y la tarjeta del feed v2.
// Ganadero en guaraníes sin decimales, commodities en dólares con 2 decimales (regla 8 de CLAUDE.md).

export function formatPriceValue(price: MarketPrice): string {
  if (price.currency === 'PYG') {
    return `₲ ${Math.round(price.value).toLocaleString('es-PY')}`
  }
  return `$ ${price.value.toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatPriceDelta(price: MarketPrice): string {
  const arrow = price.changePercent >= 0 ? '▲' : '▼'
  return `${arrow} ${Math.abs(price.changePercent).toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
}
