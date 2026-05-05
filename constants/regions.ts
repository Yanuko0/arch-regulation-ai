// constants/regions.ts

export interface RegionConfig {
  code: string;
  flag: string;
  nameI18n: Record<string, string>;
  regulationLanguage: string;
  availableLocales: string[];
  regulationSources: {
    name: string;
    url: string;
    language: string;
  }[];
  subRegions?: {
    code: string;
    nameI18n: Record<string, string>;
  }[];
}

export const REGIONS: RegionConfig[] = [
  {
    code: 'TW',
    flag: '🇹🇼',
    nameI18n: { 'zh-TW': '台灣', en: 'Taiwan', ja: '台湾', ko: '대만' },
    regulationLanguage: 'zh-TW',
    availableLocales: ['zh-TW', 'en'],
    regulationSources: [
      { name: '建築法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070008', language: 'zh-TW' },
      { name: '建築技術規則', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070115', language: 'zh-TW' },
      { name: '都市計畫法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070007', language: 'zh-TW' },
    ],
    subRegions: [
      { code: 'KLU', nameI18n: { 'zh-TW': '基隆市', en: 'Keelung City' } },
      { code: 'TPE', nameI18n: { 'zh-TW': '台北市', en: 'Taipei City' } },
      { code: 'NWT', nameI18n: { 'zh-TW': '新北市', en: 'New Taipei City' } },
      { code: 'TYC', nameI18n: { 'zh-TW': '桃園市', en: 'Taoyuan City' } },
      { code: 'HSZ', nameI18n: { 'zh-TW': '新竹市', en: 'Hsinchu City' } },
      { code: 'HSQ', nameI18n: { 'zh-TW': '新竹縣', en: 'Hsinchu County' } },
      { code: 'MIA', nameI18n: { 'zh-TW': '苗栗縣', en: 'Miaoli County' } },
      { code: 'TXG', nameI18n: { 'zh-TW': '台中市', en: 'Taichung City' } },
      { code: 'CHANG', nameI18n: { 'zh-TW': '彰化縣', en: 'Changhua County' } },
      { code: 'NAN', nameI18n: { 'zh-TW': '南投縣', en: 'Nantou County' } },
      { code: 'YUN', nameI18n: { 'zh-TW': '雲林縣', en: 'Yunlin County' } },
      { code: 'CYI', nameI18n: { 'zh-TW': '嘉義市', en: 'Chiayi City' } },
      { code: 'CYQ', nameI18n: { 'zh-TW': '嘉義縣', en: 'Chiayi County' } },
      { code: 'TNN', nameI18n: { 'zh-TW': '台南市', en: 'Tainan City' } },
      { code: 'KHH', nameI18n: { 'zh-TW': '高雄市', en: 'Kaohsiung City' } },
      { code: 'PIF', nameI18n: { 'zh-TW': '屏東縣', en: 'Pingtung County' } },
      { code: 'ILN', nameI18n: { 'zh-TW': '宜蘭縣', en: 'Yilan County' } },
      { code: 'HUA', nameI18n: { 'zh-TW': '花蓮縣', en: 'Hualien County' } },
      { code: 'TTT', nameI18n: { 'zh-TW': '台東縣', en: 'Taitung County' } },
      { code: 'PEH', nameI18n: { 'zh-TW': '澎湖縣', en: 'Penghu County' } },
      { code: 'KMN', nameI18n: { 'zh-TW': '金門縣', en: 'Kinmen County' } },
      { code: 'LNN', nameI18n: { 'zh-TW': '連江縣', en: 'Lienchiang County' } },
    ]
  },
  {
    code: 'JP',
    flag: '🇯🇵',
    nameI18n: { 'zh-TW': '日本', en: 'Japan', ja: '日本', ko: '일본' },
    regulationLanguage: 'ja',
    availableLocales: ['ja', 'en', 'zh-TW'],
    regulationSources: [
      { name: '建築基準法', url: 'https://laws.e-gov.go.jp/law/325AC0000000201', language: 'ja' },
    ],
    subRegions: [
      { code: 'Hokkaido', nameI18n: { 'zh-TW': '北海道', en: 'Hokkaido', ja: '北海道' } },
      { code: 'Aomori', nameI18n: { 'zh-TW': '青森縣', en: 'Aomori', ja: '青森県' } },
      { code: 'Iwate', nameI18n: { 'zh-TW': '岩手縣', en: 'Iwate', ja: '岩手県' } },
      { code: 'Miyagi', nameI18n: { 'zh-TW': '宮城縣', en: 'Miyagi', ja: '宮城県' } },
      { code: 'Akita', nameI18n: { 'zh-TW': '秋田縣', en: 'Akita', ja: '秋田県' } },
      { code: 'Yamagata', nameI18n: { 'zh-TW': '山形縣', en: 'Yamagata', ja: '山形県' } },
      { code: 'Fukushima', nameI18n: { 'zh-TW': '福島縣', en: 'Fukushima', ja: '福島県' } },
      { code: 'Ibaraki', nameI18n: { 'zh-TW': '茨城縣', en: 'Ibaraki', ja: '茨城県' } },
      { code: 'Tochigi', nameI18n: { 'zh-TW': '栃木縣', en: 'Tochigi', ja: '栃木県' } },
      { code: 'Gunma', nameI18n: { 'zh-TW': '群馬縣', en: 'Gunma', ja: '群馬県' } },
      { code: 'Saitama', nameI18n: { 'zh-TW': '埼玉縣', en: 'Saitama', ja: '埼玉県' } },
      { code: 'Chiba', nameI18n: { 'zh-TW': '千葉縣', en: 'Chiba', ja: '千葉県' } },
      { code: 'Tokyo', nameI18n: { 'zh-TW': '東京都', en: 'Tokyo', ja: '東京都' } },
      { code: 'Kanagawa', nameI18n: { 'zh-TW': '神奈川縣', en: 'Kanagawa', ja: '神奈川県' } },
      { code: 'Niigata', nameI18n: { 'zh-TW': '新潟縣', en: 'Niigata', ja: '新潟県' } },
      { code: 'Toyama', nameI18n: { 'zh-TW': '富山縣', en: 'Toyama', ja: '富山県' } },
      { code: 'Ishikawa', nameI18n: { 'zh-TW': '石川縣', en: 'Ishikawa', ja: '石川県' } },
      { code: 'Fukui', nameI18n: { 'zh-TW': '福井縣', en: 'Fukui', ja: '福井県' } },
      { code: 'Yamanashi', nameI18n: { 'zh-TW': '山梨縣', en: 'Yamanashi', ja: '山梨県' } },
      { code: 'Nagano', nameI18n: { 'zh-TW': '長野縣', en: 'Nagano', ja: '長野県' } },
      { code: 'Gifu', nameI18n: { 'zh-TW': '岐阜縣', en: 'Gifu', ja: '岐阜県' } },
      { code: 'Shizuoka', nameI18n: { 'zh-TW': '靜岡縣', en: 'Shizuoka', ja: '静岡県' } },
      { code: 'Aichi', nameI18n: { 'zh-TW': '愛知縣', en: 'Aichi', ja: '愛知県' } },
      { code: 'Mie', nameI18n: { 'zh-TW': '三重縣', en: 'Mie', ja: '三重県' } },
      { code: 'Shiga', nameI18n: { 'zh-TW': '滋賀縣', en: 'Shiga', ja: '滋賀県' } },
      { code: 'Kyoto', nameI18n: { 'zh-TW': '京都府', en: 'Kyoto', ja: '京都府' } },
      { code: 'Osaka', nameI18n: { 'zh-TW': '大阪府', en: 'Osaka', ja: '大阪府' } },
      { code: 'Hyogo', nameI18n: { 'zh-TW': '兵庫縣', en: 'Hyogo', ja: '兵庫県' } },
      { code: 'Nara', nameI18n: { 'zh-TW': '奈良縣', en: 'Nara', ja: '奈良県' } },
      { code: 'Wakayama', nameI18n: { 'zh-TW': '和歌山縣', en: 'Wakayama', ja: '和歌山県' } },
      { code: 'Tottori', nameI18n: { 'zh-TW': '鳥取縣', en: 'Tottori', ja: '鳥取県' } },
      { code: 'Shimane', nameI18n: { 'zh-TW': '島根縣', en: 'Shimane', ja: '島根県' } },
      { code: 'Okayama', nameI18n: { 'zh-TW': '岡山縣', en: 'Okayama', ja: '岡山県' } },
      { code: 'Hiroshima', nameI18n: { 'zh-TW': '廣島縣', en: 'Hiroshima', ja: '広島県' } },
      { code: 'Yamaguchi', nameI18n: { 'zh-TW': '山口縣', en: 'Yamaguchi', ja: '山口県' } },
      { code: 'Tokushima', nameI18n: { 'zh-TW': '德島縣', en: 'Tokushima', ja: '徳島県' } },
      { code: 'Kagawa', nameI18n: { 'zh-TW': '香川縣', en: 'Kagawa', ja: '香川県' } },
      { code: 'Ehime', nameI18n: { 'zh-TW': '愛媛縣', en: 'Ehime', ja: '愛媛県' } },
      { code: 'Kochi', nameI18n: { 'zh-TW': '高知縣', en: 'Kochi', ja: '高知県' } },
      { code: 'Fukuoka', nameI18n: { 'zh-TW': '福岡縣', en: 'Fukuoka', ja: '福岡県' } },
      { code: 'Saga', nameI18n: { 'zh-TW': '佐賀縣', en: 'Saga', ja: '佐賀県' } },
      { code: 'Nagasaki', nameI18n: { 'zh-TW': '長崎縣', en: 'Nagasaki', ja: '長崎県' } },
      { code: 'Kumamoto', nameI18n: { 'zh-TW': '熊本縣', en: 'Kumamoto', ja: '熊本県' } },
      { code: 'Oita', nameI18n: { 'zh-TW': '大分縣', en: 'Oita', ja: '大分県' } },
      { code: 'Miyazaki', nameI18n: { 'zh-TW': '宮崎縣', en: 'Miyazaki', ja: '宮崎県' } },
      { code: 'Kagoshima', nameI18n: { 'zh-TW': '鹿兒島縣', en: 'Kagoshima', ja: '鹿児島県' } },
      { code: 'Okinawa', nameI18n: { 'zh-TW': '沖繩縣', en: 'Okinawa', ja: '沖縄県' } }
    ]
  },
  {
    code: 'US',
    flag: '🇺🇸',
    nameI18n: { 'zh-TW': '美國', en: 'United States', ja: 'アメリカ', ko: '미국' },
    regulationLanguage: 'en',
    availableLocales: ['en', 'zh-TW'],
    regulationSources: [
      { name: 'International Building Code (IBC)', url: 'https://codes.iccsafe.org/content/IBC2021P2', language: 'en' },
    ],
    subRegions: [
      { code: 'AL', nameI18n: { 'zh-TW': '阿拉巴馬州', en: 'Alabama' } },
      { code: 'AK', nameI18n: { 'zh-TW': '阿拉斯加州', en: 'Alaska' } },
      { code: 'AZ', nameI18n: { 'zh-TW': '亞利桑那州', en: 'Arizona' } },
      { code: 'AR', nameI18n: { 'zh-TW': '阿肯色州', en: 'Arkansas' } },
      { code: 'CA', nameI18n: { 'zh-TW': '加利福尼亞州', en: 'California' } },
      { code: 'CO', nameI18n: { 'zh-TW': '科羅拉多州', en: 'Colorado' } },
      { code: 'CT', nameI18n: { 'zh-TW': '康乃狄克州', en: 'Connecticut' } },
      { code: 'DE', nameI18n: { 'zh-TW': '德拉瓦州', en: 'Delaware' } },
      { code: 'FL', nameI18n: { 'zh-TW': '佛羅里達州', en: 'Florida' } },
      { code: 'GA', nameI18n: { 'zh-TW': '喬治亞州', en: 'Georgia' } },
      { code: 'HI', nameI18n: { 'zh-TW': '夏威夷州', en: 'Hawaii' } },
      { code: 'ID', nameI18n: { 'zh-TW': '愛達荷州', en: 'Idaho' } },
      { code: 'IL', nameI18n: { 'zh-TW': '伊利諾州', en: 'Illinois' } },
      { code: 'IN', nameI18n: { 'zh-TW': '印第安納州', en: 'Indiana' } },
      { code: 'IA', nameI18n: { 'zh-TW': '愛荷華州', en: 'Iowa' } },
      { code: 'KS', nameI18n: { 'zh-TW': '堪薩斯州', en: 'Kansas' } },
      { code: 'KY', nameI18n: { 'zh-TW': '肯塔基州', en: 'Kentucky' } },
      { code: 'LA', nameI18n: { 'zh-TW': '路易斯安那州', en: 'Louisiana' } },
      { code: 'ME', nameI18n: { 'zh-TW': '緬因州', en: 'Maine' } },
      { code: 'MD', nameI18n: { 'zh-TW': '馬里蘭州', en: 'Maryland' } },
      { code: 'MA', nameI18n: { 'zh-TW': '麻薩諸塞州', en: 'Massachusetts' } },
      { code: 'MI', nameI18n: { 'zh-TW': '密西根州', en: 'Michigan' } },
      { code: 'MN', nameI18n: { 'zh-TW': '明尼蘇達州', en: 'Minnesota' } },
      { code: 'MS', nameI18n: { 'zh-TW': '密西西比州', en: 'Mississippi' } },
      { code: 'MO', nameI18n: { 'zh-TW': '密蘇里州', en: 'Missouri' } },
      { code: 'MT', nameI18n: { 'zh-TW': '蒙大拿州', en: 'Montana' } },
      { code: 'NE', nameI18n: { 'zh-TW': '內布拉斯加州', en: 'Nebraska' } },
      { code: 'NV', nameI18n: { 'zh-TW': '內華達州', en: 'Nevada' } },
      { code: 'NH', nameI18n: { 'zh-TW': '新罕布夏州', en: 'New Hampshire' } },
      { code: 'NJ', nameI18n: { 'zh-TW': '紐澤西州', en: 'New Jersey' } },
      { code: 'NM', nameI18n: { 'zh-TW': '新墨西哥州', en: 'New Mexico' } },
      { code: 'NY', nameI18n: { 'zh-TW': '紐約州', en: 'New York' } },
      { code: 'NC', nameI18n: { 'zh-TW': '北卡羅來納州', en: 'North Carolina' } },
      { code: 'ND', nameI18n: { 'zh-TW': '北達科他州', en: 'North Dakota' } },
      { code: 'OH', nameI18n: { 'zh-TW': '俄亥俄州', en: 'Ohio' } },
      { code: 'OK', nameI18n: { 'zh-TW': '奧克拉荷馬州', en: 'Oklahoma' } },
      { code: 'OR', nameI18n: { 'zh-TW': '俄勒岡州', en: 'Oregon' } },
      { code: 'PA', nameI18n: { 'zh-TW': '賓夕法尼亞州', en: 'Pennsylvania' } },
      { code: 'RI', nameI18n: { 'zh-TW': '羅德島州', en: 'Rhode Island' } },
      { code: 'SC', nameI18n: { 'zh-TW': '南卡羅來納州', en: 'South Carolina' } },
      { code: 'SD', nameI18n: { 'zh-TW': '南達科他州', en: 'South Dakota' } },
      { code: 'TN', nameI18n: { 'zh-TW': '田納西州', en: 'Tennessee' } },
      { code: 'TX', nameI18n: { 'zh-TW': '德克薩斯州', en: 'Texas' } },
      { code: 'UT', nameI18n: { 'zh-TW': '猶他州', en: 'Utah' } },
      { code: 'VT', nameI18n: { 'zh-TW': '佛蒙特州', en: 'Vermont' } },
      { code: 'VA', nameI18n: { 'zh-TW': '維吉尼亞州', en: 'Virginia' } },
      { code: 'WA', nameI18n: { 'zh-TW': '華盛頓州', en: 'Washington' } },
      { code: 'WV', nameI18n: { 'zh-TW': '西維吉尼亞州', en: 'West Virginia' } },
      { code: 'WI', nameI18n: { 'zh-TW': '威斯康辛州', en: 'Wisconsin' } },
      { code: 'WY', nameI18n: { 'zh-TW': '懷俄明州', en: 'Wyoming' } },
    ]
  },
  {
    code: 'KR',
    flag: '🇰🇷',
    nameI18n: { 'zh-TW': '韓國', en: 'South Korea', ja: '韓国', ko: '대한민국' },
    regulationLanguage: 'ko',
    availableLocales: ['ko', 'en', 'zh-TW'],
    regulationSources: [
      { name: '건축법', url: 'https://www.law.go.kr/lsInfoP.do?lsiSeq=206096', language: 'ko' },
    ],
    subRegions: [
      { code: 'Seoul', nameI18n: { 'zh-TW': '首爾特別市', en: 'Seoul', ko: '서울특별시' } },
      { code: 'Busan', nameI18n: { 'zh-TW': '釜山廣域市', en: 'Busan', ko: '부산광역시' } },
      { code: 'Daegu', nameI18n: { 'zh-TW': '大邱廣域市', en: 'Daegu', ko: '대구광역시' } },
      { code: 'Incheon', nameI18n: { 'zh-TW': '仁川廣域市', en: 'Incheon', ko: '인천광역시' } },
      { code: 'Gwangju', nameI18n: { 'zh-TW': '光州廣域市', en: 'Gwangju', ko: '광주광역시' } },
      { code: 'Daejeon', nameI18n: { 'zh-TW': '大田廣域市', en: 'Daejeon', ko: '대전광역시' } },
      { code: 'Ulsan', nameI18n: { 'zh-TW': '蔚山廣域市', en: 'Ulsan', ko: '울산광역시' } },
      { code: 'Sejong', nameI18n: { 'zh-TW': '世宗特別自治市', en: 'Sejong', ko: '세종특별자치시' } },
      { code: 'Gyeonggi', nameI18n: { 'zh-TW': '京畿道', en: 'Gyeonggi-do', ko: '경기도' } },
      { code: 'Gangwon', nameI18n: { 'zh-TW': '江原特別自治道', en: 'Gangwon-do', ko: '강원특별자치도' } },
      { code: 'Chungbuk', nameI18n: { 'zh-TW': '忠清北道', en: 'Chungcheongbuk-do', ko: '충청북도' } },
      { code: 'Chungnam', nameI18n: { 'zh-TW': '忠清南道', en: 'Chungcheongnam-do', ko: '충청남도' } },
      { code: 'Jeonbuk', nameI18n: { 'zh-TW': '全北特別自治道', en: 'Jeonbuk-do', ko: '전북특별자치도' } },
      { code: 'Jeonnam', nameI18n: { 'zh-TW': '全羅南道', en: 'Jeollanam-do', ko: '전라남도' } },
      { code: 'Gyeongbuk', nameI18n: { 'zh-TW': '慶尚北道', en: 'Gyeongsangbuk-do', ko: '경상북도' } },
      { code: 'Gyeongnam', nameI18n: { 'zh-TW': '慶尚南道', en: 'Gyeongsangnam-do', ko: '경상남도' } },
      { code: 'Jeju', nameI18n: { 'zh-TW': '濟州特別自治道', en: 'Jeju', ko: '제주특별자치도' } },
    ]
  },
];

export const REGION_MAP = Object.fromEntries(REGIONS.map((r) => [r.code, r]));

export const getRegionName = (code: string, locale: string): string => {
  const region = REGION_MAP[code];
  if (!region) return code;
  return region.nameI18n[locale] ?? region.nameI18n['en'] ?? code;
};

export const getSubRegionName = (regionCode: string, subRegionCode: string, locale: string): string => {
  const region = REGION_MAP[regionCode];
  if (!region || !subRegionCode || subRegionCode === 'ALL') return '';
  const subRegion = region.subRegions?.find((sr) => sr.code === subRegionCode);
  if (!subRegion) return subRegionCode;
  return subRegion.nameI18n[locale] ?? subRegion.nameI18n['en'] ?? subRegionCode;
};
