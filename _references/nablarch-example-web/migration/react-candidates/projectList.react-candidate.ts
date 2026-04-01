import { useEffect } from "react";

// Auto-generated candidate from: projectList.js
// This file is intentionally conservative. Review TODO items before use.
export function useProjectListLegacyBridge() {
  // TODO: Contains .val() call (requires state mapping).
  // TODO: Contains remaining jQuery selector/wrapper usage.

  useEffect(() => {
  
    //ページングタグにより自動生成される要素を削除している
    document.querySelectorAll('.true').remove();
  }, []);
  
  useEffect(() => {
  
    // ソート条件
    $("#sortKey,#sortDir").addEventListener('change', function() {
        $(this).parents('form').submit();
    });
  }, []);
  
  useEffect(() => {
  
    var $clientId = document.querySelector('#client-id');
    var $clientName = document.querySelector('#client-name');
    document.querySelector('#client-remove').addEventListener('click', function (event) {
      // href属性に#を指定しているaタグに、ページ遷移を行わなせないようpreventDefault()を呼び出している
      event.preventDefault();
      $clientId.val('');
      $clientName.val('');
    })
  }, []);
}
