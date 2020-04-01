<?php
class CRM_Import_ImportJob_Contact extends CRM_Import_ImportJob {
  protected $_doGeocodeAddress;

  public $_newGroupName;
  public $_newGroupDesc;
  public $_groups;
  public $_allGroups;
  public $_newTagName;
  public $_newTagDesc;
  public $_tag;
  public $_allTags;

  protected $_mapperRelated;
  protected $_mapperRelatedContactType;
  protected $_mapperRelatedContactDetails;
  protected $_mapperRelatedContactLocType;
  protected $_mapperRelatedContactPhoneType;
  protected $_mapperRelatedContactImProvider;
  protected $_mapperRelatedContactWebsiteType;

  protected $_groupAdditions;
  protected $_tagAdditions;

  public function __construct($tableName = NULL, $createSql = NULL, $createTable = FALSE) {
    parent::__construct($tableName);

    //initialize the properties.
    $properties = array('mapperKeys',
      'mapperRelated',
      'mapperLocTypes',
      'mapperPhoneTypes',
      'mapperImProviders',
      'mapperWebsiteTypes',
      'mapperRelatedContactType',
      'mapperRelatedContactDetails',
      'mapperRelatedContactLocType',
      'mapperRelatedContactPhoneType',
      'mapperRelatedContactImProvider',
      'mapperRelatedContactWebsiteType',
    );
    foreach ($properties as $property) {
      $this->{"_$property"} = array();
    }
    $this->_groupAdditions = array();
    $this->_tagAdditions = array();
  }

