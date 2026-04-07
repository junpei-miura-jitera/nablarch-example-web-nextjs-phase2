import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import { ClientSearchModal } from './client-search-modal'
import { storyClients, storyIndustries } from ':/app/(page)/projects/_fragments/storybook/project-fixtures'

function MockedClientSearchModal({ mode }: { mode: 'default' | 'error' }) {
  useEffect(() => {
    const originalFetch = globalThis.fetch

    globalThis.fetch = async (input) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof Request
            ? input.url
            : input.toString()

      if (mode === 'error') {
        return new Response(null, { status: 500 })
      }

      if (url.includes('/api/industry/find')) {
        return Response.json(storyIndustries)
      }

      if (url.includes('/api/client/find')) {
        return Response.json(storyClients)
      }

      return new Response(null, { status: 404 })
    }

    return () => {
      globalThis.fetch = originalFetch
    }
  }, [mode])

  return <ClientSearchModal isOpen onClose={() => {}} onSelect={() => {}} />
}

const meta = {
  title: 'Projects/Components/ClientSearchModal',
  component: MockedClientSearchModal,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MockedClientSearchModal>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    mode: 'default',
  },
}

export const ErrorState: Story = {
  args: {
    mode: 'error',
  },
}
