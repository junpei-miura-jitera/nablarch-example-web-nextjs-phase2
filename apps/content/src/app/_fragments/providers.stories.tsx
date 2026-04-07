import type { Meta, StoryObj } from '@storybook/react'
import Providers from './providers'
import { ProjectCardStoryFrame } from './storybook/story-frame'

const meta = {
  title: 'App/Fragments/Providers',
  component: Providers,
  args: {
    children: null,
  },
  render: () => (
    <ProjectCardStoryFrame>
      <Providers>
        <div className="fs-4">Providers 経由で描画されています。</div>
      </Providers>
    </ProjectCardStoryFrame>
  ),
} satisfies Meta<typeof Providers>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