  public function runImport(&$form) {
    global $civicrm_batch;
    $allArgs = func_get_args();
    if (empty($civicrm_batch)) {
      if ($this->_totalRowCount > CRM_Import_ImportJob::BATCH_THRESHOLD) {
        $fileName = str_replace('civicrm_import_job_', '', $this->_tableName);
        $config = CRM_Core_Config::singleton();
        $file = $config->uploadDir.'/import_contact_'.$fileName.'.zip';
        $batchParams = array(
          'label' => ts('Import Contacts'),
          'startCallback' => array($this, 'batchStartCallback'),
          'startCallback_args' => NULL,
          'processCallback' => array($this, __FUNCTION__),
          'processCallbackArgs' => $allArgs,
          'finishCallback' => array(__CLASS__, 'batchFinishCallback'), // should zip all errors
          'finishCallbackArgs' => NULL,
          'download' => array(
            'header' => array(
              'Content-Type: application/zip',
              'Content-Transfer-Encoding: Binary',
              'Content-Disposition: attachment;filename="'.$file.'"',
            ),
            'file' => $file,
          ),
          'actionPermission' => '',
          'total' => $this->_totalRowCount,
          'processed' => 0,
        );
        $batch = new CRM_Batch_BAO_Batch();
        $batch->start($batchParams);

        // redirect to notice page
        CRM_Core_Session::setStatus(ts("Because of the large amount of data you are about to perform, we have scheduled this job for the batch process. You will receive an email notification when the work is completed."));
        CRM_Utils_System::redirect(CRM_Utils_System::url('civicrm/admin/batch', "reset=1&id={$batch->_id}"));
      }
    }
    else {
      // unserialized batch object need re-init controller
      $this->prepareSessionObject($form);
    }

    $mapper = $this->_mapper;
    $mapperFields = array();
    $phoneTypes = CRM_Core_PseudoConstant::phoneType();
    $imProviders = CRM_Core_PseudoConstant::IMProvider();
    $websiteTypes = CRM_Core_PseudoConstant::websiteType();
    $locationTypes = CRM_Core_PseudoConstant::locationType();

    //initialize mapper perperty value.
    $mapperPeroperties = array('mapperRelated' => 'mapperRelatedVal',
      'mapperLocTypes' => 'mapperLocTypesVal',
      'mapperPhoneTypes' => 'mapperPhoneTypesVal',
      'mapperImProviders' => 'mapperImProvidersVal',
      'mapperWebsiteTypes' => 'mapperWebsiteTypesVal',
      'mapperRelatedContactType' => 'mapperRelatedContactTypeVal',
      'mapperRelatedContactDetails' => 'mapperRelatedContactDetailsVal',
      'mapperRelatedContactLocType' => 'mapperRelatedContactLocTypeVal',
      'mapperRelatedContactPhoneType' => 'mapperRelatedContactPhoneTypeVal',
      'mapperRelatedContactImProvider' => 'mapperRelatedContactImProviderVal',
      'mapperRelatedContactWebsiteType' => 'mapperRelatedContactWebsiteTypeVal',
    );

    foreach ($mapper as $key => $value) {
      //set respective mapper value to null.
      foreach (array_values($mapperPeroperties) as $perpertyVal)$$perpertyVal = NULL;

      $header = array($this->_mapFields[$fldName]);
      $fldName = CRM_Utils_Array::value(0, $mapper[$key]);
      $selOne = CRM_Utils_Array::value(1, $mapper[$key]);
      $selTwo = CRM_Utils_Array::value(2, $mapper[$key]);
      $selThree = CRM_Utils_Array::value(3, $mapper[$key]);
      $this->_mapperKeys[$key] = $fldName;

      //need to differentiate non location elements.
      if ($selOne && is_numeric($selOne)) {
        if ($fldName == 'url') {
          $header[] = $websiteTypes[$selOne];
          $mapperWebsiteTypesVal = $selOne;
        }
        else {
          $header[] = $locationTypes[$selOne];
          $mapperLocTypesVal = $selOne;
          if ($selTwo && is_numeric($selTwo)) {
            if ($fldName == 'phone') {
              $header[] = $phoneTypes[$selTwo];
              $mapperPhoneTypesVal = $selTwo;
            }
            elseif ($fldName == 'im') {
              $header[] = $imProviders[$selTwo];
              $mapperImProvidersVal = $selTwo;
            }
          }
        }
      }

      list($id, $first, $second) = explode('_', $fldName, 3);
      if (($first == 'a' && $second == 'b') ||
        ($first == 'b' && $second == 'a')
      ) {

        $header[] = ucwords(str_replace("_", " ", $selOne));

        $relationType = new CRM_Contact_DAO_RelationshipType();
        $relationType->id = $id;
        $relationType->find(TRUE);
        $mapperRelatedContactTypeVal = $relationType->{"contact_type_$second"};

        $mapperRelatedVal = $fldName;
        if ($selOne) {
          $mapperRelatedContactDetailsVal = $selOne;
          if ($selTwo) {
            if ($selOne == 'url') {
              $header[] = $websiteTypes[$selTwo];
              $mapperRelatedContactWebsiteTypeVal = $selTwo;
            }
            else {
              $header[] = $locationTypes[$selTwo];
              $mapperRelatedContactLocTypeVal = $selTwo;
              if ($selThree) {
                if ($selOne == 'phone') {
                  $header[] = $phoneTypes[$selThree];
                  $mapperRelatedContactPhoneTypeVal = $selThree;
                }
                elseif ($selOne == 'im') {
                  $header[] = $imProviders[$selThree];
                  $mapperRelatedContactImProviderVal = $selThree;
                }
              }
            }
          }
        }
      }
      $mapperFields[] = implode(' - ', $header);

      //set the respective mapper param array values.
      foreach ($mapperPeroperties as $mapperProKey => $mapperProVal) {
        $this->{"_$mapperProKey"}[$key] = $$mapperProVal;
      }
    }

    require_once 'CRM/Import/Parser/Contact.php';
    $this->_parser = new CRM_Import_Parser_Contact(
      $this->_mapperKeys,
      $this->_mapperLocTypes,
      $this->_mapperPhoneTypes,
      $this->_mapperImProviders,
      $this->_mapperRelated,
      $this->_mapperRelatedContactType,
      $this->_mapperRelatedContactDetails,
      $this->_mapperRelatedContactLocType,
      $this->_mapperRelatedContactPhoneType,
      $this->_mapperRelatedContactImProvider,
      $this->_mapperWebsiteTypes,
      $this->_mapperRelatedContactWebsiteType
    );
    if (!empty($form->_dedupeRuleGroupId)) {
      $this->_parser->_dedupeRuleGroupId = $form->_dedupeRuleGroupId;
    }
    $this->_parser->_job = $this;

    // set max process lines per batch
    if ($civicrm_batch) {
      $this->_parser->setMaxLinesToProcess(CRM_Import_ImportJob::BATCH_LIMIT);
    }
    $this->_parser->run($this->_tableName, $mapperFields,
      CRM_Import_Parser::MODE_IMPORT,
      $this->_contactType,
      $this->_primaryKeyName,
      $this->_statusFieldName,
      $this->_onDuplicate,
      $this->_statusID,
      $this->_totalRowCount,
      $this->_doGeocodeAddress,
      NULL,
      $this->_contactSubType
    );

    // set all processed data to form
    $this->_parser->set($form, CRM_Import_Parser::MODE_IMPORT);
    $processedRowCount = $form->get('rowCount');
    if ($processedRowCount > 0 && !empty($civicrm_batch)) {
      $civicrm_batch->data['processed'] += $processedRowCount;
    }

    $contactIds = $this->_parser->getImportedContacts();

    //get the related contactIds. CRM-2926
    $relatedContactIds = $this->_parser->getRelatedImportedContacts();
    if ($relatedContactIds) {
      $contactIds = array_merge($contactIds, $relatedContactIds);
      if ($form) {
        $form->_relatedCount = count($relatedContactIds);
        $form->set('relatedCount', count($relatedContactIds));
      }
    }

    if ($this->_newGroupName || count($this->_groups)) {
      if ($form) {
        $form->_groupAdditions = $this->_groupAdditions;
        $form->set('groupAdditions', $this->_groupAdditions);
      }
    }

    if ($this->_newTagName || count($this->_tag)) {
      if ($form) {
        $form->_newTagName = $this->_tagAdditions;
        $form->set('tagAdditions', $this->_tagAdditions);
      }
    }
  }

