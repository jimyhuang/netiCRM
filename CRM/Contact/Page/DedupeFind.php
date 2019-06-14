<?php
/*
 +--------------------------------------------------------------------+
 | CiviCRM version 3.3                                                |
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC (c) 2004-2010                                |
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

/**
 *
 * @package CRM
 * @copyright CiviCRM LLC (c) 2004-2010
 * $Id$
 *
 */

class CRM_Contact_Page_DedupeFind extends CRM_Core_Page_Basic {
  protected $_cid = NULL;
  protected $_rgid;
  protected $_mainContacts;
  protected $_gid;

  /**
   * Get BAO Name
   *
   * @return string Classname of BAO.
   */
  function getBAOName() {
    return 'CRM_Dedupe_BAO_RuleGroup';
  }

  /**
   * Get action Links
   *
   * @return array (reference) of action links
   */
  function &links() {}

  /**
   * Browse all rule groups
   *
   * @return void
   * @access public
   */
  function run() {
    set_time_limit(1800);
    $this->_gid = CRM_Utils_Request::retrieve('gid', 'Positive', $this, FALSE, 0);
    $action = CRM_Utils_Request::retrieve('action', 'String', $this, FALSE, 0);
    $this->_context = CRM_Utils_Request::retrieve('context', 'String', $this);
    $this->_cid = CRM_Utils_Request::retrieve('cid', 'Positive', $this, FALSE, 0);
    $this->_rgid = CRM_Utils_Request::retrieve('rgid', 'Positive', $this, FALSE, 0);
    $this->_cachePath = $this->_context == 'search' ? 'search_dedupe_dupes_' : 'dedupe_dupes_';
    $this->_cachePath .= $this->_gid.'_'.$this->_rgid;
    $this->_currentPage = CRM_Utils_Request::retrieve(CRM_Utils_Pager::PAGE_ID, 'Integer', $this, FALSE, 1);
    $this->_numPerPage = CRM_Utils_Request::retrieve(CRM_Utils_Pager::PAGE_ROWCOUNT, 'Integer', $this, FALSE, 25);

    $session = CRM_Core_Session::singleton();
    $this->_contactIds = $session->get('selectedSearchContactIds');
    if ($this->_context == 'search' || !empty($this->_contactIds)) {
      $this->_context = 'search';
      $str = implode('|',$this->_contactIds);
      $this->_cachePath .= '_'.md5($str);
      $backURL = $session->readUserContext();
    }
    else {
      $backURL = CRM_Utils_System::url('civicrm/contact/dedupefind', "reset=1&rgid={$this->rgid}&action=preview");
    }
    $this->assign('backURL', $this->get('backURL'));
    if ($action & CRM_Core_Action::RENEW) {
      $success = $this->purgeFoundDupes();
      CRM_Utils_System::redirect($backURL);
    }
    elseif ($action & CRM_Core_Action::MAP) {
      $merged = $this->batchMergeDupes(); 
      $session->setStatus(ts("Merged %1 pairs of contacts.", array(1 => count($merged))));
      $this->purgeFoundDupes();
      $url = CRM_Utils_System::url('civicrm/contact/dedupefind', "reset=1&rgid={$this->rgid}&action=preview");
      CRM_Utils_System::redirect($url);
    }
    elseif ($action & CRM_Core_Action::UPDATE || $action & CRM_Core_Action::BROWSE) {
      $this->action = CRM_Core_Action::UPDATE;

      // get cache when available
      $foundDupes = $this->getFoundDupes();

      if (empty($foundDupes)) {
        if ($this->_gid) {
          $foundDupes = CRM_Dedupe_Finder::dupesInGroup($this->_rgid, $this->_gid);
        }
        // do not cache this
        elseif (!empty($this->_contactIds)) {
          $foundDupes = CRM_Dedupe_Finder::dupes($this->_rgid, $this->_contactIds);
        }
        else {
          $foundDupes = CRM_Dedupe_Finder::dupes($this->_rgid);
        }
        if (!empty($foundDupes)) {
          $this->storeFoundDupes($foundDupes);
        }
      }
      if (!$foundDupes) {
        $ruleGroup = new CRM_Dedupe_BAO_RuleGroup();
        $ruleGroup->id = $this->_rgid;
        $ruleGroup->find(TRUE);

        $session = CRM_Core_Session::singleton();
        $session->setStatus(ts("No possible duplicates were found using %1 rule.", array(1 => $ruleGroup->name)));
        CRM_Utils_System::redirect($backURL);
      }
      else {
        $this->_cids = array();
        if (count($foundDupes) > $this->_numPerPage) {
          $this->pager(count($foundDupes));
        }
        // pager slice
        $foundDupes = array_slice($foundDupes, ($this->_currentPage-1)*$this->_numPerPage, $this->_numPerPage);

        foreach ($foundDupes as $dupe) {
          $this->_cids[$dupe[0]] = 1;
          $this->_cids[$dupe[1]] = 1;
        }
        $this->_cidString = implode(', ', array_keys($this->_cids));
        $sql = "SELECT id, sort_name FROM civicrm_contact WHERE id IN ($this->_cidString) ORDER BY sort_name";
        $dao = new CRM_Core_DAO();
        $dao->query($sql);
        $displayNames = array();
        while ($dao->fetch()) {
          $displayNames[$dao->id] = $dao->sort_name;
        }
        // FIXME: sort the contacts; $displayName
        // is already sort_name-sorted, so use that
        // (also, consider sorting by dupe count first)
        // lobo - change the sort to by threshold value
        // so the more likely dupes are sorted first
        $session = CRM_Core_Session::singleton();
        $userId = $session->get('userID');
        $mainContacts = array();
        foreach ($foundDupes as $dupes) {
          $dstID = $dupes[0];
          $srcID = $dupes[1];
          if ($dstID == $userId) {
            $dstID = $dupes[1];
            $srcID = $dupes[0];
          }
          $canMerge = (CRM_Contact_BAO_Contact_Permission::allow($dstID, CRM_Core_Permission::EDIT) && CRM_Contact_BAO_Contact_Permission::allow($srcID, CRM_Core_Permission::EDIT));

          $conflicts = array();
          $batchMerge = TRUE;
          if ($canMerge) {
            $dupePairs = array(
              0 => array(
                'dstID' => $dstID,
                'srcID' => $srcID,
              ),
            );
            $testResult = CRM_Dedupe_Merger::merge($dupePairs, array(), 'safe', FALSE, FALSE, CRM_Core_Action::PREVIEW);
            if (!empty($testResult['skipped'])) {
              $conflicts = CRM_Dedupe_Merger::formatReason($testResult['skipped'][0]['reason']);
              $batchMerge = FALSE;
            }
          }

          $mainContacts[] = array('srcID' => $srcID,
            'srcName' => $displayNames[$srcID],
            'dstID' => $dstID,
            'dstName' => $displayNames[$dstID],
            'weight' => $dupes[2],
            'conflicts' => $conflicts,
            'canMerge' => $canMerge,
            'batchMerge' => $batchMerge,
          );
        }
        $this->_mainContacts = $mainContacts;

        $session = CRM_Core_Session::singleton();
        if ($this->_cid) {
          $session->pushUserContext(CRM_Utils_System::url('civicrm/contact/deduperules', "action=update&rgid={$this->_rgid}&gid={$this->_gid}&cid={$this->_cid}"));
        }
        else {
          $session->pushUserContext(CRM_Utils_System::url('civicrm/contact/dedupefind', "reset=1&action=update&rgid={$this->_rgid}"));
        }
      }
      $this->assign('action', $this->action);
      $this->browse();
    }
    else {
      $this->action = CRM_Core_Action::UPDATE;
      $this->edit($this->action);
      $this->assign('action', $this->action);
    }
    $this->assign('context', $this->_context);

    // parent run
    parent::run();
  }

