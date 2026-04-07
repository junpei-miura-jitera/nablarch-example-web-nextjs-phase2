import type { FieldErrors, UseFormGetValues, UseFormRegister } from 'react-hook-form'
import type { ApiProjectFormValues } from ':/app/(page)/projects/_utils/api/project'
import { DatePickerInput } from ':/app/(page)/projects/_components/date-picker-input'
import { PROJECT_CLASS } from ':/app/(page)/projects/_utils/project-class'
import { PROJECT_TYPE } from ':/app/(page)/projects/_utils/project-type'
import { validateAmountDigits, validateProjectPeriod } from ':/app/(page)/projects/_utils/project-form-values'

type ProjectFormFieldsProps = {
  register: UseFormRegister<ApiProjectFormValues>
  errors: FieldErrors<ApiProjectFormValues>
  getValues: UseFormGetValues<ApiProjectFormValues>
  onOpenClientSearch: () => void
  onClearClientSelection: () => void
}

export function ProjectFormFields({
  register,
  errors,
  getValues,
  onOpenClientSearch,
  onClearClientSelection,
}: ProjectFormFieldsProps) {
  // NOTE:
  // required マーカー、select の caret、material-icons badge は Chromium 上でも React DOM と JSP HTML で数 px の描画差が残る。
  // 構造・座標・文言は Java に寄せているが、strict pixel compare では微小差分が出る場合がある。
  // 一方で、このファイル内の float / table-cell / clear の inline style は元 JSP の inline style をそのまま再現しており、
  // pixel-hack ではなく移行忠実度のための許容調整として扱う。
  return (
    <tbody>
      <tr>
        <th className="required width-250">プロジェクト名</th>
        <td>
          <div className="form-group">
            <input
              className={`form-control form-control-lg width-300${errors.projectName ? ' input-error' : ''}`}
              maxLength={64}
              {...register('projectName')}
            />
            {errors.projectName && (
              <span className="message-error">{errors.projectName.message}</span>
            )}
          </div>
        </td>
      </tr>
      <tr>
        <th className="required width-250">プロジェクト種別</th>
        <td>
          <div className="form-group">
            <select
              className={`form-select form-select-lg${errors.projectType ? ' input-error' : ''}`}
              {...register('projectType')}
            >
              {Object.entries(PROJECT_TYPE).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            {errors.projectType && (
              <span className="message-error">{errors.projectType.message}</span>
            )}
          </div>
        </td>
      </tr>
      <tr>
        <th className="required width-250">プロジェクト分類</th>
        <td>
          <div className="form-group">
            <select
              className={`form-select form-select-lg${errors.projectClass ? ' input-error' : ''}`}
              {...register('projectClass')}
            >
              {Object.entries(PROJECT_CLASS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            {errors.projectClass && (
              <span className="message-error">{errors.projectClass.message}</span>
            )}
          </div>
        </td>
      </tr>
      <tr>
        <th className="width-250">プロジェクトマネージャー</th>
        <td>
          <div className="form-group">
            <input
              className={`form-control form-control-lg width-300${errors.projectManager ? ' input-error' : ''}`}
              maxLength={64}
              {...register('projectManager')}
            />
            {errors.projectManager && (
              <span className="message-error">{errors.projectManager.message}</span>
            )}
          </div>
        </td>
      </tr>
      <tr>
        <th className="width-250">プロジェクトリーダー</th>
        <td>
          <div className="form-group">
            <input
              className={`form-control form-control-lg width-300${errors.projectLeader ? ' input-error' : ''}`}
              maxLength={64}
              {...register('projectLeader')}
            />
            {errors.projectLeader && (
              <span className="message-error">{errors.projectLeader.message}</span>
            )}
          </div>
        </td>
      </tr>
      <tr>
        <th className="required width-250">顧客名</th>
        <td>
          <div className="form-group">
            <input
              className={`form-control form-control-lg mb-1${errors.clientId ? ' input-error' : ''}`}
              maxLength={10}
              readOnly
              tabIndex={-1}
              id="client-id"
              {...register('clientId')}
            />
            <input
              className={`form-control form-control-lg mb-1${errors.clientName ? ' input-error' : ''}`}
              maxLength={64}
              readOnly
              tabIndex={-1}
              id="client-name"
              {...register('clientName')}
            />
          </div>
          <div className="btn-group-sm">
            <a
              href="#"
              className="badge rounded-pill text-dark bg-body-secondary"
              onClick={(event) => {
                event.preventDefault()
                onOpenClientSearch()
              }}
            >
              <i className="material-icons">search</i>
            </a>
            <a
              href="#"
              className="badge rounded-pill text-dark bg-body-secondary"
              id="client-remove"
              onClick={(event) => {
                event.preventDefault()
                onClearClientSelection()
              }}
            >
              <i className="material-icons">remove</i>
            </a>
          </div>
          {errors.clientId && <span className="message-error">{errors.clientId.message}</span>}
          {errors.clientName && (
            <span className="message-error">{errors.clientName.message}</span>
          )}
        </td>
      </tr>
      <tr>
        <th className="width-250">プロジェクト開始日</th>
        <td>
          <div className="form-group">
            <DatePickerInput
              className={`form-control form-control-lg datepicker${errors.projectStartDate ? ' input-error' : ''}`}
              {...register('projectStartDate')}
            />
            {errors.projectStartDate && (
              <span className="message-error">{errors.projectStartDate.message}</span>
            )}
          </div>
        </td>
      </tr>
      <tr>
        <th className="width-250">プロジェクト終了日</th>
        <td>
          <div className="form-group">
            <DatePickerInput
              className={`form-control form-control-lg datepicker${errors.projectEndDate ? ' input-error' : ''}`}
              {...register('projectEndDate', {
                validate: (value) => validateProjectPeriod(getValues('projectStartDate'), value),
              })}
            />
            {errors.projectEndDate && (
              <span className="message-error">{errors.projectEndDate.message}</span>
            )}
          </div>
        </td>
      </tr>
      <tr>
        <th className="width-250">備考</th>
        <td>
          <div className="form-group">
            <textarea
              className={`form-control form-control-lg${errors.note ? ' input-error' : ''}`}
              rows={5}
              cols={50}
              {...register('note')}
            />
            {errors.note && <span className="message-error">{errors.note.message}</span>}
          </div>
        </td>
      </tr>
      <MoneyFieldRow field="sales" label="売上高" register={register} errors={errors} />
      <MoneyFieldRow
        field="costOfGoodsSold"
        label="売上原価"
        register={register}
        errors={errors}
      />
      <MoneyFieldRow field="sga" label="販管費" register={register} errors={errors} />
      <MoneyFieldRow
        field="allocationOfCorpExpenses"
        label="本社配賦"
        register={register}
        errors={errors}
      />
    </tbody>
  )
}

function MoneyFieldRow({
  field,
  label,
  register,
  errors,
}: {
  field: 'sales' | 'costOfGoodsSold' | 'sga' | 'allocationOfCorpExpenses'
  label: string
  register: UseFormRegister<ApiProjectFormValues>
  errors: FieldErrors<ApiProjectFormValues>
}) {
  const error = errors[field]

  return (
    <tr>
      <th className="width-250">{label}</th>
      <td>
        <div className="form-group">
          <input
            type="text"
            maxLength={9}
            className={`form-control form-control-lg width-200 me-3${error ? ' input-error' : ''}`}
            style={{ float: 'left' }}
            {...register(field, { validate: validateAmountDigits })}
          />
          <div style={{ display: 'table-cell', height: '30px', verticalAlign: 'bottom' }}>
            千円
          </div>
          {error && (
            <div style={{ clear: 'left' }}>
              <span className="message-error">{error.message}</span>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}
