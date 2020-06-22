{* Template name: dataButton.tpl *}

<textarea class="nme-tpl" data-template-level="data" data-template-name="button"></textarea>
<script>
{literal}
(function($) {
  let tplData = {
    "id": "",
    "type" : "button",
    "section": "body",
    "data" : "閱讀更多",
    "styles": {
      "block": {
        "padding-top": "10px",
        "padding-right": "10px",
        "padding-bottom": "10px",
        "padding-left": "10px",
        "text-align": "center",
        "background-color": "#ffffff"
      },
      "elemContainer": {
        "margin-left": "auto",
        "margin-right": "auto",
        "border-radius": "3px",
        "background-color": "#222222"
      },
      "elemContainerInner": {
        "padding-top": "10px",
        "padding-right": "10px",
        "padding-bottom": "10px",
        "padding-left": "10px",
        "width": "auto",
        "font-size": "18px"
      },
      "elem": {
        "text-align": "center",
        "letter-spacing": "0",
        "font-weight": "bold",
        "color": "#ffffff"
      }
    },
    "link": "",
    "control": {
      "sortable": true,
      "delete": true,
      "clone": true
    },
    "override": {
      "block": false,
      "elem": false
    },
    "weight" : 0
  };

  $(".nme-tpl[data-template-level='data'][data-template-name='button']").val(JSON.stringify(tplData));
}(jQuery));
{/literal}
</script>