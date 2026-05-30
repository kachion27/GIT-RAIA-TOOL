/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT - GITHUB OAUTH TOKEN EXCHANGE PROXY
 * ==============================================================================
 * 
 * Script này có 2 chức năng:
 * 1. Proxy exchange OAuth code → access token (cho đăng nhập GitHub)
 * 2. Nhận và lưu link repo vào Google Sheets (chức năng cũ)
 * 
 * HƯỚNG DẪN CÀI ĐẶT:
 * 1. Vào Google Apps Script: https://script.google.com/
 * 2. Tạo project mới hoặc mở project cũ.
 * 3. Xóa nội dung cũ và dán toàn bộ đoạn mã này vào.
 * 4. Bấm Lưu (Save).
 * 5. Bấm Triển khai (Deploy) -> Tùy chọn triển khai mới (New deployment).
 * 6. Chọn loại: Ứng dụng Web (Web app).
 * 7. Cấu hình:
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me).
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone).
 * 8. Bấm Triển khai (Deploy) và Cấp quyền truy cập nếu được hỏi.
 * 9. Copy URL Web app và dán vào biến APPS_SCRIPT_URL trong file script.js
 */

// ============ CẤU HÌNH GITHUB OAUTH ============
const GITHUB_CLIENT_ID = 'Ov23lixGrKca2GHnclHj';
const GITHUB_CLIENT_SECRET = 'c6374f1f28fa93e005d20657173599a4db6c9f02';

// ============ XỬ LÝ REQUEST ============

function doGet(e) {
  var action = e.parameter.action || 'webhook';
  
  // CORS headers cho response
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  
  // === ACTION: OAuth Token Exchange ===
  if (action === 'oauth') {
    var code = e.parameter.code;
    
    if (!code) {
      return ContentService.createTextOutput(JSON.stringify({
        "status": "error",
        "message": "Thiếu tham số 'code'"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    try {
      // Exchange code for access token
      var tokenResponse = UrlFetchApp.fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        contentType: 'application/json',
        headers: {
          'Accept': 'application/json'
        },
        payload: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code: code
        })
      });
      
      var tokenData = JSON.parse(tokenResponse.getContentText());
      
      if (tokenData.access_token) {
        return ContentService.createTextOutput(JSON.stringify({
          "status": "success",
          "access_token": tokenData.access_token,
          "token_type": tokenData.token_type,
          "scope": tokenData.scope
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({
          "status": "error",
          "message": tokenData.error_description || tokenData.error || "Không lấy được access token"
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({
        "status": "error",
        "message": "Lỗi server: " + error.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // === ACTION: Bulk Upload Repo Links to Sheets ===
  if (action === 'bulk_upload') {
    try {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      var data;
      // Handle both GET (JSON string in parameter) and POST (postData)
      if (e.postData && e.postData.contents) {
        data = JSON.parse(e.postData.contents);
      } else if (e.parameter.data) {
        data = JSON.parse(e.parameter.data);
      } else {
        throw new Error("No data provided");
      }
      
      var rows = data.map(function(item) {
        return [item.suffix, item.url];
      });
      
      if (rows.length > 0) {
        var lastRow = sheet.getLastRow();
        sheet.getRange(lastRow + 1, 1, rows.length, 2).setValues(rows);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        "status": "success",
        "message": "Đã lưu " + rows.length + " links vào Sheets"
      })).setMimeType(ContentService.MimeType.JSON);
      
    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({
        "status": "error",
        "message": error.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  // === ACTION: Webhook - Lưu repo link vào Sheets (chức năng cũ) ===
  var repoName = e.parameter.repo_name || "Unknown Repo";
  var repoUrl = e.parameter.repo_url || "";
  
  if (repoUrl !== "") {
    try {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Thời gian", "Tên Repository", "Link Repository"]);
        sheet.getRange("A1:C1").setFontWeight("bold");
      }
      
      var timestamp = new Date();
      sheet.appendRow([timestamp, repoName, repoUrl]);
      
      return ContentService.createTextOutput(JSON.stringify({
        "status": "success",
        "message": "Đã lưu vào Sheets"
      })).setMimeType(ContentService.MimeType.JSON);
      
    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({
        "status": "error",
        "message": error.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": "Thiếu tham số repo_url hoặc action"
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Hỗ trợ POST
function doPost(e) {
  return doGet(e);
}

