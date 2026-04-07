import type { Meta, StoryObj } from '@storybook/react'
import { ProjectCompletePage } from './complete-page'
import { ProjectCardStoryFrame } from ':/app/_fragments/storybook/story-frame'

const meta = {
  title: 'Projects/Fragments/CompletePage',
  component: ProjectCompletePage,
  parameters: {
    layout: 'padded',
  },
  render: (args) => (
    <ProjectCardStoryFrame>
      <ProjectCompletePage {...args} />
    </ProjectCardStoryFrame>
  ),
} satisfies Meta<typeof ProjectCompletePage>

export default meta

type Story = StoryObj<typeof meta>

export const CreateCompleted: Story = {
  args: {
    title: 'プロジェクト登録完了画面',
    message: 'プロジェクトの登録が完了しました。',
  },
}
