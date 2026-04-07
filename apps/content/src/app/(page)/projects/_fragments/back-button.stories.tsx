import type { Meta, StoryObj } from '@storybook/react'
import { BackButton } from './back-button'
import { ProjectCardStoryFrame } from ':/app/_fragments/storybook/story-frame'

const meta = {
  title: 'Projects/Fragments/BackButton',
  component: BackButton,
  parameters: {
    layout: 'padded',
  },
  render: (args) => (
    <ProjectCardStoryFrame>
      <BackButton {...args} />
    </ProjectCardStoryFrame>
  ),
} satisfies Meta<typeof BackButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: 'btn btn-link',
  },
}