  /**
   * Browse all rule groups
   *
   * @return void
   * @access public
   */
  function browse() {
    $this->assign('main_contacts', $this->_mainContacts);

    if ($this->_cid) {
      $this->assign('cid', $this->_cid);
    }
    if (isset($this->_gid) || $this->_gid) {
      $this->assign('gid', $this->_gid);
    }
    $this->assign('rgid', $this->_rgid);
  }

  /**
   * Get name of edit form
   *
   * @return string  classname of edit form
   */
  function editForm() {
    return 'CRM_Contact_Form_DedupeFind';
  }

  /**
   * Get edit form name
   *
   * @return string  name of this page
   */
  function editName() {
    return 'DedupeFind';
  }

  /**
   * Get user context
   *
   * @return string  user context
   */
  function userContext($mode = NULL) {
    return 'civicrm/contact/dedupefind';
  }

  function storeFoundDupes($dupes) {
    CRM_Core_BAO_Cache::setItem($dupes, 'Dedupe Found Dupes', $this->_cachePath);
  }

  function getFoundDupes() {
    $createdTime = CRM_REQUEST_TIME - 3600*6; // 6 hours
    return CRM_Core_BAO_Cache::getItem('Dedupe Found Dupes', $this->_cachePath, NULL, $createdTime);
  }

  function purgeFoundDupes() {
    return CRM_Core_BAO_Cache::deleteItem('Dedupe Found Dupes', $this->_cachePath);
  }

  function batchMergeDupes() {
    $session = CRM_Core_Session::singleton();
    $userId = $session->get('userID');
    $foundDupes = $this->getFoundDupes();
    $merged = $delay = $pairs = $temp = array();
    if (!empty($foundDupes)) {
      // calculate delay merge
      foreach ($foundDupes as $dupes) {
        $dstID = $dupes[0];
        $srcID = $dupes[1];
        if ($dstID == $userId) {
          $dstID = $dupes[1];
          $srcID = $dupes[0];
        }
        $pairs[] = array(
          'src' => $srcID,
          'dst' => $dstID,
        );
        $temp[$srcID]++;
      }
      foreach($pairs as $pair) {
        if (isset($temp[$pair['dst']])) { // delay only when dst exists on src
          $delay[$pair['dst']] = 1;
        }
      }

      // first run - delay some pairs for later merge
      foreach ($pairs as $key => $pair) {
        if (isset($delay[$pair['src']])) {
          continue;
        }
        $dupePairs = array(
          0 => array(
            'srcID' => $pair['src'],
            'dstID' => $pair['dst'],
          ),
        );
        $result = CRM_Dedupe_Merger::merge($dupePairs, array(), 'safe', FALSE, FALSE, CRM_Core_Action::UPDATE);
        if (!empty($result['merged'][0])) {
          $merged[] = $result['merged'][0];
          unset($pairs[$key]);
        }
      }

      // second run - run remain pairs
    }
    return $merged;
  }

  function pager($total) {
    $params = array();
    $params['status'] = '';
    $params['csvString'] = NULL;
    $params['buttonTop'] = 'PagerTopButton';
    $params['buttonBottom'] = 'PagerBottomButton';
    $params['rowCount'] = $this->get(CRM_Utils_Pager::PAGE_ROWCOUNT);
    if (!$params['rowCount']) {
      $params['rowCount'] = $this->_numPerPage;
    }

    $params['total'] = $total;
    $this->_pager = new CRM_Utils_Pager($params);
    $this->assign_by_ref('pager', $this->_pager);
  }

}

