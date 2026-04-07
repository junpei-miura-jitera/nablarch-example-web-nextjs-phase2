import type { Meta, StoryObj } from '@storybook/react'
import { ProjectPageStoryFrame } from ':/app/_fragments/storybook/story-frame'
import { ProjectSearchSideMenu } from './index'

const meta = {
  title: 'Projects/Fragments/ProjectSearchSideMenu',
  component: ProjectSearchSideMenu,
  parameters: {
    nextNavigation: {
      pathname: '/projects',
      searchParams: {
        clientId: '10000001',
        clientName: 'TIS株式会社',
        projectName: '次世代PJ',
        projectClass: ['a', 'b'],
        sortKey: 'id',
        sortDir: 'asc',
      },
    },
  },
  render: () => (
    <ProjectPageStoryFrame>
      <div className="row">
        <ProjectSearchSideMenu />
      </div>
    </ProjectPageStoryFrame>
  ),
} satisfies Meta<typeof ProjectSearchSideMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