  public function prepareSessionObject(&$form) {
    $form->controller->initTemplate();
    $form->controller->initSession();
    $name = $form->controller->_name;
    $scope = CRM_Utils_System::getClassName($form->controller);
    $scope .= '_'.$form->controller->_key;
    CRM_Core_Session::registerAndRetrieveSessionObjects(array("_{$name}_container", array('CiviCRM', $scope)));
  }

  public function batchStartCallback() {
    global $civicrm_batch;
    if ($civicrm_batch) {
      $query = "SELECT COUNT(*) FROM $this->_tableName WHERE $this->_statusFieldName != 'NEW'";
      $processed = CRM_Core_DAO::singleValueQuery($query);
      $civicrm_batch->data['processed'] += $processed;
    }
  }

  public function batchFinishCallback() {
    global $civicrm_batch;
    if ($civicrm_batch) {
    }
  }

  public function addContactToGroupTag($contactId, $groups = array(), $tags = array()) {
    static $existsGroups, $existsTag;

    $contactIds = array($contactId);
    if(!empty($groups) && is_array($groups)) {
      foreach ($groups as $groupName) {
        $groupId = 0;
        if ($existsGroups[$groupName]) {
          $groupId = $existsGroups[$groupName];
        }
        else{
          $query = "SELECT id FROM civicrm_group WHERE title LIKE %1";
          $groupId = CRM_Core_DAO::singleValueQuery($query, array(1 => array($groupName, 'String')));
          if (empty($groupId)) {
            $gParams = array(
              'title' => $groupName,
              'description' => '',
              'is_active' => TRUE,
            );
            $group = CRM_Contact_BAO_Group::create($gParams);
            $groupId = $group->id;
          }
        }
        $existsGroups[$groupName] = $groupId;
        CRM_Contact_BAO_GroupContact::addContactsToGroup($contactIds, $groupId);
      }
    }

    if(!empty($tags) && is_array($tags)) {
      foreach ($tags as $tagName) {
        if ($existsTag[$tagName]) {
          $tagId = $existsTag[$tagName];
        }
        else {
          $query = "SELECT id FROM civicrm_tag WHERE name LIKE %1";
          $tagId = CRM_Core_DAO::singleValueQuery($query, array(1 => array($tagName, 'String')));
          if (empty($tagId)) {
            $tagParams = array(
              'name' => $tagName,
              'title' => $tagName,
              'description' => '',
              'is_selectable' => TRUE,
              'used_for' => 'civicrm_contact',
            );
            $id = array();
            $tag = CRM_Core_BAO_Tag::add($tagParams, $id);
            $tagId = $tag->id;
          }
        }
        $existsTag[$tagName] = $tagId;
        $addTagCount = CRM_Core_BAO_EntityTag::addEntitiesToTag($contactIds, $tagId);
      }
    }
  }

