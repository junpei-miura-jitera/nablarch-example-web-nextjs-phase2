"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PROJECT_SORT_KEY } from "../_constants/project-sort-key";
import { SORT_ORDER } from "../_constants/sort-order";

/**
 * ソート条件の select 要素。
 *
 * 元の Java 版と同様に、select 変更時にサーバーへリクエストを送る。
 * jQuery の `$(this).parents('form').submit()` に相当する動作を
 * Next.js の router.push で再現する。
 *
 * @see _references/nablarch-example-web/src/main/webapp/javascripts/projectList.js
 */
export function SortSelect({
  sortKey,
  sortDir,
}: {
  sortKey: string;
  sortDir: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set("pageNumber", "1");
    router.push(`/projects?${params.toString()}`);
  }

  return (
    <div className="row justify-content-end">
      <div className="col-md-2">
        <select
          className="form-select form-select-lg"
          value={sortKey}
          onChange={(e) => handleChange("sortKey", e.target.value)}
        >
          {Object.entries(PROJECT_SORT_KEY).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-1">
        <select
          className="form-select form-select-lg"
          value={sortDir}
          onChange={(e) => handleChange("sortDir", e.target.value)}
        >
          {Object.entries(SORT_ORDER).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
