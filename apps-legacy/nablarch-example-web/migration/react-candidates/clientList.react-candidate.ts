import { useEffect } from "react";

// Auto-generated candidate from: clientList.js
// This file is intentionally conservative. Review TODO items before use.
export function useClientListLegacyBridge() {
  // TODO: Contains jQuery static API usage ($.*).
  // TODO: Contains Bootstrap/jQuery modal call.
  // TODO: Contains .val() call (requires state mapping).
  // TODO: Contains remaining jQuery selector/wrapper usage.

  useEffect(() => {
  
    var $clientSearchButton = document.querySelector('#client-search');
    var $modal = document.querySelector('#client-search-dialog');
    var $clientName = document.querySelector('#client-name');
    var $clientId = document.querySelector('#client-id');
    var $searchClientName = document.querySelector('#search-client-name');
    var $searchIndustryCode = document.querySelector('#search-industry-code');
    var $searchResult = document.querySelector('#search-result').find('tbody');
    var $messageAreaTemplate = document.querySelector('#message-area');
    
    var contextPath = (function () {
      var path = document.querySelector('#context-path').val();
      if (path) {
        return path;
      } else {
        return '';
      }
    })();
  
    /**
     * 選択したクライアント情報を設定する
     */
    function setClientInfo(event) {
      // href属性に#を指定しているaタグに、ページ遷移を行わなせないようpreventDefault()を呼び出している
      event.preventDefault();
      var $td = $(this).parent();
      $clientId.val($td.children('span.id').first().text());
      $clientName.val($td.children('span.name').first().text());
      $modal.modal('hide');
    }
  
    /**
     * ダイアログ表示時のイベント
     */
    $modal.on('shown.bs.modal', function (event) {
      $searchClientName.val('');
      $searchIndustryCode.val('');
      searchClientList(event);
    });
  
    /**
     * ダイアログを閉じるときのイベント
     */
    $modal.on('hidden.bs.modal', function () {
      $('div.alert-area').remove();
      $searchClientName.val('');
      $searchIndustryCode.val('');
      $searchResult.empty();
    });
    
    /**
     * 顧客検索を行う。
     */
    function searchClientList(event) {
      // href属性に#を指定しているaタグに、ページ遷移を行わなせないようpreventDefault()を呼び出している
      event.preventDefault()
      $('div.alert-area').remove();
      $searchResult.empty();
      $.ajax({
        url : contextPath + '/api/clients',
        data: {
          clientName  : $searchClientName.val(),
          industryCode: $searchIndustryCode.val()
        }
      }).done(function (data) {
        $.each(data, function (i, item) {
          $searchResult
              .append($('<tr>')
                  .append($('<td>').addClass("client-id").append(
                      $('<a>', {
                        href: '#',
                        text: item.clientId
                      }).addEventListener('click', setClientInfo))
                      .append($('<span>').text(item.clientId).addClass('id').hide())
                      .append($('<span>').text(item.clientName).addClass('name').hide()))
                  .append($('<td>').text(item.clientName))
                  .append($('<td>').text(item.industryName))
              )
          ;
        })
      }).fail(function (xhr, textStatus, errorThrown) {
        var $messageArea = $messageAreaTemplate.clone().addClass('alert-area');
        var $messageText = $messageArea.children('div:first');
        $messageAreaTemplate.after($messageArea);
  
        if (xhr.status == 400) {
          $messageArea.addClass('alert-warning');
          var $ul = $('<ul>');
          $.each(xhr.responseJSON, function (i, message) {
            $ul.append($('<li>', {
              text: message.message
            }));
          });
          $messageText.append($ul);
        } else {
          $messageArea.addClass('alert-danger');
          $messageText.append('検索処理に失敗しました。')
        }
        $messageArea.show();
      });
    }
  
    /**
     * 顧客の検索処理
     */
    $clientSearchButton.addEventListener('click', searchClientList);
    
    /**
     * 業種を取得する
     */
    function findIndustry() {
      $searchIndustryCode.empty();
      $searchIndustryCode.append('<option>', {
        value: ''
      });
      $.ajax({
        url   : contextPath + '/api/industries',
        method: 'get'
      }).done(function (data) {
        $.each(data, function (i, industry) {
          $searchIndustryCode.append(
              $('<option>', {
                value: industry.industryCode,
                text : industry.industryName
              })
          );
        });
      });
    }
    findIndustry();
  }, []);
  
  
}
