import { HttpResponse, http } from 'msw'
import { uploadProjects } from '../../_services/mock-project-command'
import { store } from '../../_services/mock-state'
import type { ApiProjectFormValues } from ':/shared/api/project'
import { parseCsvLine } from '../../../../app/(page)/projects/_utils/parse-csv-line'

/**
 * `/api/projectupload/upload` を処理する POST handler。
 */
export const projectUploadPostHandler = http.post(
  '/api/projectupload/upload',
  async ({ request }) => {
    try {
      const formData = await request.formData()
      const file = formData.get('uploadFile')
      if (!file || typeof file === 'string' || typeof file.text !== 'function') {
        return HttpResponse.json({
          ok: false,
          message: 'ファイルが指定されていません。',
        })
      }

      const text = await file.text()
      const lines = text.split('\n').filter((line) => line.trim() !== '')
      const dataLines = lines.slice(1)

      const rows: ApiProjectFormValues[] = dataLines.map((line) => {
        const cols = parseCsvLine(line)
        return {
          projectName: cols[0]?.trim() ?? '',
          projectType: (cols[1]?.trim() ?? 'development') as 'development' | 'maintenance',
          projectClass: (cols[2]?.trim() ?? 'd') as 'ss' | 's' | 'a' | 'b' | 'c' | 'd',
          projectManager: cols[3]?.trim(),
          projectLeader: cols[4]?.trim(),
          clientId: cols[5]?.trim() ?? '1',
          clientName: cols[6]?.trim(),
          projectStartDate: cols[7]?.trim(),
          projectEndDate: cols[8]?.trim(),
          note: cols[9]?.trim(),
          sales: cols[10]?.trim(),
          costOfGoodsSold: cols[11]?.trim(),
          sga: cols[12]?.trim(),
          allocationOfCorpExpenses: cols[13]?.trim(),
        }
      })

      const result = uploadProjects(
        store.reserveProjectIds(rows.length),
        store.getCurrentUserId(),
        rows,
      )
      store.insertProjects(result.createdProjects)
      return HttpResponse.json({
        ok: true,
        count: result.created,
        message: `${result.created}件のプロジェクトを登録しました。`,
      })
    } catch {
      return HttpResponse.json({
        ok: false,
        message: 'ファイルの解析に失敗しました。',
      })
    }
  },
)
