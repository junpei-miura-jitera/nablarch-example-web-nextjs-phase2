import type { ApiProjectFormValues } from ':/shared/api/project'
import { normalizeDateForApi } from './format-date'

/**
 * フォーム入力値を API 送信用のデータに変換する。
 *
 * 文字列フィールドを数値に変換し、空文字は null にする。
 *
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/form/ProjectForm.java
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/action/ProjectAction.java#confirmOfCreate
 */
export function transformProjectFormData(data: ApiProjectFormValues) {
  return {
    ...data,
    projectStartDate: normalizeDateForApi(data.projectStartDate),
    projectEndDate: normalizeDateForApi(data.projectEndDate),
    // Java 側の ProjectForm.clientId は String 型で、hasClientId() で null チェックする。
    // 空文字は null に変換して Java 側の挙動に合わせる（0 ではなく null）。
    clientId: data.clientId ? Number(data.clientId) : null,
    sales: data.sales ? Number(data.sales) : null,
    costOfGoodsSold: data.costOfGoodsSold ? Number(data.costOfGoodsSold) : null,
    sga: data.sga ? Number(data.sga) : null,
    allocationOfCorpExpenses: data.allocationOfCorpExpenses
      ? Number(data.allocationOfCorpExpenses)
      : null,
  }
}
