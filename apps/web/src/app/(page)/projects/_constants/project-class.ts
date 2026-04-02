/**
 * プロジェクト規模を定義したEnum。
 *
 * @source ProjectClass.java
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/common/code/
 */
export const PROJECT_CLASS = {
  /**
   * SS。
   */
  ss: 'SS',
  /**
   * S。
   */
  s: 'S',
  /**
   * A。
   */
  a: 'A',
  /**
   * B。
   */
  b: 'B',
  /**
   * C。
   */
  c: 'C',
  /**
   * D。
   */
  d: 'D',
} as const

/**
 * プロジェクト規模を定義したEnum のコード値型。
 */
export type ProjectClassValue = keyof typeof PROJECT_CLASS
