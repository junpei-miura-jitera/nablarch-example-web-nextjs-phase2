import { useEffect } from "react";

// Auto-generated candidate from: sideMenu.js
// This file is intentionally conservative. Review TODO items before use.
export function useSideMenuLegacyBridge() {
  // TODO: Contains .val() call (requires state mapping).
  // TODO: Contains .attr() call (requires DOM API mapping).
  // TODO: Contains remaining jQuery selector/wrapper usage.

  useEffect(() => {
  
    // checkboxチェック
    var url = location.href;
    if (url.indexOf("?") == -1) {
      return;
    }
    var paramStr = url.split("?");
    var params = paramStr[1].split("&");
    var projectClass = [];
    for (var i = 0; i < params.length; i++ ) {
      var keyValue = params[i].split("=");
      if(keyValue[0] === "searchForm.projectClass") {
        projectClass.push(keyValue[1]);
      }
    }
    $("input[type='checkbox'][name='searchForm.projectClass']").val(projectClass);
  }, []);
  
  useEffect(() => {
  
    // 条件となる日付取得
    var thisYear = new Date().getFullYear();
    var thisYearStartDate = thisYear + "0101";
    var thisYearEndDate = thisYear + "1231";
    var lastYearEndDate = new Date(thisYear - 1 ,11 ,31).getFullYear() + "1231";
  
    // 今年開始
    document.querySelector('#startThisYear').each(function() {
      var obj = $(this);
      var link = obj.attr("href");
      obj.attr("href", link + "&searchForm.projectStartDateBegin=" + thisYearStartDate
                            + "&searchForm.projectStartDateEnd=" + thisYearEndDate);
    });
    // 今年終了
    document.querySelector('#endThisYear').each(function() {
      var obj = $(this);
      var link = obj.attr("href");
      obj.attr("href", link + "&searchForm.projectEndDateBegin=" + thisYearStartDate
                            + "&searchForm.projectEndDateEnd=" + thisYearEndDate);
    });
    // 昨年までに終了
    document.querySelector('#endLastYear').each(function() {
      var obj = $(this);
      var link = obj.attr("href");
      obj.attr("href", link + "&searchForm.projectEndDateEnd=" + lastYearEndDate);
    });
  }, []);
  
  //顧客検索画面ポップアップ
  useEffect(() => {
  
     document.querySelector('#client_pop').addEventListener('click', function() {
         window.open(this.href,"clientSearch","width=700,height=500,resizable=yes,scrollbars=yes");
         return false;
     });
  
     $("#clientId, #clientName").addEventListener('click', function() {
         document.querySelector('#client_pop').click();
     });
  }, []);
  
  useEffect(() => {
  
    // ランクチェックボックス
    document.querySelectorAll('.checkbox').addEventListener('change', function() {
        $(this).parents('form').submit();
    });
  }, []);
  
  function setClientParam(clientId, clientName) {
    $("[name='searchForm.clientId']").val(clientId);
    $("[name='searchForm.clientName']").val(clientName);
  }
}
