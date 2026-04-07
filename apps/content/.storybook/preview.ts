import type { Preview } from '@storybook/react'
import {
  resetStorybookNavigationContext,
  setStorybookNavigationContext,
} from './navigation-context'

const preview: Preview = {
  decorators: [
    (Story, context) => {
      resetStorybookNavigationContext()

      const navigation = context.parameters.nextNavigation as
        | {
            pathname?: string
            searchParams?: string | Record<string, string | string[]>
          }
        | undefined

      setStorybookNavigationContext({
        pathname: navigation?.pathname,
        searchParams: navigation?.searchParams,
      })

      return Story()
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
