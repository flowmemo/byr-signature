// ==UserScript==
// @name         byr-signature
// @namespace    https://github.com/flowmemo/byr-signature
// @version      0.1.3
// @description  为北邮人论坛发帖添加个性签名
// @author       flowmemo
// @match        https://bbs.byr.cn/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

// JavaScript Standard Style: https://github.com/feross/standard

;(function () {
  'use strict'
  console.log('hello')
  var defaultSig = '————\n' +
    '示例签名:\n' +
    '微博 [url=http://weibo.com/flowmemo][color=#0000FF]@flowmemo[/color][/url] , 现在主要写JavaScript. 关注广泛, 欢迎交流.\n' +
    '\n' +
    '[url=https://github.com/flowmemo/byr-signature][color=#0000FF]此签名通过「北邮人签名档」脚本发送[/color][/url]'
  var id // timeout id
  var div
  function addSignature () {
    var signature = GM_getValue('sig', defaultSig)
    div = document.getElementById('post_content')
    if (!div) return
    div.value += '\n' + signature
    return true
  }
  function polling () {
    window.clearTimeout(id) // clear timeout if it already exists
    if (window.location.href.indexOf('/post') === -1) return
    function cb () {
      if (addSignature()) {
        sigPanel()
        return
      }
      id = setTimeout(cb, 300)
    }
    cb()
  }
  function sigPanel () {
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
  if (window.location.href.indexOf('/post') > -1) polling()
  window.addEventListener('hashchange', polling)
})()
