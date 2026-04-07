import type { Meta, StoryObj } from '@storybook/react'
import { ProjectCompletePageView } from './complete-page'

const meta = {
  title: 'Projects/Components/ProjectCompletePage',
  component: ProjectCompletePageView,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ProjectCompletePageView>

export default meta

type Story = StoryObj<typeof meta>

export const CreateCompleted: Story = {
  args: {
    title: 'プロジェクト登録完了画面',
    message: 'プロジェクトの登録が完了しました。',
  },
}

export const DeleteCompleted: Story = {
  args: {
    title: 'プロジェクト削除完了画面',
    message: 'プロジェクトの削除が完了しました。',
  },
}
