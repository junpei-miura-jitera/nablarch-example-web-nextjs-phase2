/**
 * 顧客マスタ fixture データ。
 *
 * Nablarch example アプリの CLIENT テーブル初期データに対応。
 *
 * @see _references/nablarch-example-web/src/main/resources/data/data.sql
 * @see _references/nablarch-example-web/src/main/java/com/nablarch/example/app/web/dto/ClientDto.java
 */

export type ClientDto = {
  readonly clientId: number;
  readonly clientName: string;
  readonly industryCode: string;
  readonly industryName: string;
};

export const clientFixtures: readonly ClientDto[] = [
  { clientId: 1, clientName: "旭商事株式会社", industryCode: "09", industryName: "卸売・小売業" },
  { clientId: 2, clientName: "東京電子工業株式会社", industryCode: "06", industryName: "製造業" },
  { clientId: 3, clientName: "富士通信システム株式会社", industryCode: "14", industryName: "情報通信業" },
  { clientId: 4, clientName: "三菱重工建設株式会社", industryCode: "05", industryName: "建設業" },
  { clientId: 5, clientName: "大和証券グループ", industryCode: "10", industryName: "金融・保険業" },
  { clientId: 6, clientName: "日本医療システム株式会社", industryCode: "15", industryName: "医療・福祉" },
  { clientId: 7, clientName: "全日本運輸株式会社", industryCode: "08", industryName: "運輸・通信業" },
  { clientId: 8, clientName: "東北エネルギー株式会社", industryCode: "07", industryName: "電気・ガス・水道業" },
  { clientId: 9, clientName: "青森林業協同組合", industryCode: "02", industryName: "林業" },
  { clientId: 10, clientName: "横浜不動産開発株式会社", industryCode: "11", industryName: "不動産業" },
  { clientId: 11, clientName: "関西サービス株式会社", industryCode: "12", industryName: "サービス業" },
  { clientId: 12, clientName: "北海道農業法人", industryCode: "01", industryName: "農業" },
] as const;
