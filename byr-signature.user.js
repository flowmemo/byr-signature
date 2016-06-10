// ==UserScript==
// @name         byr-signature
// @namespace    https://github.com/flowmemo/byr-signature
// @version      0.1.5
// @description  为北邮人论坛发帖添加个性签名
// @author       flowmemo
// @match        https://bbs.byr.cn/*
// @grant        GM_getValue
// @grant        GM_setValue
// @license      MIT
// ==/UserScript==

// JavaScript Standard Style: https://github.com/feross/standard

;(function () {
  'use strict'

  log('hello')

  var _DEBUG = 0
  function log () {
    if (_DEBUG === 1) console.log.apply(console, arguments)
  }

  var defaultSig = '————\n' +
        '示例签名:\n' +
        '微博 [url=http://weibo.com/flowmemo][color=#0000FF]@flowmemo[/color][/url] , 现在主要写JavaScript. 关注广泛, 欢迎交流.\n' +
        '\n' +
        '[url=https://github.com/flowmemo/byr-signature][color=#0000FF]此签名通过「北邮人签名档」脚本发送[/color][/url]'
  var id // timeout id

  function addPostSig () {
    log('addPostSig')
    var signature = GM_getValue('sig', defaultSig)
    var div = document.getElementById('post_content')
    if (!div) return
    div.value += '\n' + signature
    return true
  }

  function addQuickSig () {
    log('addQuickSig')

    var signature = GM_getValue('sig', defaultSig)
    var page = document.querySelector('.page-select a')
    if (!page) return
    var curPage = page.text
    if (!window.location.href.match(/\?p=(\d+)/)) {
      if (curPage !== '1') return
    } else {
      var hrefPage = window.location.href.match(/\?p=(\d+)/)[1]
      if (hrefPage !== curPage) return
    }

    var div = document.getElementsByName('content')[0]
    if (!div) return
    div.value += '\n' + signature
    log('add value')
    return true
  }

  function addSigPanel () {
    log('sigPanel')

    var div = document.createElement('div')
    var postItems = document.getElementsByClassName('post-list-item')
    var referNode = postItems[postItems.length - 2]
    referNode.appendChild(div)

    div.outerHTML = '<br><br><div>' +
            '<div class="post-m">byr-signature自定义签名</div>' +
            '<div class="byr-signature" style="border:1px solid #c9d7f1;padding:5px;width:680px">' +
            '<textarea class="post-textarea" name="sig-content" placeholder="在此输入你的签名"></textarea><br>' +
            '</div><p><input name="saveSig" type="button" value="保存"> 保存后刷新页面生效（注意保存你的发帖内容）</p></div>'

    var userSig = document.getElementsByName('sig-content')[0]
    userSig.value = GM_getValue('sig', defaultSig)
    var saveButton = document.getElementsByName('saveSig')[0]
    saveButton.addEventListener('click', function () {
      GM_setValue('sig', (userSig.value))
    })
  }

  function polling () {
    log('polling')

    if (window.location.href.indexOf('#!article') === -1) return
    window.clearTimeout(id) // clear timeout if it already exists

    ;(function cb () {
      if (window.location.href.indexOf('/post') > -1) {
        if (addPostSig()) {
          addSigPanel()
          return
        }
      } else if (addQuickSig()) return
      id = setTimeout(cb, 300)
    })()
  }

  if (window.location.href.indexOf('#!article') > -1) polling()
  window.addEventListener('hashchange', polling)
})()
