import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { SaveListUrl } from './save-list-url'
import { ProjectCardStoryFrame } from ':/app/_fragments/storybook/story-frame'

function SaveListUrlStory() {
  const [value, setValue] = useState('')

  useEffect(() => {
    sessionStorage.removeItem('listUrl')
    const timer = window.setTimeout(() => {
      setValue(sessionStorage.getItem('listUrl') ?? '')
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  return (
    <ProjectCardStoryFrame>
      <SaveListUrl />
      <div className="fs-5">保存された URL: {value || '(未保存)'}</div>
    </ProjectCardStoryFrame>
  )
}

const meta = {
  title: 'Projects/Fragments/SaveListUrl',
  component: SaveListUrlStory,
  parameters: {
    nextNavigation: {
      pathname: '/projects',
      searchParams: {
        pageNumber: '3',
        sortKey: 'id',
        sortDir: 'asc',
      },
    },
  },
} satisfies Meta<typeof SaveListUrlStory>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
