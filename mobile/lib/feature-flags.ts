// La v2 (feed vertical, docs/design_handoff_v2_feed) convive con la v1 detrás de este flag para
// poder seguir sacando arreglos de v1 sin mezclar. Se lee en build time (EXPO_PUBLIC_*).
export const FEED_V2 = process.env.EXPO_PUBLIC_FEED_V2 === 'true'

export const HOME_ROUTE = FEED_V2 ? '/(main)/(tabs)/feed' : '/(main)/(tabs)/home'
