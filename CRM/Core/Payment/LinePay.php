<?php
/*
  +--------------------------------------------------------------------+
  | CiviCRM version 3.3                                                |
  +--------------------------------------------------------------------+
  | This file is a part of CiviCRM.                                    |
  |                                                                    |
  | CiviCRM is free software; you can copy, modify, and distribute it  |
  | under the terms of the GNU Affero General Public License           |
  | Version 3, 19 November 2007 and the CiviCRM Licensing Exception.   |
  |                                                                    |
  | CiviCRM is distributed in the hope that it will be useful, but     |
  | WITHOUT ANY WARRANTY; without even the implied warranty of         |
  | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.               |
  | See the GNU Affero General Public License for more details.        |
  |                                                                    |
  | You should have received a copy of the GNU Affero General Public   |
  | License and the CiviCRM Licensing Exception along                  |
  | with this program; if not, contact CiviCRM LLC                     |
  | at info[AT]civicrm[DOT]org. If you have questions about the        |
  | GNU Affero General Public License or the licensing of CiviCRM,     |
  | see the CiviCRM license FAQ at http://civicrm.org/licensing        |
  +--------------------------------------------------------------------+
*/


/*
 * PxPay Functionality Copyright (C) 2008 Lucas Baker, Logistic Information Systems Limited (Logis)
 * PxAccess Functionality Copyright (C) 2008 Eileen McNaughton
 * Licensed to CiviCRM under the Academic Free License version 3.0.
 *
 * Grateful acknowledgements go to Donald Lobo for invaluable assistance
 * in creating this payment processor module
 */

class CRM_Core_Payment_LinePay {
  function __construct($paymentProcessorId, $type = 'request') {
    $this->_linePayAPI = self::prepareLinePayAPI($paymentProcessorId, $type);
  }

  function doRequest(&$params){

    // prepare confirm url
    $qfKey = $params['qfKey'];
    $contributionId = $params['contributionID'];
    $paymentProcessorId = $params['payment_processor'];
    $confirmQuery = "qfKey={$qfKey}&cid={$contributionId}&ppid={$paymentProcessorId}";

    if(!empty($params['participantID'])){
      $confirmQuery.="&pid={$params['participantID']}";
    }
    if(!empty($params['eventID'])){
      $confirmQuery.="&eid={$params['eventID']}";
    }

    $confirmUrl = CRM_Utils_System::url('civicrm/linepay/confirm', $confirmQuery, True, NULL, False);
    $confirmUrl = self::validateUrlIsHttps($confirmUrl);

    $cancelUrl = self::prepareThankYouUrl($qfKey, True);

    // page title, description
    if(!empty($params['eventID'])){
      $event = new CRM_Event_DAO_Event();
      $event->id = $params['eventID'];
      $event->find(1);
      $page_title = $event->title;
    }else{
      $contribution_pgae = new CRM_Contribute_DAO_ContributionPage();
      $contribution_pgae->id = $params['contributionPageID'];
      $contribution_pgae->find(1);
      $page_title = $contribution_pgae->title;
    }
    $description = !empty($params['amount_level']) ? $page_title . ' - ' . $params['amount_level'] : $page_title;

    // reserve
    $config = CRM_Core_Config::singleton();
    $requestParams = array();
    $requestParams['orderId'] = $params['contributionID'];
    $requestParams['productName'] = $description;
    $requestParams['amount'] = $params['amount']; // integer
    $requestParams['currency'] = $config->defaultCurrency; // please use contribution currency
    $requestParams['confirmUrlType'] = 'CLIENT';
    $requestParams['confirmUrl'] = $confirmUrl;
    $requestParams['checkConfirmUrlBrowser'] = 'true'; // must be string
    $requestParams['capture'] = 'true'; // must be string
    $requestParams['cancelUrl'] = $cancelUrl;

    $result = $this->_linePayAPI->request($requestParams);
    if($this->_linePayAPI->_response->returnMessage == 'Success.' && $this->_linePayAPI->_response->returnCode == '0000'){
      $transactionId = $this->_linePayAPI->_response->info->transactionId;
      if(!empty($transactionId)){
        $contribution = self::prepareContribution($contributionId);
        $contribution->trxn_id = $transactionId;
        $contribution->save();
      }
      CRM_Utils_System::redirect($this->_linePayAPI->_response->info->paymentUrl->web);
    }else{
      $contribution = self::prepareContribution($contributionId);
      $note .= "Error, return code is ".$this->_linePayAPI->_response->returnCode;
      CRM_Core_Payment_Mobile::addNote($note, $contribution);
      CRM_Core_Error::fatal('PaymentProcessor id must be given in url query.');
    }
  }

