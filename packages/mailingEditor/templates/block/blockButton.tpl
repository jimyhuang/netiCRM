{*
Template name: blockButton.tpl
Base on: example/templates/block/block--button--mailchimp.html

===================================
Class name mapping of nmeEditor and mailchimp:
===================================
nmeb-button nmeb | mcnButtonBlock
nmeb-outer | mcnButtonBlockOuter
nmeb-inner | mcnButtonBlockInner
nmeb-content-container | mcnButtonContentContainer
nmeb-content | mcnButtonContent
nmee-button nme-elem | mcnButton

===================================
Setting mapping
===================================
block (nmeb-inner): block padding
elemContainer (nmeb-content-container): button border, background
elemContainerInner (nmeb-content): button padding, font-family, font-size
elem (nme-elem): button font, text, color
*}

<textarea class="nme-tpl" data-template-level="block" data-template-name="button">
{* Template Content: BEGIN *}
<table data-id="[nmeBlockID]" data-type="[nmeBlockType]" border="0" cellpadding="0" cellspacing="0" width="100%" class="nmeb-button nmeb" style="min-width: 100%;">
  <tbody class="nmeb-outer">
    <tr>
      <td class="nmeb-inner" data-settings-target="block" style="padding-top: 0; padding-right: 18px; padding-bottom: 18px; padding-left:18px; text-align: center;" valign="top" align="center">
        <!--[if mso]>
          <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
          <tr>
        <![endif]-->
        <!--[if mso]>
          <td align="center" valign="top" width="600" style="width:600px;">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" class="nmeb-content-container" data-settings-target="elemContainer"  style="border-collapse: separate !important; border-radius: 3px; background-color: rgb(0, 159, 199); margin-left: auto; margin-right: auto;">
          <tbody>
            <tr>
              <td align="center" valign="middle" class="nmeb-content" data-settings-target="elemContainerInner" style="font-family: Helvetica; font-size: 18px; padding: 18px;">
                <a class="nmee-button nme-elem" href="#" target="_blank" data-settings-target="elem" style="display: inline; margin: 0; font-weight: bold; letter-spacing: 0; line-height: 100%; text-align: center; text-decoration: none; color: rgb(255, 255, 255);">[Button Text HERE]</a>
              </td>
            </tr>
          </tbody>
        </table>
        <!--[if mso]>
          </td>
        <![endif]-->
        <!--[if mso]>
          </tr>
          </table>
        <![endif]-->
      </td>
    </tr>
  </tbody>
</table>
{* Template Content: END *}
</textarea>