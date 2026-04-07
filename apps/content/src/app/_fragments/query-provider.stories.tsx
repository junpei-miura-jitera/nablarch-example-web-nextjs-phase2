import type { Meta, StoryObj } from '@storybook/react'
import { QueryProvider } from './query-provider'
import { ProjectCardStoryFrame } from './storybook/story-frame'

const meta = {
  title: 'App/Fragments/QueryProvider',
  component: QueryProvider,
  args: {
    children: null,
  },
  render: () => (
    <ProjectCardStoryFrame>
      <QueryProvider>
        <div className="fs-4">TanStack Query Provider が有効です。</div>
      </QueryProvider>
    </ProjectCardStoryFrame>
  ),
} satisfies Meta<typeof QueryProvider>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
