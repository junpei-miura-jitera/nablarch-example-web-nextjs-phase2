import { useEffect } from "react";

// Auto-generated candidate from: projectInput.js
// This file is intentionally conservative. Review TODO items before use.
export function useProjectInputLegacyBridge() {
  // TODO: Contains datepicker plugin call.
  // TODO: Contains .val() call (requires state mapping).

  useEffect(() => {
  
    var $clientId = document.querySelector('#client-id');
    var $clientName = document.querySelector('#client-name');
    
    document.querySelector('#topUpdateButton').addEventListener('click', function() {
      document.querySelector('#bottomUpdateButton').click();
    });
  
    document.querySelector('#topDeleteButton').addEventListener('click', function() {
      document.querySelector('#bottomDeleteButton').click();
    });
  
    document.querySelector('#topBackButton').addEventListener('click', function() {
      document.querySelector('#bottomBackButton').click();
    });
  
    document.querySelector('#topSubmitButton').addEventListener('click', function() {
      document.querySelector('#bottomSubmitButton').click();
    });
  
    document.querySelectorAll('.datepicker').datepicker();
  
  
    document.querySelector('#client-remove').addEventListener('click', function (event) {
      // href属性に#を指定しているaタグに、ページ遷移を行わなせないようpreventDefault()を呼び出している
      event.preventDefault();
      $clientId.val('');
      $clientName.val('');
    })
  }, []);
  
  
}
