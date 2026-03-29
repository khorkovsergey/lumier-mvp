export const dynamic = 'force-dynamic'

import {
  getWeeklyInsight, getGlobalForecasts, getCalendarEvents,
  getBreakingInsights, getAiForecasts, getForecastAccuracy,
  getUserReactions,
} from '@/server/actions/forecasts'
import { getInsights } from '@/server/actions'
import { InsightsClient } from './InsightsClient'

export default async function InsightsPage() {
  const [weekly, globals, calendar, breaking, ai, accuracy, articles, reactions] = await Promise.all([
    getWeeklyInsight(),
    getGlobalForecasts(),
    getCalendarEvents(),
    getBreakingInsights(),
    getAiForecasts(),
    getForecastAccuracy(),
    getInsights(),
    getUserReactions(),
  ])

  return (
    <InsightsClient
      weekly={weekly}
      globals={globals}
      calendar={calendar}
      breaking={breaking}
      ai={ai}
      accuracy={accuracy}
      articles={articles}
      reactions={reactions}
    />
  )
}
