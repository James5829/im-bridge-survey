const SURVEY_SPREADSHEET_ID = '1yyW3rq428eQQtd-fhcZ4ewwBnWMMicJe9Zp05SVWLvk';
const SURVEY_SHEET_NAME = '공동금융_응답_v3';

const SURVEY_COLUMNS = [
  ['timestamp', '응답 시각'],
  ['schema_version', '스키마 버전'],
  ['shared_finance_relationships', 'S1-1 공동 금융 관계'],
  ['shared_finance_relationships_other', 'S1-1 기타 관계'],
  ['shared_money_method', 'S1-2 공동 돈 관리 방법'],
  ['shared_money_method_other', 'S1-2 기타 방법'],
  ['shared_money_method_reason', 'S1-3 해당 방법을 쓰는 이유'],
  ['shared_money_method_reason_other', 'S1-3 기타 이유'],
  ['bundle_desire_frequency', 'S2-1 금융 혜택·일정 결합 수요'],
  ['desired_bundle_features', 'S2-2 필요한 결합 기능 (최대 2개)'],
  ['desired_bundle_features_other', 'S2-2 기타 기능'],
  ['family_bundle_pain_points', 'S2-3 가족 결합 서비스 불편'],
  ['family_bundle_pain_points_other', 'S2-3 기타 불편'],
  ['group_account_pain_point', 'S2-4 모임통장 아쉬움'],
  ['group_account_pain_point_other', 'S2-4 기타 아쉬움'],
  ['cost_management_stress', 'S2-5 비용 관리 스트레스'],
  ['cost_management_stress_other', 'S2-5 기타 스트레스'],
  ['shared_money_feeling', 'S3-1 함께 돈을 모을 때의 느낌'],
  ['shared_money_feeling_other', 'S3-1 기타 느낌'],
  ['emotional_gaps', 'S3-2 기존 서비스의 정서적 아쉬움'],
  ['emotional_gaps_other', 'S3-2 기타 정서적 아쉬움'],
  ['community_finance_intent', 'S3-3 커뮤니티형 금융 서비스 이용 의향'],
  ['age', 'S4-1 나이'],
  ['gender', 'S4-2 성별'],
  ['gender_other', 'S4-2 기타 성별']
];

function doGet() {
  return jsonResponse_({ ok: true, schemaVersion: 3 });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  let locked = false;
  try {
    lock.waitLock(10000);
    locked = true;
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    validatePayload_(data);

    const sheet = getSurveySheet_();
    const row = SURVEY_COLUMNS.map(function(column) {
      return safeCellValue_(data[column[0]]);
    });
    sheet.appendRow(row);

    return jsonResponse_({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, error: String(error.message || error) });
  } finally {
    if (locked) lock.releaseLock();
  }
}

function setupSurveySheet() {
  const sheet = getSurveySheet_();
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, SURVEY_COLUMNS.length);
}

function getSurveySheet_() {
  const spreadsheet = SpreadsheetApp.openById(SURVEY_SPREADSHEET_ID);

  let sheet = spreadsheet.getSheetByName(SURVEY_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SURVEY_SHEET_NAME);

  const expectedHeaders = SURVEY_COLUMNS.map(function(column) { return column[1]; });
  const currentHeaders = sheet.getLastColumn()
    ? sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), expectedHeaders.length)).getValues()[0]
    : [];
  const hasResponses = sheet.getLastRow() > 1;
  const headersMatch = expectedHeaders.every(function(header, index) {
    return currentHeaders[index] === header;
  });

  if (!headersMatch && hasResponses) {
    throw new Error('시트 헤더가 v3 설문 구조와 다릅니다. 기존 응답을 보존한 뒤 새 시트를 사용해 주세요.');
  }
  if (!headersMatch) {
    sheet.clear();
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
    sheet.getRange(1, 1, 1, expectedHeaders.length)
      .setFontWeight('bold')
      .setBackground('#DEF6EF')
      .setFontColor('#0B6E5B');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function validatePayload_(data) {
  if (Number(data.schema_version) !== 3) throw new Error('지원하지 않는 설문 스키마입니다.');
  const required = SURVEY_COLUMNS
    .map(function(column) { return column[0]; })
    .filter(function(key) { return key !== 'timestamp' && key !== 'schema_version' && !key.endsWith('_other'); });
  const missing = required.filter(function(key) {
    return data[key] === undefined || String(data[key]).trim() === '';
  });
  if (missing.length) throw new Error('필수 응답 누락: ' + missing.join(', '));

  const selectedFeatures = Array.isArray(data.desired_bundle_features)
    ? data.desired_bundle_features
    : [data.desired_bundle_features].filter(Boolean);
  if (selectedFeatures.length > 2) throw new Error('필요한 결합 기능은 최대 2개까지 선택할 수 있습니다.');
}

function safeCellValue_(value) {
  if (value === undefined || value === null) return '';
  const text = Array.isArray(value) ? value.join(', ') : String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
