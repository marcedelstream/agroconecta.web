import { router } from 'expo-router'
import type { FeedContentItem } from './types'

export function openPublisher(item: FeedContentItem) {
  if (item.source === 'post' && item.organizationId) {
    router.push(`/(main)/publisher/${item.organizationId}` as never)
  }
}
