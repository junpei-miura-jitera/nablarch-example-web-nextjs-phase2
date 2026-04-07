import type { Meta, StoryObj } from '@storybook/react'
import { ConfirmButton } from './confirm-button'
import { ProjectCardStoryFrame } from ':/app/_fragments/storybook/story-frame'

const meta = {
  title: 'Projects/Fragments/ConfirmButton',
  component: ConfirmButton,
  parameters: {
    layout: 'padded',
  },
  render: (args) => (
    <ProjectCardStoryFrame>
      <ConfirmButton {...args} />
    </ProjectCardStoryFrame>
  ),
} satisfies Meta<typeof ConfirmButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onConfirm: async () => {},
    redirectTo: '/projects/new/complete',
    errorMessage: '登録に失敗しました。',
  },
}
