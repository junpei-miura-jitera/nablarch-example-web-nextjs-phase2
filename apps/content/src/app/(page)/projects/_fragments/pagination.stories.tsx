import type { Meta, StoryObj } from '@storybook/react'
import { ProjectPagination } from './pagination'
import { ProjectCardStoryFrame } from ':/app/_fragments/storybook/story-frame'

const meta = {
  title: 'Projects/Fragments/Pagination',
  component: ProjectPagination,
  parameters: {
    layout: 'padded',
  },
  render: (args) => (
    <ProjectCardStoryFrame>
      <ProjectPagination {...args} />
    </ProjectCardStoryFrame>
  ),
} satisfies Meta<typeof ProjectPagination>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    currentPage: 3,
    totalPages: 8,
    buildUrl: (page: number) => `/projects?pageNumber=${page}`,
  },
}
