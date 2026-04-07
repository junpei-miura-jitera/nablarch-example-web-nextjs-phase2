import type { Meta, StoryObj } from '@storybook/react'
import { ProjectCardStoryFrame } from ':/app/_fragments/storybook/story-frame'
import { SortSelect } from './sort-select'

const meta = {
  title: 'Projects/Fragments/SortSelect',
  component: SortSelect,
  parameters: {
    layout: 'padded',
    nextNavigation: {
      pathname: '/projects',
      searchParams: {
        clientName: 'TIS株式会社',
        pageNumber: '3',
        sortKey: 'name',
        sortDir: 'desc',
      },
    },
  },
  render: (args) => (
    <ProjectCardStoryFrame>
      <SortSelect {...args} />
    </ProjectCardStoryFrame>
  ),
} satisfies Meta<typeof SortSelect>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    sortKey: 'name',
    sortDir: 'desc',
  },
}
