import type { Meta, StoryObj } from '@storybook/react'
import type { FieldErrors } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import type { ApiProjectFormValues } from ':/app/(page)/projects/_utils/api/project'
import { ProjectCardStoryFrame } from ':/app/_fragments/storybook/story-frame'
import { defaultProjectFormValues } from ':/app/(page)/projects/_fragments/storybook/project-fixtures'
import { ProjectFormFields } from './project-form-fields'

function ProjectFormFieldsStory({ errors }: { errors?: FieldErrors<ApiProjectFormValues> }) {
  const form = useForm<ApiProjectFormValues>({
    defaultValues: defaultProjectFormValues,
  })

  return (
    <ProjectCardStoryFrame>
      <table className="table">
        <ProjectFormFields
          register={form.register}
          errors={errors ?? form.formState.errors}
          getValues={form.getValues}
          onOpenClientSearch={() => {}}
          onClearClientSelection={() => {
            form.setValue('clientId', '')
            form.setValue('clientName', '')
          }}
        />
      </table>
    </ProjectCardStoryFrame>
  )
}

const meta = {
  title: 'Projects/Components/ProjectFormFields',
  component: ProjectFormFieldsStory,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ProjectFormFieldsStory>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithErrors: Story = {
  args: {
    errors: {
      projectName: { message: 'プロジェクト名を入力してください。' },
      clientId: { message: '顧客を選択してください。' },
      projectEndDate: {
        message: 'プロジェクト終了日はプロジェクト開始日より後の日付を入力して下さい。',
      },
      sales: { message: '9桁以内で入力してください' },
    } as FieldErrors<ApiProjectFormValues>,
  },
}
