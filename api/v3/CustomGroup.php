<?php
// $Id$

/*
 +--------------------------------------------------------------------+
 | CiviCRM version 4.2                                                |
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC (c) 2004-2012                                |
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
 * File for the CiviCRM APIv3 custom group functions
 *
 * @package CiviCRM_APIv3
 * @subpackage API_CustomGroup
 *
 * @copyright CiviCRM LLC (c) 2004-2012
 * @version $Id: CustomGroup.php 30879 2010-11-22 15:45:55Z shot $
 */


require_once 'CRM/Core/BAO/CustomGroup.php';

/**
 * Most API functions take in associative arrays ( name => value pairs
 * as parameters. Some of the most commonly used parameters are
 * described below
 *
 * @param array $params           an associative array used in construction
 * retrieval of the object
 * @todo missing get function
 *
 *
 */

/**
 * Use this API to create a new group.  The 'extends' value accepts an array or a comma separated string.
 * e.g array(
   'Individual','Contact') or 'Individual,Contact'
 * See the CRM Data Model for custom_group property definitions
 * $params['class_name'] is a required field, class being extended.
 *
 * @param $params     array   Associative array of property name/value pairs to insert in group.
 * {@getfields CustomGroup_create}
 *
 * @return   Newly create custom_group object
 * @todo $params['extends'] is array format - is that std compatible
 * @todo review custom field create if 'html' approx line 110
 * @access public
 */
function civicrm_api3_custom_group_create($params) {
  if (is_string($params['extends'])) {
    $extends = explode(",", $params['extends']);
    unset($params['extends']);
    $params['extends'] = $extends;
  }
  if (!isset($params['extends'][0]) || !trim($params['extends'][0])) {
    return civicrm_api3_create_error("First item in params['extends'] must be a class name (e.g. 'Contact').");
  }
  if (isset($params['extends_entity_column_value']) && !is_array($params['extends_entity_column_value'])) {
    // BAO fails if this is a string, but API getFields says this must be a string, so we'll do a double backflip
    $params['extends_entity_column_value'] = CRM_Utils_Array::explodePadded($params['extends_entity_column_value']);
  }


  $customGroup = CRM_Core_BAO_CustomGroup::create($params);
  $values = array(
    $customGroup->id => array(),
  );
  _civicrm_api3_object_to_array($customGroup, $values[$customGroup->id]);

  if (CRM_Utils_Array::value('html_type', $params)) {
    $fparams = array(
      'custom_group_id' => $customGroup->id,
      'version' => $params['version'],
      // should put something cleverer here but this will do for now
      'label' => 'api created field',
    );
    require_once 'api/v3/CustomField.php';
    $fieldValues = civicrm_api3_custom_field_create($fparams);
    $values[$fieldValues['id']] = array_merge($values[$customGroup->id], $fieldValues['values'][$fieldValues['id']]);
  }
  return civicrm_api3_create_success($values, $params, 'custom_group', $customGroup);
}

/*
 * Adjust Metadata for Create action
 * 
 * @param array $params array or parameters determined by getfields
 */
function _civicrm_api3_custom_group_create_spec(&$params) {
  $params['extends']['api.required'] = 1;
  $params['title']['api.required'] = 1;
  $params['style']['api.default'] = 'Inline';
}

/**
 * Use this API to delete an existing group.
 *
 * @param array id of the group to be deleted
 *
 * @return Null if success
 * @access public
 * {@getfields CustomGroup_delete}
 * @example CustomGroupDelete.php
 **/
function civicrm_api3_custom_group_delete($params) {

  $values = new CRM_Core_DAO_CustomGroup();
  $values->id = $params['id'];
  $values->find(TRUE);

  require_once 'CRM/Core/BAO/CustomGroup.php';
  $result = CRM_Core_BAO_CustomGroup::deleteGroup($values, TRUE);
  return $result ? civicrm_api3_create_success() : civicrm_api3_create_error('Error while deleting custom group');
}

/**
 * Use this API to get existing custom fields.
 *
 * @param array $params Array to search on
 *
 * @access public
 * {@getfields CustomGroup_get}
 * @example CustomGroupGet.php
 **/
function civicrm_api3_custom_group_get($params) {
  return _civicrm_api3_basic_get(_civicrm_api3_get_BAO(__FUNCTION__), $params);
}

