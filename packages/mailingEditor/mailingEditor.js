"use strict";
(function($) {
  /**
   * ============================
   * Private static constants
   * ============================
   */
  const NME_CONTAINER = "nme-container",
        NME_MAIN = "nme-main",
        INNER_CLASS = "inner",
        INIT_CLASS = "is-initialized",
        EDIT_CLASS = "is-edit",
        ACTIVE_CLASS = "is-active",
        OVERLAY_CLASS = "is-overlay";

  /**
   * ============================
   * Private variables
   * ============================
   */

  /**
   * Global
   */
  var nmEditor = function() {},
    _resizeTimer,
    _protocol = window.location.protocol,
    _path = window.location.pathname.substring(1),
    _pathArr = _path.split("/"),
    _hash = window.location.hash.substring(1),
    _query = window.location.search.substring(1),
    _qs,
    _viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    },
    _debugMode = false,
    _data = {},
    _dataLoadMode = "field",
    _dataLoadSource = "",
    _defaultData = {},
    _nme = {}, // plugin object
    _nmeOptions = {},
    _nmeAPI = window.location.origin + "/api/",
    _container,
    _main = "." + NME_MAIN,
    _controlIconClass = {
      drag: "zmdi-arrows",
      prev: "zmdi-long-arrow-up",
      next: "zmdi-long-arrow-down",
      clone: "zmdi-collection-plus",
      delete: "zmdi-delete",
      link: "zmdi-link",
      image: "zmdi-image",
      style: "zmdi-invert-colors"
    },
    _editActions = {
      default: ["clone", "delete"],
      extended: {
        image: ["link", "image"],
        title: ["link"],
        button: ["link", "style"],
        header: ["link", "image"]
      }
    },
    _ts = {},
    _sortables = {},
    _pickrs = {},
    _tpl = {},
    _themes = [
      {
        "styles": {
          "page" : {
            "background-color": "#16235a"
          },
          "block": {
            "color": "#333333",
            "background-color": "#f2eaed"
          },
          "title": {
            "color": "#333333"
          },
          "subTitle": {
            "color": "#333333"
          },
          "button": {
            "color": "#ffffff",
            "background-color": "#343434",
            "background-color-hover": "#333333"
          },
          "link": {
            "color": "#898c46",
            "color-hover": "#a0a352"
          }
        }
      },
      {
        "styles": {
          "page" : {
            "background-color": "#000000"
          },
          "block": {
            "color": "#333333",
            "background-color": "#ffffff"
          },
          "title": {
            "color": "#333333"
          },
          "subTitle": {
            "color": "#333333"
          },
          "button": {
            "color": "#ffffff",
            "background-color": "#222222",
            "background-color-hover": "#333333"
          },
          "link": {
            "color": "#222222",
            "color-hover": "#333333"
          }
        }
      },
      {
        "styles": {
          "page" : {
            "background-color": "#f091a6"
          },
          "block": {
            "color": "#333333",
            "background-color": "#afbadc"
          },
          "title": {
            "color": "#333333"
          },
          "subTitle": {
            "color": "#333333"
          },
          "button": {
            "color": "#ffffff",
            "background-color": "#222222",
            "background-color-hover": "#333333"
          },
          "link": {
            "color": "#bb1924",
            "color-hover": "#d61c28"
          }
        }
      },
      {
        "styles": {
          "page" : {
            "background-color": "#81a3a7"
          },
          "block": {
            "color": "#333333",
            "background-color": "#f1f3f2"
          },
          "title": {
            "color": "#333333"
          },
          "subTitle": {
            "color": "#333333"
          },
          "button": {
            "color": "#ffffff",
            "background-color": "#222222",
            "background-color-hover": "#333333"
          },
          "link": {
            "color": "#272424",
            "color-hover": "#333333"
          }
        }
      },
      {
        "styles": {
          "page" : {
            "background-color": "#4CAF50"
          },
          "block": {
            "color": "#333333",
            "background-color": "#ffffff"
          },
          "title": {
            "color": "#333333"
          },
          "subTitle": {
            "color": "#333333"
          },
          "button": {
            "color": "#ffffff",
            "background-color": "#1B5E20",
            "background-color-hover": "#2E7D32"
          },
          "link": {
            "color": "#2E7D32",
            "color-hover": "#388E3C"
          }
        }
      },
      {
        "styles": {
          "page" : {
            "background-color": "#583e2e"
          },
          "block": {
            "color": "#333333",
            "background-color": "#ffffff"
          },
          "title": {
            "color": "#333333"
          },
          "subTitle": {
            "color": "#333333"
          },
          "button": {
            "color": "#ffffff",
            "background-color": "#222222",
            "background-color-hover": "#333333"
          },
          "link": {
            "color": "#583e2e",
            "color-hover": "#704f3a"
          }
        }
      }
    ];

  /**
   * ============================
   * Private functions
   * ============================
   */

  /**
   * General
   */

  var _getRandomInt = function (min, max) {
    if (typeof min !== "undefined" && typeof max !== "undefined") {
      min = Math.ceil(min);
      max = Math.floor(max);

      // The maximum is exclusive and the minimum is inclusive
      return Math.floor(Math.random() * (max - min)) + min;
    }
  }

  var _swapArrayVal = function(arr, a, b) {
    if (typeof arr !== "undefined") {
      var a_index = arr.indexOf(a);
      var b_index = arr.indexOf(b);
      var temp = arr[a_index];
      arr[a_index] = arr[b_index];
      arr[b_index] = temp;
      return arr;
    }
  }

  var _isJsonString = function(str) {
    try {
      var json = JSON.parse(str);
      return (typeof json === "object");
    } catch (e) {
      _debug("===== Source data is not json. =====");
      return false;
    }
  }

  var _objClone = function(obj) {
    if (typeof obj === "object") {
      return JSON.parse(JSON.stringify(obj));
    }
  }

  var _objIsEmpty = function(obj) {
    if (typeof obj !== "undefined" && typeof obj === "object") {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          return false;
        }
      }
      return true;
    }
    else {
      return false;
    }
  }

  var _parseQueryString = function(query) {
    var vars = query.split("&");
    var queryString = {};
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      var key = decodeURIComponent(pair[0]);
      var value = decodeURIComponent(pair[1]);
      // If first entry with this name
      if (typeof queryString[key] === "undefined") {
        queryString[key] = decodeURIComponent(value);
      }
      // If second entry with this name
      else if (typeof queryString[key] === "string") {
        var arr = [queryString[key], decodeURIComponent(value)];
        queryString[key] = arr;
      }
      // If third or later entry with this name
      else {
        queryString[key].push(decodeURIComponent(value));
      }
    }
    return queryString;
  }

  var _htmlUnescape = function(input) {
    let doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
  };

  var _htmlEscape = function(input) {
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  var _domElemExist = function($elem) {
    var $elem = typeof $elem !== "undefined" ? $elem : "";

    if ($elem) {
      if (typeof $elem === "object" && $elem.length) {
        return true;
      }

      if (typeof $elem === "string") {
        $elem = document.getElementById($elem);

        if ($elem) {
          if (typeof $elem === "object" && $elem.length) {
            return true;
          }
          else {
            return false;
          }
        }
        else {
          return false;
        }
      }
    }
    else {
      return false;
    }
  };

  var _getViewport = function() {
    _viewport = {
      width  : window.innerWidth,
      height : window.innerHeight,
    };
    _debug(_viewport, "viewport");
  };

  var _relativeToAbsoluteURL = function(url) {
    var url = typeof url !== "undefined" ? url : "";

    if (url) {
      var absoluteURL = window.location.origin + url;
      return absoluteURL;
    }
  };

  var _updateUrlHash = function(hash) {
    var hash = typeof hash !== "undefined" ? "#" + hash : "";

    if (hash) {
      if (history.pushState) {
        history.pushState(null, null, hash);
      }
      else {
        location.hash = hash;
      }
    }
  }

  var _renderID = function(str, len) {
    var str = typeof str !== "undefined" ? str : "";
    var len = typeof len !== "undefined" ? len : 10;
    var allow = "abcdefghijklmnopqrstuvwxyz0123456789";
    // var allow = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var output = "";

    if (str) {
      output = str + "-";
    }

    for (var i = 0; i < len; i++) {
      output += allow.charAt(Math.floor(Math.random() * allow.length));
    }

    if (output) {
      return output;
    }
  }

  var _onScreenCenterElem = function(elem) {
    let $elem = $(elem),
        elemsYaxisRange = {};

    if ($elem.length) {
      let docViewTop = $(window).scrollTop(),
          docViewBottom = docViewTop + $(window).outerHeight();

      $elem.each(function(e) {
        let	$this = $(this),
            elemID = $this.attr("id"),
            elemTop = typeof buffer !== "undefined" ? $this.offset().top : $this.offset().top,
            elemBottom = elemTop + $this.outerHeight(),
            elemYaxisRange = [elemTop, elemBottom];

        elemsYaxisRange[elemID] = elemYaxisRange;
      });

      _debug(elemsYaxisRange, "onScreenCenterElem");

      $(window).scroll(function() {
        let scrollTop = $(window).scrollTop();
        $elem.removeClass("on-screen-center");

        for (let blockID in elemsYaxisRange) {
          let yMin = elemsYaxisRange[blockID][0],
              yMax = elemsYaxisRange[blockID][1];

          if (scrollTop >= yMin && scrollTop <= yMax) {
            _debug(blockID);
            $("#" + blockID).addClass("on-screen-center");
          }
        }
      });
    }
  }

  var _getDefaultImage = function(type) {
    var type = typeof type !== "undefined" ? type : "",
        img = {};

    if (type) {
      switch(type) {
        case "logo":
          img.url = _relativeToAbsoluteURL("/sites/all/modules/civicrm/packages/mailingEditor/images/mail-default-logo@2x.png");
          img.width = 192;
          img.height = 84;
          break;

        case "thumb":
          img.url = "/sites/all/modules/civicrm/packages/istockphoto/thumb_" + _getRandomInt(1,5) + ".jpg";
          img.url = _relativeToAbsoluteURL(img.url);
          img.width = 680;
          img.height = 383;
          break;

          case "square":
          img.url = "/sites/all/modules/civicrm/packages/istockphoto/square_" + _getRandomInt(1,5) + ".jpg";
          img.url = _relativeToAbsoluteURL(img.url);
          img.width = 210;
          img.height = 210;
          break;
      }

      return img;
    }
  }

  /**
   * Main
   */
  var _nmeData = {
    get: {
      field: function(selector) {
        let $field = $(selector);

        if ($field.length) {
          let dataString = $field.val();

          if (_isJsonString(dataString)) {
            _data = JSON.parse(dataString);
            _debug(_data, "Source data");
          }
        }
      }
    },
    update: function() {
      _debug(_data);
      let data = JSON.stringify(_data, undefined, 4);
      $(_dataLoadSource).val(data);
      $.nmEditor.instance.data = _data;
    },
    sort: function(order, section) {
      if (_data["sections"][section]) {
        var tempSectionBlocksData = _data["sections"][section]["blocks"];
        _data["sections"][section]["blocks"] = {};

        for (let i = 0; i < order.length; i++) {
          let blockID = order[i];
          _data["sections"][section]["blocks"][blockID] = {};
          tempSectionBlocksData[blockID]["weight"] = i;
          _data["sections"][section]["blocks"][blockID] = tempSectionBlocksData[blockID];
        }
      }

      _nmeData.update();

    }
  };

  var _nmeSetStyles = function($container, stylesData, target) {
    let setTarget = typeof target !== "undefined" ? target : "children";

    if (_domElemExist($container) && Object.getOwnPropertyNames(stylesData).length > 0) {
      for (let styleTarget in stylesData) {
        let $styleTarget = setTarget == "self" ? $container : $container.find("[data-settings-target='" + styleTarget + "']");

        for (let styleProperty in stylesData[styleTarget]) {
          let styleValue = stylesData[styleTarget][styleProperty];
          $styleTarget.css(styleProperty, styleValue);

          // If style property is 'background-color', also need to set value to 'bgcolor' dom attribute, because some versions of the email application do not support 'background-color'
          if (styleProperty == "background-color") {
            $styleTarget.attr("bgcolor", styleValue);
          }
        }

        // If target is 'self', only get one row data.
        if (setTarget == "self") {
          break;
        }
      }
    }
  };

  var _nmeBlock = {
    add: function(data, mode, $target, method) {
      let block = !_objIsEmpty(data) ? data : null,
          addMethod = typeof method !== "undefined" ? method : "append";

      if (block && block.type) {
        let output = "",
            blockMode = typeof mode !== "undefined" ? mode : "view",
            blockType = block.type,
            blockSection = block.section,
            blockID = block.id,
            disallowSortType = ["header", "footer"];

        if (blockMode == "view") {
          if (_domElemExist($target)) {
            let	output = "",
                blockContent = _tpl.block[blockType];

            blockContent = blockContent.replace(/\[nmeBlockID\]/g, blockID);
            blockContent = blockContent.replace(/\[nmeBlockType\]/g, blockType);

            if (block.parentID && block.parentType) {
              if (block.parentType == "rc-col-2" || block.parentType == "rc-float") {
                blockContent = blockContent.replace("<td valign=\"top\" width=\"600\" style=\"width:600px;\">", "<td valign=\"top\" width=\"100%\" style=\"width:100%;\">");
              }
            }

            $target.append(blockContent);

            let $nmeb = $target.find(".nmeb[data-id='" + blockID + "']"),
                $nmebInner = $nmeb.find(".nmeb-inner"),
                $nmebContentContainer = $nmeb.find(".nmeb-content-container"),
                $nmebContent = $nmeb.find(".nmeb-content"),
                $nmebElem = $nmeb.find(".nme-elem");

            if ($nmeb.length) {
              // Set styles
              _nmeSetStyles($nmeb, block.styles);

              if ($nmebElem.length) {
                let decodeContent = "";
                $nmebElem.attr({
                  "data-id": blockID,
                  "data-section": blockSection
                });

                switch (blockType) {
                  case "title":
                    $nmebElem.html(block.data);
                    break;

                  case "paragraph":
                    decodeContent = _htmlUnescape(block.data.html);
                    $nmebElem.html(decodeContent);
                    break;

                  case "button":
                    $nmebElem.html(block.data);
                    break;

                  case "image":
                    $nmebElem.attr({
                      "src": block.data.url,
                      "width": block.data.width,
                    });

                    if (block.parentType == "rc-col-2") {
                      $nmebElem.attr("width", "300");
                    }

                    if (block.parentType == "rc-float") {
                      $nmebElem.attr("width", "210");
                    }
                    break;

                    case "header":
                      $nmebElem.attr({
                        "src": block.data.url,
                        "width": block.data.width,
                      });
                      break;

                    case "footer":
                      decodeContent = _htmlUnescape(block.data.html);
                      $nmebElem.html(decodeContent);
                      break;

                  case "rc-col-1":
                    var $nestTarget = $nmebElem.find("td.col-1");
                    $nestTarget.html("");

                    for (var nestBlockID in block.data[0]["blocks"]) {
                      var nestBlockData = block.data[0]["blocks"][nestBlockID];

                      if (!_objIsEmpty(nestBlockData)) {
                        _nmeBlock.add(nestBlockData, "view", $nestTarget, "append");
                      }
                    }
                    break;

                    case "rc-col-2":
                      for (var dataIndex = 0; dataIndex < 2; dataIndex++) {
                        var col = dataIndex + 1;
                        $nestTarget = $nmebElem.find("td.col-" + col);
                        $nestTarget.html("");

                        for (var nestBlockID in block.data[dataIndex]["blocks"]) {
                          var nestBlockData = block.data[dataIndex]["blocks"][nestBlockID];

                          if (!_objIsEmpty(nestBlockData)) {
                            _nmeBlock.add(nestBlockData, "view", $nestTarget, "append");
                          }
                        }
                      }
                      break;

                  case "rc-float":
                    for (var nestBlockID in block.data[0]["blocks"]) {
                      var nestBlockData = block.data[0]["blocks"][nestBlockID],
                          nestBlockType = nestBlockData.type,
                          $nestTarget = nestBlockType == "image" ? $nmebElem.find("td.img-col") : $nmebElem.find("td.text-col");

                      $nestTarget.html("");

                      if (!_objIsEmpty(nestBlockData)) {
                        _nmeBlock.add(nestBlockData, "view", $nestTarget, "append");
                      }
                    }
                    break;

                  default:
                    $nmebElem.html(block.data);
                    break;
                }

                // ＴODO: Link may need to be verified
                if (block.link) {
                  $nmebElem.wrap("<a href='" + block.link + "'></a>");
                }
              }
            }
          }
        }

        // If the mode is 'edit', render nmeBlock control buttons.
        if (blockMode == "edit") {
          if (_domElemExist($target)) {
            let blockContent = _tpl.block[blockType],
                blockEditContent = _tpl.block.edit,
                blockSortable = "true",
                blockOverride = typeof block.override !== "undefined" && typeof block.override.block !== "undefined" ? block.override.block : false,
                elemOverride = typeof block.override !== "undefined" && typeof block.override.elem !== "undefined" ? block.override.elem : false;

            if (disallowSortType.includes(blockType)) {
              blockSortable = "false";
            }

            if (block.parentID && block.parentType) {
              if (block.parentType == "rc-col-2" || block.parentType == "rc-float") {
                blockContent = blockContent.replace("<td valign=\"top\" width=\"600\" style=\"width:600px;\">", "<td valign=\"top\" width=\"100%\" style=\"width:100%;\">");
              }
            }

            blockEditContent = blockEditContent.replace(/\[nmeBlockContent\]/g, blockContent);
            blockEditContent = blockEditContent.replace(/\[nmeBlockID\]/g, blockID);
            blockEditContent = blockEditContent.replace(/\[nmeBlockType\]/g, blockType);
            blockEditContent = blockEditContent.replace(/\[nmeBlockSection\]/g, blockSection);
            blockEditContent = blockEditContent.replace(/\[nmeBlockSortable\]/g, blockSortable);
            blockEditContent = blockEditContent.replace(/\[nmeBlockOverride\]/g, blockOverride);
            blockEditContent = blockEditContent.replace(/\[nmeElemOverride\]/g, elemOverride);

            output = blockEditContent;

            switch (addMethod) {
              case "append":
                $target.append(output);
                break;

              case "before":
                $target.before(output);
                break;

              case "after":
                $target.after(output);
                break;
            }

            let $block = $(".nme-block[data-id='" + blockID + "']"),
                $nmeb = $block.find(".nmeb"),
                $nmebInner = $nmeb.find(".nmeb-inner"),
                $nmebContentContainer = $nmeb.find(".nmeb-content-container"),
                $nmebContent = $nmeb.find(".nmeb-content"),
                $nmebElem = $nmeb.find(".nme-elem");

            if ($nmeb.length) {
              $nmeb.attr("data-id", blockID);

              // Set styles
              _nmeSetStyles($nmeb, block.styles);

              if ($nmebElem.length) {
                let decodeContent = "";
                $nmebElem.attr({
                  "data-id": blockID,
                  "data-section": blockSection
                });

                if (block.parentID) {
                  $block.attr("data-parent-id", block.parentID);
                  $nmebElem.attr("data-parent-id", block.parentID);
                }

                if (block.parentType) {
                  $block.attr("data-parent-type", block.parentType);
                  $nmebElem.attr("data-parent-type", block.parentType);
                }
                if (block.index || block.index == 0) {
                  $block.attr("data-index", block.index);
                  $nmebElem.attr("data-index", block.index);
                }

                switch (blockType) {
                  case "title":
                    $nmebElem.addClass("nme-editable");
                    $nmebElem.attr({
                      "data-type": "text"
                    });
                    $nmebElem.html(block.data);
                    break;

                  case "paragraph":
                    $nmebElem.addClass("nme-editable");
                    $nmebElem.attr({
                      "data-type": "xquill",
                      "data-placeholder": "請輸入段落文字...",
                      "data-title": "Enter comments"
                    });
                    decodeContent = _htmlUnescape(block.data.html);
                    $nmebElem.html(decodeContent);
                    break;

                  case "button":
                    $nmebElem.html(block.data);
                    $nmebElem.replaceWith(function(){
                      return this.outerHTML.replace("<a", "<div").replace("</a", "</div");
                    });
                    $nmebElem = $nmeb.find(".nme-elem");
                    $nmebElem.addClass("nme-editable");
                    $nmebElem.attr({
                      "data-type": "text"
                    });
                    break;

                  case "image":
                    if (!block.data.url && block.data.isDefault) {
                      var defaultImg = block.parentType && (block.parentType == "rc-col-2" || block.parentType == "rc-float") ? _getDefaultImage("square") : _getDefaultImage("thumb");
                      block.data.url = defaultImg.url;
                      block.data.width = defaultImg.width;
                      block.data.height = defaultImg.height;

                      if (block.parentID) {
                        if (block.parentType == "rc-col-2") {
                          _data["sections"][blockSection]["blocks"][block.parentID]["data"][block.index]["blocks"][blockID]["data"] = _objClone(block.data);
                        }
                        else {
                          _data["sections"][blockSection]["blocks"][block.parentID]["data"][0]["blocks"][blockID]["data"] = _objClone(block.data);
                        }
                      }
                      else {
                        _data["sections"][blockSection]["blocks"][blockID]["data"] = _objClone(block.data);
                        _nmeData.update();
                      }
                    }

                    $nmebElem.attr({
                      "src": block.data.url,
                      "width": block.data.width,
                    });

                    if (block.parentType == "rc-col-2") {
                      $nmebElem.attr("width", "300");
                    }

                    if (block.parentType == "rc-float") {
                      $nmebElem.attr("width", "210");
                    }
                    break;

                    case "header":
                      if (!block.data.url && block.data.isDefault) {
                        var defaultImg = _getDefaultImage("logo");
                        block.data.url = defaultImg.url;
                        block.data.width = defaultImg.width;
                        block.data.height = defaultImg.height;
                        _data["sections"][blockSection]["blocks"][blockID]["data"] = _objClone(block.data);
                        _nmeData.update();
                      }

                      $nmebElem.attr({
                        "src": block.data.url,
                        "width": block.data.width,
                      });
                      break;

                    case "footer":
                      $nmebElem.addClass("nme-editable");
                      $nmebElem.attr({
                        "data-type": "xquill",
                        "data-placeholder": "請輸入段落文字...",
                        "data-title": "Enter comments"
                      });
                      decodeContent = _htmlUnescape(block.data.html);
                      $nmebElem.html(decodeContent);
                      break;

                  case "rc-col-1":
                    var group = ["image", "title", "paragraph", "button"],
                        nestBlocksData = block["data"][0]["blocks"],
                        $nestTarget = $nmebElem.find("td.col-1");

                    $nestTarget.html("");

                    // If this is a new block, copy data from template
                    if (_objIsEmpty(nestBlocksData)) {
                      for (var i in group) {
                        var nestBlockType = group[i],
                            nestBlockData = _objClone(_tpl["data"][nestBlockType]);

                        if (!_objIsEmpty(nestBlockData)) {
                          var nestBlockID = nestBlockType + "-" + _renderID();
                          nestBlockData.id = nestBlockID;
                          nestBlockData.parentID = blockID;
                          nestBlockData.parentType = blockType;
                          nestBlockData.index = 0;
                          nestBlockData.control.sortable = false;
                          nestBlockData.control.delete = false;
                          nestBlockData.control.clone = false;
                          nestBlockData.weight = i;
                          _data["sections"][blockSection]["blocks"][blockID]["data"][0]["blocks"][nestBlockID] = nestBlockData;
                          _nmeBlock.add(nestBlockData, "edit", $nestTarget, "append");
                        }

                        _nmeData.update();
                      }
                    }
                    // If this block is to be cloned, just need to assign new ID and parent ID
                    else {
                      for (var i in nestBlocksData) {
                        var nestBlockData = nestBlocksData[i],
                            nestBlockType = nestBlockData.type,
                            nestBlockID = nestBlockType + "-" + _renderID();

                        nestBlockData.id = nestBlockID;
                        nestBlockData.parentID = blockID;

                        // Delete the copied index
                        delete _data["sections"][blockSection]["blocks"][blockID]["data"][0]["blocks"][i];

                        // Added data to new index
                        _data["sections"][blockSection]["blocks"][blockID]["data"][0]["blocks"][nestBlockID] = nestBlockData;
                        _nmeBlock.add(nestBlockData, "edit", $nestTarget, "append");
                        _nmeData.update();
                      }
                    }
                    break;

                    case "rc-col-2":
                      var	group = ["image", "paragraph"],
                          nestBlocksData,
                          $nestTarget;

                      for (var dataIndex = 0; dataIndex < 2; dataIndex++) {
                        var col = dataIndex + 1;
                        nestBlocksData = block["data"][dataIndex]["blocks"],
                        $nestTarget = $nmebElem.find("td.col-" + col);
                        $nestTarget.html("");

                        // If this is a new block, copy data from template
                        if (_objIsEmpty(nestBlocksData)) {
                          for (var i in group) {
                            var nestBlockType = group[i],
                                nestBlockData = _objClone(_tpl["data"][nestBlockType]);

                            if (!_objIsEmpty(nestBlockData)) {
                              var nestBlockID = nestBlockType + "-" + _renderID();
                              nestBlockData.id = nestBlockID;
                              nestBlockData.parentID = blockID;
                              nestBlockData.parentType = blockType;
                              nestBlockData.index = dataIndex;
                              nestBlockData.control.sortable = false;
                              nestBlockData.control.delete = false;
                              nestBlockData.control.clone = false;
                              nestBlockData.weight = i;

                              if (nestBlockType == "paragraph") {
                                nestBlockData["styles"]["block"]["padding-right"] = "0";
                                nestBlockData["styles"]["block"]["padding-left"] = "0";
                              }

                              _data["sections"][blockSection]["blocks"][blockID]["data"][dataIndex]["blocks"][nestBlockID] = nestBlockData;
                              _nmeBlock.add(nestBlockData, "edit", $nestTarget, "append");
                            }

                            _nmeData.update();
                          }
                        }
                        // If this block is to be cloned, just need to assign new ID and parent ID
                        else {
                          for (var i in nestBlocksData) {
                            var nestBlockData = nestBlocksData[i],
                                nestBlockType = nestBlockData.type,
                                nestBlockID = nestBlockType + "-" + _renderID();

                            nestBlockData.id = nestBlockID;
                            nestBlockData.parentID = blockID;

                            // Delete the copied index
                            delete _data["sections"][blockSection]["blocks"][blockID]["data"][dataIndex]["blocks"][i];

                            // Added data to new index
                            _data["sections"][blockSection]["blocks"][blockID]["data"][dataIndex]["blocks"][nestBlockID] = nestBlockData;
                            _nmeBlock.add(nestBlockData, "edit", $nestTarget, "append");
                            _nmeData.update();
                          }
                        }
                      }
                      break;

                      case "rc-float":
                        var group = ["image", "paragraph"],
                            nestBlocksData = block["data"][0]["blocks"],
                            $nestTarget;

                        // If this is a new block, copy data from template
                        if (_objIsEmpty(nestBlocksData)) {
                          for (var i in group) {
                            var nestBlockType = group[i],
                                nestBlockData = _objClone(_tpl["data"][nestBlockType]);

                            $nestTarget = nestBlockType == "image" ? $nmebElem.find("td.img-col") : $nmebElem.find("td.text-col");

                            // Remove token string from target element
                            $nestTarget.html("");

                            if (!_objIsEmpty(nestBlockData)) {
                              // Generate new ID to this block
                              var nestBlockID = nestBlockType + "-" + _renderID();

                              // Set deafult value
                              nestBlockData.id = nestBlockID;
                              nestBlockData.parentID = blockID;
                              nestBlockData.parentType = blockType;
                              nestBlockData.index = 0;
                              nestBlockData.control.sortable = false;
                              nestBlockData.control.delete = false;
                              nestBlockData.control.clone = false;
                              nestBlockData.weight = i;

                              if (nestBlockType == "paragraph") {
                                nestBlockData["styles"]["block"]["padding-top"] = "0";
                                nestBlockData["styles"]["block"]["padding-right"] = "10px";
                                nestBlockData["styles"]["block"]["padding-bottom"] = "0";
                                nestBlockData["styles"]["block"]["padding-left"] = "10px";
                              }

                              // Added data to new index
                              _data["sections"][blockSection]["blocks"][blockID]["data"][0]["blocks"][nestBlockID] = nestBlockData;

                              // Added block to stage
                              _nmeBlock.add(nestBlockData, "edit", $nestTarget, "append");
                            }

                            // Update data
                            _nmeData.update();
                          }
                        }
                        // If this block is to be cloned, just need to assign new ID and parent ID
                        else {
                          for (var i in nestBlocksData) {
                            var nestBlockData = nestBlocksData[i],
                                nestBlockType = nestBlockData.type,
                                nestBlockID = nestBlockType + "-" + _renderID();

                            $nestTarget = nestBlockType == "image" ? $nmebElem.find("td.img-col") : $nmebElem.find("td.text-col");

                            // Remove token string from target element
                            $nestTarget.html("");

                            // Set deafult value
                            nestBlockData.id = nestBlockID;
                            nestBlockData.parentID = blockID;

                            // Delete the copied index
                            delete _data["sections"][blockSection]["blocks"][blockID]["data"][0]["blocks"][i];

                            // Added data to new index
                            _data["sections"][blockSection]["blocks"][blockID]["data"][0]["blocks"][nestBlockID] = nestBlockData;

                            // Added block to stage
                            _nmeBlock.add(nestBlockData, "edit", $nestTarget, "append");

                            // Update data
                            _nmeData.update();
                          }
                        }
                        break;

                  default:
                    $nmebElem.html(block.data);
                    break;
                }

                // Added link data attribute to element, this data will be used in edit mode.
                if (block.link) {
                  $nmebElem.attr({
                    "data-link": block.link
                  });
                }

                _nmeBlockControl.render(blockID, blockType);
                _editable();
              }

              // Check control permission of each block
              if (block.control) {
                if (!block.control.sortable) {
                  $block.find(".nme-block-move .handle-btn").remove();
                }

                if (!block.control.clone) {
                  $block.find(".handle-clone").remove();
                }

                if (!block.control.delete) {
                  $block.find(".handle-delete").remove();
                }
              }
            }
          }
        }
      }
    },
    clone: function(data, $target) {
      let cloneData = !_objIsEmpty(data) ? data : null;

      if (_domElemExist($target)) {
        _nmeBlock.add(cloneData, "edit", $target, "after");
      }
    },
    delete: function(data) {
      let block = !_objIsEmpty(data) ? data : null,
          blockID = block.id,
          section = block.section,
          $block = $(".nme-block[data-id='" + blockID + "']");

      if ($block.length) {
        // Delete DOM
        $block.remove();

        // Remove block data
        if (_data["sections"][section]["blocks"][blockID]) {
          delete _data["sections"][section]["blocks"][blockID];
          _nmeData.update();
        }
      }
    }
  };

  var _nmeMain = function() {
    if (!$(_main).length) {
      let mailTplName =  _data.settings.template ? _data.settings.template : "col-1-full-width",
          mailTpl = _tpl["mail"][mailTplName];

      $(_container).append("<div class='" + NME_MAIN + "'><div class='" + INNER_CLASS + "'></div></div>");
      $(_main).children(".inner").append(mailTpl);

      // Added styles to body table
      _nmeSetStyles($(_main).find(".nme-body-table"), _data.settings.styles, "self");

      if (!_objIsEmpty(_data) && _data.sections && _data.settings) {
        for (let section in _data.sections) {
          if (!_sectionIsEmpty(section)) {
            let blocksData = _data.sections[section].blocks,
                sectionID = "nme-mail-" + section,
                sectionInner = "#" + sectionID + " .nme-mail-inner",
                blocksContainer = sectionInner + " .nme-blocks";

            $(sectionInner).append("<div id='" + sectionID + "-blocks' class='nme-blocks' data-section='" + section + "'></div>");

            // Render blocks from data
            for (let blockID in _data.sections[section].blocks) {
              let blockData = blocksData[blockID];
              _nmeBlock.add(blockData, "edit", $(blocksContainer));
            }
          }
        }

        // Prevent users from pressing enter to send the #upload form.
        $("#Upload").on("keypress", "input, textarea", function(event){
          let code = event.keyCode || event.which;

          if (code == 13) {
            event.preventDefault();
            return false;
          }
        });

        $("#Upload").on("click", ".form-submit", function(event) {
          $(this).closest("form").data("action", $(this).attr("name"));
        });

        $("#Upload").submit(function(event) {
          let $form = $(this),
              buttonName = $form.data("action") ? $form.data("action") : $(document.activeElement).attr("name"),
              allowSubmit = $form.data("allow-submit") ? $form.data("allow-submit") : false;

          if (allowSubmit) {
            $form.data("allow-submit", false);
            return;
          }

          // Check edit mode option, Only 'Compose On-screen' option is allowed
          if ($(".form-radio[name='upload_type'][value='1']").is(":checked")) {
            // Convert json data to HTML and save to CKEditor when click button is "Next" or "Save & Continue Later"
            if (buttonName == "_qf_Upload_upload" || buttonName == "_qf_Upload_upload_save") {
              event.preventDefault();
              let oldEditorContent = CKEDITOR.instances['html_message'].getData(),
                  confirmMessage = _ts["Because you have switched to 'Compose On-screen' mode, the content of the traditional editor will be replaced. Are you sure you want to save it?"];

              let saveContentToOldEditor = function() {
                _nmeMailOutput();
                let previewContent = "";
                let checkMailOutput = function() {
                  if ($("#nme-mail-output-frame").length) {
                    previewContent = $("#nme-mail-output-frame").contents().find("body").html();

                    if (previewContent) {
                      clearInterval(checkMailOutputTimer);
                      previewContent = document.getElementById("nme-mail-output-frame").contentWindow.document.documentElement.outerHTML;
                      CKEDITOR.instances['html_message'].setData(previewContent);
                      $form.data("allow-submit", true);
                      $form.submit();
                    }
                  }
                }
                let checkMailOutputTimer = setInterval(checkMailOutput, 500);
              }

              if (oldEditorContent.indexOf("neticrm-mailing-editor") == -1) {
                if (window.confirm(confirmMessage)) {
                  saveContentToOldEditor();
                }
              }
              else {
                saveContentToOldEditor();
              }
            }
          }
        });

        _sortable();
        _nmePanels();
        _nmePreview.init();
        _onScreenCenterElem(".nme-block");
        _tooltip();
      }
    }
  };

  var _nmeMailOutput = function() {
    let mailTplName =  _data.settings.template ? _data.settings.template : "col-1-full-width",
        mailTpl = _tpl["mail"][mailTplName],
        baseTpl = _tpl["base"]["base"],
        output = "";

    if (!$(".nme-mail-output").length) {
      $(_container).append("<div class='nme-mail-output'><div class='nme-mail-output-content'></div><iframe id='nme-mail-output-frame'></iframe></div>");
    }

    let mailFrame = document.getElementById("nme-mail-output-frame").contentWindow.document,
        $mailOutputContent = $(".nme-mail-output-content");

    mailFrame.open();
    mailFrame.write(baseTpl);
    mailFrame.close();

    let $mailFrameBody = $("#nme-mail-output-frame").contents().find("body");

    $mailOutputContent.html(mailTpl);
    _nmeSetStyles($mailOutputContent.find(".nme-body-table"), _data.settings.styles, "self");

    if (!_objIsEmpty(_data) && _data.sections && _data.settings) {
      for (let section in _data.sections) {
        if (!_sectionIsEmpty(section)) {
          let blocksData = _data.sections[section].blocks,
              sectionID = "nme-mail-" + section,
              sectionInner = "#" + sectionID + " .nme-mail-inner",
              $blocksContainer = $mailOutputContent.find(sectionInner);

          for (let blockID in _data.sections[section].blocks) {
            let blockData = blocksData[blockID];
            _nmeBlock.add(blockData, "view", $blocksContainer);
          }
        }
      }

      if ($mailOutputContent.find(".nme-body-table").length) {
        $mailOutputContent.find(".nme-body-table").css("background-color", _data.settings.styles.page["backgroun-color"]);
        $mailOutputContent.find(".nme-body-table").attr("bgcolor", _data.settings.styles.page["backgroun-color"]);
      }

      let mailOutputContent = $mailOutputContent.html();
      $mailFrameBody.html(mailOutputContent);
    }
  };

  var _nmeGlobalSetting = function() {
    var pickrInit = function(elemID, defaultColor) {
      let targetSelector = "#" + elemID,
          $target = $(targetSelector);

      defaultColor = typeof defaultColor !== undefined ? defaultColor : "#42445a";

      if (_domElemExist($target)) {
        const pickr = new Pickr({
          el: targetSelector,
          theme: 'nano',
          default: defaultColor,
          lockOpacity: true,
          swatches: [
            '#F44336',
            '#E91E63',
            '#9C27B0',
            '#673AB7',
            '#3F51B5',
            '#2196F3',
            '#03A9F4',
            '#00BCD4',
            '#009688',
            '#4CAF50',
            '#8BC34A',
            '#CDDC39',
            '#FFEB3B',
            '#FFC107',
            '#FF9800',
            '#FF5722',
            '#795548',
            '#9E9E9E',
            '#607D8B',
            '#000000',
            '#FFFFFF'
          ],
          components: {
            // Main components
            preview: true,
            opacity: true,
            hue: true,

            // Input / output Options
            interaction: {
              hex: true,
              input: true
            }
          }
        });

        pickr.on("init", function(instance) {
          let pickrID = "pickr-" + elemID;
          $(pickr._root.button).attr("id", pickrID);
          $(pickr._root.button).addClass("pickr-initialized");
          _pickrs[pickrID] = instance;
        });

        pickr.on("change", function(color, instance) {
          pickr.applyColor();
        });

        pickr.on("save", function(color, instance) {
          let $button = $(pickr._root.button),
              $field = $button.closest(".nme-setting-field"),
              fieldType = $field.data("field-type"),
              $section = $button.closest(".nme-setting-section"),
              group = $section.data("setting-group"),
              colorVal = color.toHEXA().toString(),
              $block,
              $target;

          // Update color to settings object
          _data["settings"]["styles"][group][fieldType] = colorVal;

          if (group == "page") {
            if (fieldType == "background-color") {
              $target = $(_main).find(".nme-body-table");

              // Update color to dom
              $target.css(fieldType, colorVal);
              $target.attr("bgcolor", colorVal);
            }
          }

          if (group == "block") {
            $block = $("#nme-mail-body .nme-block");

            if (fieldType == "background-color") {
              $target = $block.find("[data-settings-target='block']");

              // Update color to dom
              $target.css(fieldType, colorVal);
              $target.attr("bgcolor", colorVal);

              $block.each(function() {
                let $this = $(this),
                    section = $this.data("section"),
                    blockID = $this.data("id");

                // Update color to json
                _data["sections"][section]["blocks"][blockID]["styles"]["block"][fieldType] = colorVal;
              });
            }
          }

          if (group == "title") {
            $block = $(".nme-block[data-type='title']");

            if (fieldType == "color") {
              $target = $block.find(".nme-elem");
              $target.css(fieldType, colorVal);

              $block.each(function() {
                let $this = $(this),
                    section = $this.data("section"),
                    blockID = $this.data("id");

                // Update color to json
                _data["sections"][section]["blocks"][blockID]["styles"]["elem"][fieldType] = colorVal;
              });
            }
          }

          if (group == "button") {
            $block = $(".nme-block[data-type='button']:not([data-elem-override='true'])");

            if (fieldType == "color") {
              $target = $block.find(".nme-elem");
              $target.css(fieldType, colorVal);

              $block.each(function() {
                let $this = $(this),
                    section = $this.data("section"),
                    blockID = $this.data("id");

                // Update color to json
                _data["sections"][section]["blocks"][blockID]["styles"]["elem"][fieldType] = colorVal;
              });
            }

            if (fieldType == "background-color") {
              $target = $block.find("[data-settings-target='elemContainer']");

              // Update color to dom
              $target.css(fieldType, colorVal);
              $target.attr("bgcolor", colorVal);

              $block.each(function() {
                let $this = $(this),
                    section = $this.data("section"),
                    blockID = $this.data("id");

                // Update color to json
                _data["sections"][section]["blocks"][blockID]["styles"]["elemContainer"][fieldType] = colorVal;
              });
            }
          }

          _nmeData.update();
        });
      }
    };

    if ($(".nme-theme-setting-items").length) {
      if (!_objIsEmpty(_themes)) {
        for (let i in _themes) {
          let radio = "<label class='nme-theme-setting-item crm-form-elem crm-form-radio' for='nme-theme-setting-item-" + i + "'>" +
          "<input value='" + i + "' type='radio' id='nme-theme-setting-item-" + i + "' class='nme-setting-radio form-radio' name='nme-theme-setting'>" +
          "<span class='elem-label'>" +
          "<div class='nme-theme-thumb' style='border-left-color: " + _themes[i]["styles"]["page"]["background-color"] + "; border-bottom-color: " + _themes[i]["styles"]["block"]["background-color"] + ";'>" +
          "</div>" +
          "</span>" +
          "</label>";
          $(".nme-theme-setting-items").append(radio);
        }
      }
    }

    if ($(".nme-setting-picker").length) {
      $(".nme-setting-picker").each(function() {
        let $this = $(this),
            thisID = $this.attr("id"),
            $field = $this.closest(".nme-setting-field"),
            fieldType = $field.data("field-type"),
            $section = $this.closest(".nme-setting-section"),
            group = $section.data("setting-group"),
            defaultColor = _data["settings"]["styles"][group][fieldType];

        pickrInit(thisID, defaultColor);
      });
    }

    if ($(".nme-setting-select").length) {
      $(".nme-setting-field").off("change").on("change", ".nme-setting-select", function() {
        let $select = $(this),
            selectID = $select.attr("id"),
            val = $select.val(),
            $field = $select.closest(".nme-setting-field"),
            fieldType = $field.data("field-type"),
            $section = $select.closest(".nme-setting-section"),
            group = $section.data("setting-group"),
            $block,
            $target;

        if (group == "title") {
          $block = $(".nme-block[data-type='title']");

          if (fieldType == "font-size") {
            $target = $block.find(".nme-elem");
            $target.css(fieldType, val);

            $block.each(function() {
              let $this = $(this),
                  section = $this.data("section"),
                  blockID = $this.data("id");

              // Update color to json
              _data["sections"][section]["blocks"][blockID]["styles"]["elem"][fieldType] = colorVal;
            });
          }
        }
      });
    }

    $(".nme-setting-radio").on("change", function() {
      let $radio = $(this),
          radioID = $radio.attr("id"),
          radioName = $radio.attr("name"),
          val = $radio.val(),
          $field = $radio.closest(".nme-setting-field"),
          fieldType = $field.data("field-type"),
          $section = $radio.closest(".nme-setting-section"),
          group = $section.data("setting-group"),
          $block,
          $target;

      if (radioName == "nme-theme-setting") {
        for (let group in _themes[val]["styles"]) {
          for (let fieldType in _themes[val]["styles"][group]) {
            let colorVal = _themes[val]["styles"][group][fieldType],
                $pickr = $(".nme-setting-section[data-setting-group='" + group + "'] .nme-setting-field[data-field-type='" + fieldType + "'] .pcr-button");

            if ($pickr.length) {
              let pickrID = $pickr.attr("id"),
                  pickrIns = _pickrs[pickrID];

              pickrIns.setColor(colorVal);
            }
          }
        }
      }
    });
  };

  var _nmePreview = {
    init: function() {
      if (!$("#nme-preview-popup").length) {
        let previewPopup = "<div id='nme-preview-popup' class='nme-preview-popup mfp-hide'>" +
          "<div class='inner'>" +
          "<div class='nme-preview-toolbar'>" +
          "<div class='nme-preview-title'>" + _ts["Preview"] + "</div>" +
          "<div class='nme-preview-mode'>" +
          "<button type='button' class='nme-preview-mode-btn is-active' data-mode='desktop'>" + _ts["Normal"] + "</button>" +
          "<button type='button' class='nme-preview-mode-btn' data-mode='mobile'>" + _ts["Mobile Device"] + "</button>" +
          "</div>" +
          "<button type='button' class='nme-preview-close'><i class='zmdi zmdi-close'></i></button>" +
          "</div>" +
          "<div class='nme-preview-content'>" +
          "<div class='nme-preview-panels'>" +
          "<div class='nme-preview-panel nme-preview-desktop-panel is-active' data-mode='desktop'><div class='desktop-preview-container preview-container'><div class='preview-content'></div></div></div>" +
          "<div class='nme-preview-panel nme-preview-mobile-panel' data-mode='mobile'><div class='mobile-preview-container preview-container'><div class='preview-content'></div></div></div>" +
          "</div>" +
          "</div>" +
          "</div>" +
          "</div>";

        $(_container).append(previewPopup);
        $(".nme-preview-panel").each(function() {
          //iframe.contentWindow.document.write(html); [0].contentWindow.document;
          let mode = $(this).data("mode");
          $(this).find(".preview-content").append("<iframe id='nme-preview-iframe-" + mode + "' class='nme-preview-iframe'></iframe>");
        });

        $("#nme-preview-popup").on("click", ".nme-preview-close", function() {
          _nmePreview.close();
        });
      }

      $(".nme-container").on("change", ".nme-preview-mode-switch", function() {
        if ($(this).is(":checked")) {
          setTimeout(function() { _nmePreview.open(); }, 500);
        }
        else {
          _nmePreview.close();
        }
      });
    },
    open: function() {
      $.magnificPopup.open({
        items: {
          src: "#nme-preview-popup"
        },
        type: "inline",
        mainClass: "mfp-preview-popup",
        preloader: true,
        closeOnBgClick: false,
        showCloseBtn: false,
        callbacks: {
          open: function() {
            $("body").addClass("mfp-is-active");
            _nmeMailOutput();

            var checkMailOutputTimer = setInterval(checkMailOutput, 500);

            let previewContent = "";
            function checkMailOutput() {
              if ($("#nme-mail-output-frame").length) {
                previewContent = $("#nme-mail-output-frame").contents().find("body").html();

                if (previewContent) {
                  clearInterval(checkMailOutputTimer);
                  previewContent = document.getElementById("nme-mail-output-frame").contentWindow.document.documentElement.outerHTML;
                  $(".nme-preview-iframe").each(function() {
                    let previewFrameID = $(this).attr("id"),
                        previewFrame = document.getElementById(previewFrameID).contentWindow.document;

                    previewFrame.open();
                    previewFrame.write(previewContent);
                    previewFrame.close();
                  });

                  // preview mode switch
                  $(".nme-preview-mode-btn").on("click", function() {
                    let mode = $(this).data("mode");
                    $(".nme-preview-mode-btn").removeClass("is-active");
                    $(this).addClass("is-active");
                    $(".nme-preview-panel").removeClass("is-active");
                    $(".nme-preview-panel[data-mode='" + mode + "']").addClass("is-active");
                  });
                }
              }
            }
          },
          close: function() {
            $("body").removeClass("mfp-is-active");
          },
        }
      });
    },
    close: function() {
      if ($(".nme-preview-mode-switch").is(":checked")) {
        $(".nme-preview-mode-switch").prop("checked", false);
      }
      $.magnificPopup.close();
    }
  };

  /* Main Help function */
  var _checkNmeInstance = function() {
    if(!$.nmEditor.instance) {
      _nme = new nmEditor();
      _nme.init();
    }
  };

  var _editable = function() {
    let $editableElems = $(".nme-editable:not(.editable-initialized)");

    if (typeof $.fn.editable !== "undefined" && $editableElems.length) {
      $.fn.editable.defaults.mode = 'inline';

      $editableElems.each(function() {
        let $editableElem = $(this);

        $editableElem.editable();

        $editableElem.on("save", function(e, params) {
          let $this = $(this),
              editableType = $this.data("type"),
              blockID = $this.data("id"),
              section = $this.data("section"),
              parentID = $this.data("parent-id"),
              parentType = $this.data("parent-type"),
              index = $this.data("index");

          if (parentID && parentType) {
            if (parentType == "rc-col-1" || parentType == "rc-col-2" || parentType == "rc-float") {
              if (editableType == "text") {
                if (_data["sections"][section]["blocks"][parentID]["data"][index]["blocks"][blockID]) {
                  _data["sections"][section]["blocks"][parentID]["data"][index]["blocks"][blockID]["data"] = params.newValue;
                  _nmeData.update();
                }
              }

              if (editableType == "xquill") {
                if (_data["sections"][section]["blocks"][parentID]["data"][index]["blocks"][blockID]) {
                  _data["sections"][section]["blocks"][parentID]["data"][index]["blocks"][blockID]["data"]["html"] = params.newValue;
                  _nmeData.update();
                }
              }
            }
          }
          else {
            if (_data["sections"][section]["blocks"][blockID]) {
              if (editableType == "text") {
                _data["sections"][section]["blocks"][blockID]["data"] = params.newValue;
                _nmeData.update();
              }

              if (editableType == "xquill") {
                _data["sections"][section]["blocks"][blockID]["data"]["html"] = params.newValue;
                _nmeData.update();
              }
            }
          }
        });

        $editableElem.addClass("editable-initialized");
      });
    }
  };

  var _sortable = function() {
    $(".nme-blocks").each(function() {
      let nmeBlocksID = $(this).attr("id"),
          nmeBlocksSection = $(this).data("section"),
          nmeBlocks = document.getElementById(nmeBlocksID);

      _sortables[nmeBlocksSection] = {};
      _sortables[nmeBlocksSection]["inst"] = new Sortable(nmeBlocks, {
        animation: 150,
        draggable: ".nme-block[data-sortable='true']",
        dragClass: "handle-drag",
        ghostClass: 'nme-block-dragging',
        onUpdate: function (evt) {
          _sortables[nmeBlocksSection]["order"] = _sortables[nmeBlocksSection]["inst"].toArray();
          _nmeData.sort(_sortables[nmeBlocksSection]["order"], nmeBlocksSection);
        }
      });

      _sortables[nmeBlocksSection]["order"] = _sortables[nmeBlocksSection]["inst"].toArray();
    });
  };

  var _colorable = function(elemID) {
    var elemID = typeof elemID !== "undefined" ? elemID : "";

    var pickrInit = function(elemID, defaultColor) {
      let targetSelector = "#" + elemID,
          $target = $(targetSelector);

      if (_domElemExist($target)) {
        const pickr = new Pickr({
          el: targetSelector,
          theme: 'nano',
          lockOpacity: true,
          useAsButton: true,
          swatches: [
            '#F44336',
            '#E91E63',
            '#9C27B0',
            '#673AB7',
            '#3F51B5',
            '#2196F3',
            '#03A9F4',
            '#00BCD4',
            '#009688',
            '#4CAF50',
            '#8BC34A',
            '#CDDC39',
            '#FFEB3B',
            '#FFC107',
            '#FF9800',
            '#FF5722',
            '#795548',
            '#9E9E9E',
            '#607D8B',
            '#000000',
            '#FFFFFF'
          ],
          components: {
            // Main components
            preview: true,
            opacity: true,
            hue: true,

            // Input / output Options
            interaction: {
              hex: true,
              input: true
            }
          }
        });

        pickr.on("init", function(instance) {
          let pickrID = "pickr-" + elemID;
          $(pickr._root.button).addClass("pickr-initialized");
          _pickrs[pickrID] = instance;
        });

        pickr.on("change", function(color, instance) {
          let $button = $(pickr._root.button),
              $block = $button.closest(".nme-block"),
              blockType = $block.data("type");

          pickr.applyColor();
        });

        pickr.on("save", function(color, instance) {
          let $button = $(pickr._root.button),
              $block = $button.closest(".nme-block"),
              blockID = $block.data("id"),
              section = $block.data("section"),
              blockType = $block.data("type"),
              parentID = $block.data("parent-id"),
              parentType = $block.data("parent-type"),
              index = $block.data("index") == 0 || $block.data("index") > 0 ? $block.data("index") : 0;

          if (blockType == "button") {
            let bgColor = color.toHEXA().toString();

            // Update color to dom
            $block.find("[data-settings-target='elemContainer']").css("background-color", bgColor);
            $block.find("[data-settings-target='elemContainer']").attr("bgcolor", bgColor);

            // Update color to json
            if (parentID && parentType) {
              if (parentType == "rc-col-1" || parentType == "rc-col-2" || parentType == "rc-float") {
                if (_data["sections"][section]["blocks"][parentID]["data"][index]["blocks"][blockID]) {
                  _data["sections"][section]["blocks"][parentID]["data"][index]["blocks"][blockID]["styles"]["elemContainer"]["background-color"] = bgColor;
                  _data["sections"][section]["blocks"][parentID]["data"][index]["blocks"][blockID]["override"]["elem"] = true;
                  _nmeData.update();
                }
              }
            }
            else {
              _data["sections"][section]["blocks"][blockID]["styles"]["elemContainer"]["background-color"] = bgColor;
              _data["sections"][section]["blocks"][blockID]["override"]["elem"] = true;
              _nmeData.update();
            }
          }

          $block.attr("data-elem-override", true);
        });
      }
    };

    if (elemID) {
      pickrInit(elemID);
    }
  };

  var _tooltip = function() {
    if ($.fn.powerTip) {
      let defaultOptions = {};

      if ($("[data-tooltip]").length) {
        $("[data-tooltip]").each(function() {
          let options = {};

          if ($(this).is("[data-tooltip-placement]")) {
            options.placement = $(this).data("tooltip-placement");
          }

          if ($(this).is("[data-tooltip-fadeouttime]")) {
            options.fadeOutTime = $(this).data("tooltip-fadeouttime");
          }

          $(this).powerTip(options);
        });
      }
    }
  };

  var _submitConfirm = function($trigger) {
    let confirmPopup = "";
    if (!$("#nme-confirm-popup").length) {
      confirmPopup += "<div id='nme-confirm-popup' class='nme-confirm-popup mfp-hide'>" +
        "<div class='inner'>" +
        "<div class='nme-confirm-message'><p>您即將離開電子報編輯工作區，如不儲存編輯內容將流失！</p>" +
        "<div class='nme-confirm-actions'>" +
        "<button type='button' class='nme-confirm-true'>確定離開工作區</button>" +
        "<button type='button' class='nme-confirm-false'>取消</button>" +
        "</div>" +
        "</div>" +
        "</div>";
      $(_container).append(confirmPopup);
      $("#nme-confirm-popup").on("click", ".nme-confirm-true", function() {
        $trigger.attr("data-sumbit-permission", 1);
        $trigger.click();
      });
      $("#nme-confirm-popup").on("click", ".nme-confirm-false", function() {
        $trigger.attr("data-sumbit-permission", 0);
        $.magnificPopup.close();
      });
    }

    $.magnificPopup.open({
      items: {
        src: "#nme-confirm-popup"
      },
      type: "inline",
      mainClass: "mfp-confirm-popup",
      preloader: true,
      closeOnBgClick: false,
      showCloseBtn: false,
      callbacks: {
        open: function() {
          $("body").addClass("mfp-is-active");
        },
        close: function() {
          $("body").removeClass("mfp-is-active");
        },
      }
    });
  };

  var _sectionIsEmpty = function(section) {
    if (_data.sections[section] && !_objIsEmpty(_data.sections[section].blocks)) {
      let $section = $("#nme-mail-" + section);
      if ($section.length && $section.find(".nme-mail-inner")) {
        return false;
      }
      else {
        return true;
      }
    }
    else {
      return true;
    }
  }

  var _nmeBlockControl = {
    render: function(id, type) {
      let output = "",
          blockID = typeof id !== "undefined" ? id : "",
          blockType = typeof type !== "undefined" ? type : "",
          $block = $(".nme-block[data-id='" + blockID + "']");

      // nmeBlock control - extended actions
      if ($block.length && _editActions.extended[blockType]) {
        let extendedActions = _editActions.extended[blockType];

        for (let k in extendedActions) {
          let action = extendedActions[k];
          output += "<button id='" + blockID + "-handle-" + action + "' type='button' class='handle-" + action + " handle-btn' data-type='" + action + "'><i class='zmdi " + _controlIconClass[action] + "'></i></button>";
        }

        $block.find(".nme-block-actions").prepend(output);
        _nmeBlockControl.init(blockID);
      }
      else {
        // If the block has no any extended actions, initialize directly.
        _nmeBlockControl.init(blockID);
      }
    },
    init: function(id) {
      let blockID = typeof id !== "undefined" ? id : "",
          $block = $(".nme-block[data-id='" + blockID + "']");

      $block.find(".nme-block-control").on("click", ".handle-btn", function(event) {
        event.preventDefault();
        event.stopPropagation();

        let $handle = $(this),
            handleID = $handle.attr("id"),
            handleType = $handle.data("type"),
            $block = $handle.closest(".nme-block"),
            blockID = $block.data("id"),
            blockDomID = $block.attr("id"),
            blockType = $block.data("type"),
            parentID = $block.data("parent-id"),
            parentType = $block.data("parent-type"),
            index = $block.data("index") == 0 || $block.data("index") > 0 ? $block.data("index") : 0,
            section = $block.data("section"),
            sectionID = "nme-mail-" + section,
            sectionInner = "#" + sectionID + " .nme-mail-inner",
            blocksContainer = sectionInner + " .nme-blocks",
            $elem = $block.find(".nme-elem"),
            $elemContainer = $elem.closest(".nmeb-content-container"),
            $elemContainerInner = $elem.parent(".nmeb-content"),
            blockSortInst = _sortables[section]["inst"],
            blocksSortOrder = _sortables[section]["order"];

        // Block control: move group
        // prev
        if (handleType == "prev") {
          let $prevBlock = $block.prev(".nme-block"),
              prevBlockID = $prevBlock.length ? $prevBlock.attr("data-id") : "";

          if (prevBlockID && $prevBlock.data("sortable")) {
            blocksSortOrder = _swapArrayVal(blocksSortOrder, blockID, prevBlockID);
            _sortables[section]["order"] = blocksSortOrder;
            blockSortInst.sort(blocksSortOrder);
            _nmeData.sort(blocksSortOrder, section);
          }
        }

        // next
        if (handleType == "next") {
          let $nextBlock = $block.next(".nme-block"),
              nextBlockID = $nextBlock.length ? $nextBlock.attr("data-id") : "";

          if (nextBlockID && $nextBlock.data("sortable")) {
            blocksSortOrder = _swapArrayVal(blocksSortOrder, blockID, nextBlockID);
            _sortables[section]["order"] = blocksSortOrder;
            blockSortInst.sort(blocksSortOrder);
            _nmeData.sort(blocksSortOrder, section);
          }
        }

        // Block control: actions group
        // clone
        if (handleType == "clone") {
          let cloneData = _objClone(_data["sections"][section]["blocks"][blockID]),
              cloneBlockID = blockType + "-" + _renderID();

          cloneData.id = cloneBlockID;
          _data["sections"][section]["blocks"][cloneBlockID] = cloneData;
          _nmeBlock.clone(cloneData, $("#" + blockDomID));
          _sortables[section]["order"] = _sortables[section]["inst"].toArray();
          _nmeData.sort(_sortables[section]["order"], section);
        }

        // delete
        if (handleType == "delete") {
          let deleteData = _objClone(_data["sections"][section]["blocks"][blockID]);
          _nmeBlock.delete(deleteData);
        }

        // image
        if (handleType == "image") {
          window.nmeImce.targetID = blockID;
          window.nmeImce.targetSection = section;

          if (parentID && parentType) {
            window.nmeImce.targetParentID = parentID;
            window.nmeImce.targetParentType = parentType;
            window.nmeImce.targetIndex = index;
          }

          var win = window.open('/imce&app=nme|sendto@nmeImce.afterInsert', 'nme_imce', 'width=640, height=480');
        }

        // link
        if (handleType == "link") {
          let	editBlockID = "nme-edit-" + blockDomID,
          editItemID = "nme-edit-" + handleType + "-item-" + blockDomID;

          if ($elemContainer.length && !$elemContainer.find(".nme-edit").length) {
            let editItemVal = $elem.data("link") ? $elem.data("link") : "";
            let nmeEdit = "<div id='" + editBlockID + "' class='nme-edit' data-target='" + blockDomID + "'>" +
              "<div class='" + INNER_CLASS + "'>" +
              "<div class='nme-edit-link-item nme-edit-item'>" +
              "<div class='nme-edit-item-label'>" +
              "<label for='" + editItemID + "'>請輸入網址</label>" +
              "</div>" + // .nme-edit-item-label
              "<div class='nme-edit-item-content'>" +
              "<input id='" + editItemID + "' name='" + editItemID + "' type='text' placeholder='http://' value='" + editItemVal + "'>" +
              "</div>" + // .nme-edit-item-content
              "</div>" + // .nme-edit-item
              "<div class='nme-edit-actions'>" +
              "<a href='#' class='nme-edit-submit nme-edit-action btn' data-type='submit'>儲存</a>" +
              "<a href='#' class='nme-edit-cancel nme-edit-action btn' data-type='cancel'>取消</a>" +
              "</div>" + // .nme-edit-actions
              "</div>" + // .inner
              "</div>"; // .nme-edit

            // 將編輯表單放入對應的元件內
            $block.addClass(EDIT_CLASS);
            $elem.addClass(EDIT_CLASS);
            $elemContainer.addClass(EDIT_CLASS).append(nmeEdit);
            let $editBlock = $("#" + editBlockID),
                $editItem = $("#" + editItemID);

            // 編輯表單的按鈕事件：送出與取消
            $editBlock.on("click", ".nme-edit-action", function(event) {
              event.preventDefault();

              let $action = $(this),
                  actionType = $action.data("type");

              if (actionType == "submit") {
                let editItemVal = $editItem.val();

                if ($.trim(editItemVal)) {
                  $elem.attr("data-link", editItemVal);

                  if (parentID && parentType) {
                    if (parentType == "rc-col-1" || parentType == "rc-col-2" || parentType == "rc-float") {
                      if (_data["sections"][section]["blocks"][parentID]["data"][index]["blocks"][blockID]) {
                        _data["sections"][section]["blocks"][parentID]["data"][index]["blocks"][blockID]["link"] = editItemVal;
                        _nmeData.update();
                      }
                    }
                  }
                  else {
                    if (_data["sections"][section]["blocks"][blockID]) {
                      _data["sections"][section]["blocks"][blockID]["link"] = editItemVal;
                      _nmeData.update();
                    }
                  }
                }
              }

              $editBlock.remove();
              $block.removeClass(EDIT_CLASS);
              $elem.removeClass(EDIT_CLASS);
              $elemContainer.removeClass(EDIT_CLASS);
            });
          }
        }
      });

      // handle type: style
      if ($block.find(".handle-style").length) {
        _colorable($block.find(".handle-style").attr("id"));
      }
    }
  };

  var _nmePanelsSelectTpl = function() {
    $(".nme-select-tpl-list").on("click", ".nme-select-tpl-btn", function() {
      let $btn = $(this),
          tplName = $btn.data("name"),
          tplData = _tpl["data"][tplName];
    });
  };

  var _nmePanelsAddBlock = function() {
    $(".nme-add-block-list").on("click", ".nme-add-block-btn", function() {
      let $btn = $(this),
          addSection = "body",
          addBlockType = $btn.data("type"),
          addBlockData = _objClone(_tpl["data"][addBlockType]);

      if (!_objIsEmpty(addBlockData)) {
        let addBlockID = addBlockType + "-" + _renderID(),
            addMethod = $(".nme-blocks[data-section='" + addSection + "'] .nme-block.on-screen-center").length ? "after" : "append",
            $addTarget = $(".nme-blocks[data-section='" + addSection + "'] .nme-block.on-screen-center").length ? $(".nme-blocks[data-section='" + addSection + "'] .nme-block.on-screen-center") : $(".nme-blocks[data-section='" + addSection + "']");

        addBlockData.id = addBlockID;

        // Added block data
        _data["sections"][addSection]["blocks"][addBlockID] = addBlockData;

        // Added block dom
        _nmeBlock.add(addBlockData, "edit", $addTarget, addMethod);

        // Reorder data
        _sortables[addSection]["order"] = _sortables[addSection]["inst"].toArray();
        _nmeData.sort(_sortables[addSection]["order"], addSection);
      }
    });
  };

  var _nmePanels = function() {
    $(".nme-setting-panels").on("click", ".nme-setting-panels-trigger", function(event) {
      event.preventDefault();
      var $panels = $(".nme-setting-panels");
      if ($panels.hasClass("is-opened")) {
        $panels.removeClass("is-opened");
        $("body").removeClass("nme-panel-is-opened");
      }
      else {
        $panels.addClass("is-opened");
        $("body").addClass("nme-panel-is-opened");
      }
    });

    $(".nme-setting-panels-tabs").on("click", "a", function(event) {
      event.preventDefault();
      let $thisTabLink = $(this),
          $thisTab = $thisTabLink.parent("li"),
          $tabContainer = $thisTab.parent("ul"),
          $tabItems = $tabContainer.children("li"),
          $tabLinks = $tabItems.children("a"),
          tatgetContents = $tabContainer.data("target-contents"),
          $targetContents = $("." + tatgetContents),
          targetID = $thisTabLink.data("target-id"),
          $targetTabContent = $("#" + targetID);

      $tabLinks.removeClass(ACTIVE_CLASS);
      $targetContents.removeClass(ACTIVE_CLASS);
      $thisTabLink.addClass(ACTIVE_CLASS);
      $targetTabContent.addClass(ACTIVE_CLASS);
    });

    _nmePanelsAddBlock();
    _nmeGlobalSetting();
  };

  var _rwdEvents = function() {
    // Deal responsive event
  };

  var _windowResize = function() {
    _getViewport();
    // _rwdEvents();
  };

  /**
   * Debug
   */
  var _ln = function() {
    var e = new Error();
    if (!e.stack) try {
      // IE requires the Error to actually be throw or else the Error's 'stack'
      // property is undefined.
      throw e;
    } catch (e) {
      if (!e.stack) {
        return 0; // IE < 10, likely
      }
    }
    var stack = e.stack.toString().split(/\r\n|\n/);
    // We want our caller's frame. It's index into |stack| depends on the
    // browser and browser version, so we need to search for the second frame:
    var frameRE = /:(\d+):(?:\d+)[^\d]*$/;
    do {
      var frame = stack.shift();
    } while (!frameRE.exec(frame) && stack.length);
    return frameRE.exec(stack.shift())[1];
  }

  var _debug = function(item, label, mode) {
    var item = typeof item !== "undefined" ? item : "",
        mode = typeof mode !== "undefined" ? mode : "default",
        label = typeof label !== "undefined" ? label : "",
        allow = false;

    if (window.console && window.console.log) {
      if (mode == "force") {
        allow = true;
      }
      else {
        if (_debugMode) {
          allow = true;
        }
      }

      if (allow) {
        if (label) {
          window.console.log("===== " + label + " =====");
        }

        if (typeof item === "object") {
          window.console.log(JSON.parse(JSON.stringify(item)));
        }
        else {
          window.console.log(item);
        }
      }
    }
  };

  /**
   * ============================
   * Public variables
   * ============================
   */

  // IMCE客製公用函式，用來介接圖片上傳功能
  window.nmeImce = {
    targetID: "",
    targetSection: "",
    afterInsert: function(file, imceWindow) {
      let blockID = window.nmeImce.targetID,
          section = window.nmeImce.targetSection,
          parentID = window.nmeImce.targetParentID,
          parentType = window.nmeImce.targetParentType,
          index = window.nmeImce.targetIndex,
          fileURL = file.url,
          fileName = file.name,
          fileWidth = file.width,
          fileHeight = file.height;

      if (blockID) {
        let $target = $(".nme-block[data-id='" + blockID + "']");

        if (_domElemExist($target)) {
          let $img = $target.find(".nmee-image");

          if ($img.length) {
            // Update dom properties of the target image
            $img.attr({
              "src": fileURL,
              "width": fileWidth,
              "alt": fileName
            });

            if (parentType == "rc-col-2" || parentType == "rc-float") {
              $img.css("max-width", "100%");
            }

            // Update json data of the target image
            if (parentID && parentType) {
              if (parentType == "rc-col-1" || parentType == "rc-col-2" || parentType == "rc-float") {
                if (_data["sections"][section]["blocks"][parentID]["data"][index]["blocks"][blockID]) {
                  _data["sections"][section]["blocks"][parentID]["data"][index]["blocks"][blockID]["data"]["url"] = fileURL;
                  _data["sections"][section]["blocks"][parentID]["data"][index]["blocks"][blockID]["data"]["width"] = fileWidth;
                  _data["sections"][section]["blocks"][parentID]["data"][index]["blocks"][blockID]["data"]["height"] = fileHeight;
                  _data["sections"][section]["blocks"][parentID]["data"][index]["blocks"][blockID]["data"]["fileName"] = fileName;
                  _nmeData.update();
                }
              }
            }
            else {
              if (_data["sections"][section]["blocks"][blockID]) {
                _data["sections"][section]["blocks"][blockID]["data"]["url"] = fileURL;
                _data["sections"][section]["blocks"][blockID]["data"]["width"] = fileWidth;
                _data["sections"][section]["blocks"][blockID]["data"]["height"] = fileHeight;
                _data["sections"][section]["blocks"][blockID]["data"]["fileName"] = fileName;
                _nmeData.update();
              }
            }
          }
        }
      }

      imceWindow.close();
    }
  };

  /**
   * ============================
   * Public functions
   * ============================
   */

  /**
   * Main
   */
  nmEditor.prototype = {
    constructor: nmEditor,
    data: {},
    init: function() {
      _debug("===== nmEditor Init =====");
      if (window.nmEditor && window.nmEditor.translation) {
        _ts = window.nmEditor.translation;
        $.nmEditor.instance = _nme;

        if (!$(_container).hasClass(NME_CONTAINER)) {
          $(_container).addClass(NME_CONTAINER);
        }

        _nme.render();
        $(_container).addClass(INIT_CLASS);
      }

      // Window resize
      $(window).resize(function() {
        clearTimeout(_resizeTimer);
        _resizeTimer = setTimeout(_windowResize, 250);
      });
    },
    render: function() {
      // Load Data
      if (_dataLoadMode == "field") {
        _dataLoadSource = _nmeOptions.dataLoadSource;
        _nmeData.get.field(_dataLoadSource);

        if (_objIsEmpty(_data)) {
          let defaultData = $(".nme-tpl[data-template-default='true']").val();
          _defaultData = JSON.parse(defaultData);
          _data = _objClone(_defaultData);
        }

        $.nmEditor.instance.data = _data;
        _nmeData.update();
      }

      // Load templates
      let $nmeTplItems = $(".nme-tpl");

      if ($nmeTplItems.length) {
        let tplTotal = $nmeTplItems.length;

        $nmeTplItems.each(function(i) {
          let $this = $(this),
              tplName = $this.data("template-name"),
              tplLevel = $this.data("template-level"),
              tplOutput = $this.val();

          if (!_tpl.hasOwnProperty(tplLevel)) {
            _tpl[tplLevel] = {};
          }

          _tpl[tplLevel][tplName] = tplLevel == "data" ? JSON.parse(tplOutput) : tplOutput;

          // Remove script after get data
          if ($this.next("script").length) {
            $this.next("script").remove();
          }

          // After loading all the templates completely
          if ((tplTotal - 1) == i) {
            // Remove templates from back-end stage
            $nmeTplItems.remove();

            // Execute the main function
            _nmeMain();
          }
        });
      }
    },
    open: function(elem) {
      var $elem = $(elem);
      if ($elem.length) {
      }
      else {
        _debug("\"" + elem + "\" can not open, because this element has not existed yet.");
      }
    },
    close: function(elem) {
      var $elem = $(elem);
      if ($elem.length) {
      }
      else {
        _debug("\"" + elem + "\" can not close, because this element has not existed yet.");
      }
    }
  };

  /**
   * Extend
   */

  /**
   *
   * ============================
   * Public static functions
   * ============================
   *
   */
   $.nmEditor = {
    instance: null
   };

  // Plugin definition
  $.fn.nmEditor = function(options) {
    // Extend our default options with those provided
    _nmeOptions = $.extend({}, $.fn.nmEditor.defaults, options);

    // Plugin implementation
    _qs = _parseQueryString(_query);

    if (_nmeOptions.debugMode && _qs.debug) {
      _debugMode = _qs.debug;

      if (_debugMode) {
        $("html").addClass("is-debug");
      }
    }

    _container = this.selector;
    _debug(_container);
    _checkNmeInstance();

    return this;
  };

  // Plugin defaults options
  $.fn.nmEditor.defaults = {
    dataLoadSource: "#mailing_content_data",
    debugMode: false
  };
}(jQuery));