  static function confirm(){
    foreach ($_GET as $key => $value) {
      if($key == 'q')continue;
      $params[$key] = $value;
    }
    if(empty($params['ppid'])){
      CRM_Core_Error::fatal('PaymentProcessor id must be given in url query.');
    }
    $linePayAPI = new CRM_Core_Payment_LinePay($params['ppid'], 'confirm');
    $linePayAPI->doConfirm($params);
  }

  function doConfirm($params){
    $type = 'linepay';
    $config = CRM_Core_Config::singleton();
    $contribution = self::prepareContribution($params['cid']);

    // confirm
    $requestParams = array();
    $requestParams['transactionId'] = $params['transactionId'];
    $requestParams['amount'] = (int)$contribution->total_amount; // integer
    $requestParams['currency'] = $config->defaultCurrency;
    $result = $this->_linePayAPI->request($requestParams);
    $is_success = $this->_linePayAPI->_success;

    // ipn transact
    $ipn = new CRM_Core_Payment_BaseIPN();
    $input = $ids = $objects = array();
    if(!empty($params['pid']) && !empty($params['eid'])){
      $input['component'] = 'event';
      $ids['participant'] = $params['pid'];
      $ids['event'] = $params['eid'];
    }else{
      $input['component'] = 'contribute';
    }
    $ids['contribution'] = $contribution->id;
    $ids['contact'] = $contribution->contact_id;
    $validate_result = $ipn->validateData($input, $ids, $objects, FALSE);
    if($validate_result){
      $transaction = new CRM_Core_Transaction();
      if($is_success){
        $input['payment_instrument_id'] = $contribution->payment_instrument_id;
        $input['amount'] = $contribution->amount;
        $objects['contribution']->receive_date = date('YmdHis');
        $transaction_result = $ipn->completeTransaction($input, $ids, $objects, $transaction);
        $thankyou_url = self::prepareThankYouUrl($params['qfKey']);
      }else{
        $ipn->failed($objects, $transaction, $error);
        $note .= $error . "returnCode: {$this->_linePayAPI->_response->returnCode}";
        CRM_Core_Payment_Mobile::addNote($note, $contribution);
        $thankyou_url = self::prepareThankYouUrl($params['qfKey'], True);
      }
    }else{
      $thankyou_url = self::prepareThankYouUrl($params['qfKey'], True);
    }

    CRM_Utils_System::redirect($thankyou_url);
  }

  private static function prepareContribution($contributionId){
    $contribution = new CRM_Contribute_DAO_Contribution();
    $contribution->id = $contributionId;
    $contribution->find(TRUE);
    return $contribution;
  }

  private static function prepareLinePayAPI($paymentProcessorId, $type = 'request'){
    $paymentProcessor = new CRM_Core_DAO_PaymentProcessor();
    $paymentProcessor->id = $paymentProcessorId;
    $paymentProcessor->find(TRUE);

    $apiParams = array(
      'channelId' => $paymentProcessor->url_site,
      'channelSecret' => $paymentProcessor->url_api,
      'apiType' => $type,
      'isTest' => $paymentProcessor->is_test,
    );
    return new CRM_Core_Payment_LinePayAPI($apiParams);
  }

  private static function prepareThankYouUrl($qfKey, $failed = false){
    $query = "_qf_ThankYou_display=1&qfKey={$qfKey}";
    $query .= $failed ? '&result=4' : '&result=1';
    $url = CRM_Utils_System::url('civicrm/contribute/transact', $query, True, NULL, False);
    $url = self::validateUrlIsHttps($url);
    return $url;
  }

  private static function validateUrlIsHttps($url){
    if( ( !empty($_SERVER['HTTP_HTTPS']) && $_SERVER['HTTP_HTTPS'] == 'on' ) || ( !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') ){
      $url = str_replace('http://', 'https://', $url);
    }
    return $url;
  }
}