  public function addImportedContactsToNewGroup($contactIds, $newGroupName, $newGroupDesc) {
    static $newGroupId;

    if ($newGroupName && empty($newGroupId)) {
      /* Create a new group */

      $gParams = array(
        'title' => $newGroupName,
        'description' => $newGroupDesc,
        'is_active' => TRUE,
      );
      $group = CRM_Contact_BAO_Group::create($gParams);
      $newGroupId = $group->id;
      $this->_groupAdditions[$newGroupId]['new'] = TRUE;
      $this->_groups[] = $newGroupId;
    }

    if (is_array($this->_groups)) {
      foreach ($this->_groups as $groupId) {
        $addCount = CRM_Contact_BAO_GroupContact::addContactsToGroup($contactIds, $groupId);
        $totalCount = $addCount[1];
        if ($groupId == $newGroupId) {
          $name = $newGroupName;
          $new = TRUE;
        }
        else {
          $name = $this->_allGroups[$groupId];
          $new = FALSE;
        }
        if (!isset($this->_groupAdditions[$groupId]['name'])) {
          $this->_groupAdditions[$groupId]['name'] = $name;
          $this->_groupAdditions[$groupId]['url'] = CRM_Utils_System::url('civicrm/group/search', 'reset=1&force=1&context=smog&gid=' . $groupId);
          $this->_groupAdditions[$groupId]['added'] = 0;
          $this->_groupAdditions[$groupId]['notAdded'] = 0;
        }
        $this->_groupAdditions[$groupId]['added'] += $totalCount;
        $this->_groupAdditions[$groupId]['notAdded'] += $addCount[2];
      }
    }
    return FALSE;
  }


  public function tagImportedContactsWithNewTag($contactIds, $newTagName, $newTagDesc) {
    static $newTagId;

    if ($newTagName && empty($newTagId)) {
      /* Create a new Tag */

      $tagParams = array(
        'name' => $newTagName,
        'title' => $newTagName,
        'description' => $newTagDesc,
        'is_selectable' => TRUE,
        'used_for' => 'civicrm_contact',
      );
      require_once 'CRM/Core/BAO/Tag.php';
      $id = array();
      $addedTag = CRM_Core_BAO_Tag::add($tagParams, $id);
      $newTagId = $addedTag->id;
      $this->_tagAdditions[$newTagId]['new'] = TRUE;
      $this->_tag[$newTagId] = 1;
    }

    //add Tag to Import
    if (is_array($this->_tag)) {
      require_once "CRM/Core/BAO/EntityTag.php";
      foreach ($this->_tag as $tagId => $val) {
        $addTagCount = CRM_Core_BAO_EntityTag::addEntitiesToTag($contactIds, $tagId);
        $totalTagCount = $addTagCount[1];
        if ($tagId == $addedTag->id) {
          $tagName = $newTagName;
          $new = TRUE;
        }
        else {
          $tagName = $this->_allTags[$tagId];
          $new = FALSE;
        }
        if (!isset($this->_tagAdditions[$tagId]['name'])) {
          $this->_tagAdditions[$tagId]['name'] = $tagName;
          $this->_tagAdditions[$tagId]['url'] = CRM_Utils_System::url('civicrm/contact/search', 'reset=1&force=1&tid=' . $tagId);
          $this->_tagAdditions[$tagId]['added'] = 0;
          $this->_tagAdditions[$tagId]['notAdded'] = 0;
        }
        $this->_tagAdditions[$tagId]['added'] += $totalTagCount;
        $this->_tagAdditions[$tagId]['notAdded'] += $addTagCount[2];
      }
    }
    return FALSE;
  }
}