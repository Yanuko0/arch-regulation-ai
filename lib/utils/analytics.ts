// lib/utils/analytics.ts

/**
 * 簡單的關鍵字分類器，用於後續儀表板統計
 */
export function detectCategory(question: string): string {
  const q = question.toLowerCase();
  if (/(違建|既存|加蓋|拆除|合法化|illegal|unauthorized|demolition)/.test(q)) return '違建查詢';
  if (/(翻新|老屋|裝修|拉皮|變更使用|renovation|remodeling|refurbishment)/.test(q)) return '老屋翻新';
  if (/(商業|商辦|店面|消防|使照|commercial|office|shop|business)/.test(q)) return '商業裝修法規';
  if (/(建蔽|容積|樓地板面積|退縮|空地|coverage|far|floor area|setback)/.test(q)) return '建蔽率與容積率';
  if (/(無障礙|身障|電梯|坡道|通道|accessibility|disabled|elevator|ramp)/.test(q)) return '無障礙相關';
  if (/(防火|避難|安全梯|排煙|區劃|fire safety|evacuation|smoke)/.test(q)) return '防火避難法規';
  return '其他';
}
