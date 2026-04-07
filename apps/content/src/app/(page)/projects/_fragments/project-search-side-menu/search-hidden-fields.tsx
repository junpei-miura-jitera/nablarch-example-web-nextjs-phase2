export function SearchHiddenFields({
  searchParams,
}: {
  searchParams: Pick<URLSearchParams, 'get'>
}) {
  return (
    <>
      <input type="hidden" name="sortKey" value={searchParams.get('sortKey') ?? ''} />
      <input type="hidden" name="sortDir" value={searchParams.get('sortDir') ?? ''} />
      <input
        type="hidden"
        name="projectStartDateBeginStr"
        value={searchParams.get('projectStartDateBegin') ?? ''}
      />
      <input
        type="hidden"
        name="projectStartDateEndStr"
        value={searchParams.get('projectStartDateEnd') ?? ''}
      />
      <input
        type="hidden"
        name="projectEndDateBeginStr"
        value={searchParams.get('projectEndDateBegin') ?? ''}
      />
      <input
        type="hidden"
        name="projectEndDateEndStr"
        value={searchParams.get('projectEndDateEnd') ?? ''}
      />
      <input id="firstPageNumber" type="hidden" name="pageNumber" value="1" />
    </>
  )
}
