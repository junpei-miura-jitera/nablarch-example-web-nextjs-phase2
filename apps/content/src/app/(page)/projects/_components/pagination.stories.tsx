import type { Meta, StoryObj } from '@storybook/react'
import { ProjectPaginationView } from './pagination'

const meta = {
  title: 'Projects/Components/ProjectPagination',
  component: ProjectPaginationView,
  parameters: {
    layout: 'padded',
  },
  args: {
    buildUrl: (page: number) => `/projects?pageNumber=${page}`,
  },
} satisfies Meta<typeof ProjectPaginationView>

export default meta

type Story = StoryObj<typeof meta>

export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 5,
  },
}

export const MiddlePage: Story = {
  args: {
    currentPage: 3,
    totalPages: 8,
  },
}

export const LastPage: Story = {
  args: {
    currentPage: 8,
    totalPages: 8,
  },
}
