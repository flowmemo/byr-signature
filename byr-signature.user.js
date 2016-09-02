/* eslint-env greasemonkey */
// ==UserScript==
// @name         byr-signature
// @namespace    weibo.com/flowmemo
// @version      0.1.8
// @description  为北邮人论坛发帖添加个性签名
// @author       flowmemo
// @match        https://bbs.byr.cn/*
// @grant        GM_getValue
// @grant        GM_setValue
// @license      MIT
// @supportURL   https://github.com/flowmemo/byr-signature
// ==/UserScript==

; (function () {
  'use strict'
  const _DEBUG = 0
  function log () {
    if (_DEBUG === 1) console.log.apply(console, arguments)
  }

  log('hello')

  const defaultSig =
    `————
     示例签名: 微博 [url=http://weibo.com/flowmemo][color=#0000FF]@flowmemo[/color][/url] , 现在主要写JavaScript. 关注广泛, 欢迎交流.
     修改签名请到[url=https://bbs.byr.cn/#!article/WWWTechnology/post][color=#0000FF]这里[/color][/url]
     [url=https://github.com/flowmemo/byr-signature][color=#0000FF]此签名通过「北邮人签名档」脚本发送[/color][/url]`
  let id // timeout id

  function getSig () {
    // get username
    let user = document.querySelector('.u-login-id a')
    if (!user) return
    user = user.title

    // get sig
    const signature = GM_getValue('sig-' + user, defaultSig)
    return signature
  }

  function addPostSig () {
    log('addPostSig')
    const div = document.getElementById('post_content')
    if (!div) return
    div.value += '\n' + getSig()
    return true
  }

  function addQuickSig () {
    log('addQuickSig')

    // check whether page is loaded by comparing URL with real displayed page
    const page = document.querySelector('.page-select a')
    if (!page) return
    const curPage = page.text
    if (!window.location.href.match(/\?p=(\d+)/)) {
      if (curPage !== '1') return
    } else {
      const hrefPage = window.location.href.match(/\?p=(\d+)/)[1]
      if (hrefPage !== curPage) return
    }

    const div = document.getElementsByName('content')[0]
    if (!div) return

    div.value += '\n' + getSig()
    log('add value')
    return true
  }

  function addSigPanel () {
    log('sigPanel')

    const div = document.createElement('div')
    const postItems = document.getElementsByClassName('post-list-item')
    const referNode = postItems[postItems.length - 2]
    referNode.appendChild(div)

    div.outerHTML =
      `<br><br><div>
       <div class="post-m">byr-signature自定义签名</div>
       <div class="byr-signature" style="border:1px solid #c9d7f1;padding:5px;width:680px">
       <textarea class="post-textarea" name="sig-content" placeholder="在此输入你的签名"></textarea><br>
       </div><p><input name="saveSig" type="button" value="保存"> 保存后刷新页面生效（注意保存你的发帖内容） </p></div>`

    const userSig = document.getElementsByName('sig-content')[0]

    userSig.value = getSig()
    const saveButton = document.getElementsByName('saveSig')[0]

    // get username
    let user = document.querySelector('.u-login-id a')
    if (!user) return
    user = user.title
    saveButton.addEventListener('click', function () {
      GM_setValue('sig-' + user, userSig.value)
    })
  }

  function polling () {
    log('polling')

    if (window.location.href.indexOf('#!article') === -1) return
    window.clearTimeout(id) // clear timeout if it already exists

      ; (function cb () {
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
