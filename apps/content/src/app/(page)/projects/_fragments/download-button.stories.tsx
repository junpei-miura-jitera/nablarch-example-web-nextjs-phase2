import type { Meta, StoryObj } from '@storybook/react'
import { DownloadButton } from './download-button'
import { ProjectCardStoryFrame } from ':/app/_fragments/storybook/story-frame'

const meta = {
  title: 'Projects/Fragments/DownloadButton',
  component: DownloadButton,
  parameters: {
    layout: 'padded',
  },
  render: (args) => (
    <ProjectCardStoryFrame>
      <DownloadButton {...args} />
    </ProjectCardStoryFrame>
  ),
} satisfies Meta<typeof DownloadButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    searchParams: {
      pageNumber: '1',
      sortKey: 'id',
      sortDir: 'asc',
      clientName: 'TIS株式会社',
      projectClass: ['a', 'b'],
    },
  },
}
