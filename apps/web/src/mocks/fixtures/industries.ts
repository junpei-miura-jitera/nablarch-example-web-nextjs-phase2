/**
 * 業種マスタ fixture データ。
 *
 * Nablarch example アプリの INDUSTRY テーブル初期データに対応。
 *
 * @see _references/nablarch-example-web/src/main/resources/data/data.sql
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/dto/IndustryDto.java
 */

export type IndustryDto = {
  readonly industryCode: string;
  readonly industryName: string;
};

export const industryFixtures: readonly IndustryDto[] = [
  { industryCode: "01", industryName: "農業" },
  { industryCode: "02", industryName: "林業" },
  { industryCode: "03", industryName: "漁業" },
  { industryCode: "04", industryName: "鉱業" },
  { industryCode: "05", industryName: "建設業" },
  { industryCode: "06", industryName: "製造業" },
  { industryCode: "07", industryName: "電気・ガス・水道業" },
  { industryCode: "08", industryName: "運輸・通信業" },
  { industryCode: "09", industryName: "卸売・小売業" },
  { industryCode: "10", industryName: "金融・保険業" },
  { industryCode: "11", industryName: "不動産業" },
  { industryCode: "12", industryName: "サービス業" },
  { industryCode: "13", industryName: "公務" },
  { industryCode: "14", industryName: "情報通信業" },
  { industryCode: "15", industryName: "医療・福祉" },
] as const;
